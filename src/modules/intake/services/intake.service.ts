import { prisma } from "@/shared/database/prisma";
import { CreateIntakeRequestInput, CreateIntakeRequestSchema, ClientCounselingRequestDto } from "../dto/intake.dto";
import { NotFoundError, ValidationError, ForbiddenError } from "@/shared/errors";
import { AuditService } from "@/modules/audit/audit.service";
import { CounselingRequestStatus, VerificationStatus } from "@prisma/client";

// Crisis keywords for automated triage escalation
const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end my life",
  "self-harm",
  "cutting myself",
  "want to die",
  "don't want to live",
  "overdose",
];

export class IntakeService {
  /**
   * Scans text for critical distress signals requiring operational escalation.
   */
  static detectCrisisSignals(summary: string): boolean {
    const lower = summary.toLowerCase();
    return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
  }

  /**
   * Submits a counseling request (Path A direct or Path B guided matching).
   */
  static async submitIntake(userId: string, input: CreateIntakeRequestInput): Promise<{ requestId: string; isEscalated: boolean }> {
    const validated = CreateIntakeRequestSchema.parse(input);

    // 1. Ensure Client Profile exists for this user
    let clientProfile = await prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      clientProfile = await prisma.clientProfile.create({
        data: {
          userId,
          fullName: validated.fullName,
          phoneNumber: validated.phoneNumber,
          preferredLanguage: validated.preferredLanguage,
        },
      });
    } else {
      // Update phone or language if provided and changed
      clientProfile = await prisma.clientProfile.update({
        where: { id: clientProfile.id },
        data: {
          fullName: validated.fullName,
          phoneNumber: validated.phoneNumber ?? clientProfile.phoneNumber,
          preferredLanguage: validated.preferredLanguage ?? clientProfile.preferredLanguage,
        },
      });
    }

    // 2. If target psychologist specified (Path A), verify they are verified & active
    let targetPsychologistId: string | null = null;
    if (validated.targetPsychologistId) {
      const target = await prisma.psychologistProfile.findUnique({
        where: { id: validated.targetPsychologistId },
        select: { id: true, verificationStatus: true, profileState: true },
      });

      if (!target || target.verificationStatus !== VerificationStatus.VERIFIED || target.profileState !== "ACTIVE") {
        throw new ValidationError("The selected psychologist is currently not accepting new counseling requests.");
      }
      targetPsychologistId = target.id;
    }

    // 3. Automated crisis & distress evaluation
    const detectedCrisis = this.detectCrisisSignals(validated.rawConcernSummary);
    const isEscalated = validated.hasCrisisConcerns || detectedCrisis;

    // 4. Create CounselingRequest and linked IntakeResponse in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.counselingRequest.create({
        data: {
          clientId: clientProfile.id,
          targetPsychologistId,
          isDirectBookingRequest: validated.isDirectBookingRequest || Boolean(targetPsychologistId),
          status: CounselingRequestStatus.NEW,
        },
      });

      await tx.intakeResponse.create({
        data: {
          requestId: request.id,
          ageBand: validated.ageBand,
          contactPreference: validated.contactPreference,
          preferredLanguage: validated.preferredLanguage,
          concernCategories: validated.concernCategories,
          rawConcernSummary: validated.rawConcernSummary,
          preferredTimeWindows: {
            days: validated.preferredDays,
            times: validated.preferredTimes,
            sessionPreference: validated.sessionPreference,
          },
          isEscalated,
        },
      });

      // Record initial status history
      await tx.counselingRequestStatusHistory.create({
        data: {
          requestId: request.id,
          oldStatus: CounselingRequestStatus.NEW,
          newStatus: CounselingRequestStatus.NEW,
          actorUserId: userId,
          reason: "Client submitted counseling intake request",
        },
      });

      return request;
    });

    // 5. Audit Log (Never log sensitive raw health/concern summaries)
    await AuditService.log({
      actorUserId: userId,
      action: "INTAKE_REQUEST_CREATED",
      entityType: "CounselingRequest",
      entityId: result.id,
      safeMetadata: {
        isDirectBookingRequest: result.isDirectBookingRequest,
        targetPsychologistId,
        isEscalated,
        concernCategoriesCount: validated.concernCategories.length,
      },
    });

    return {
      requestId: result.id,
      isEscalated,
    };
  }

  /**
   * Retrieves all counseling requests for a client.
   */
  static async getClientRequests(userId: string): Promise<ClientCounselingRequestDto[]> {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      return [];
    }

    const requests = await prisma.counselingRequest.findMany({
      where: { clientId: clientProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        targetPsychologist: {
          select: {
            id: true,
            fullName: true,
            professionalTitle: true,
            slug: true,
            profilePhotoUrl: true,
          },
        },
        intakeResponse: true,
      },
    });

    return requests.map((req) => ({
      id: req.id,
      status: req.status,
      isDirectBookingRequest: req.isDirectBookingRequest,
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
      targetPsychologist: req.targetPsychologist,
      intakeResponse: req.intakeResponse
        ? {
            id: req.intakeResponse.id,
            requestId: req.intakeResponse.requestId,
            ageBand: req.intakeResponse.ageBand,
            contactPreference: req.intakeResponse.contactPreference,
            preferredLanguage: req.intakeResponse.preferredLanguage,
            concernCategories: Array.isArray(req.intakeResponse.concernCategories)
              ? (req.intakeResponse.concernCategories as string[])
              : [],
            rawConcernSummary: req.intakeResponse.rawConcernSummary,
            preferredTimeWindows: req.intakeResponse.preferredTimeWindows as any,
            isEscalated: req.intakeResponse.isEscalated,
            createdAt: req.intakeResponse.createdAt.toISOString(),
          }
        : null,
    }));
  }

  /**
   * Retrieves a single counseling request for a client, verifying ownership.
   */
  static async getClientRequestById(userId: string, requestId: string): Promise<ClientCounselingRequestDto> {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      throw new NotFoundError("Client profile not found");
    }

    const request = await prisma.counselingRequest.findUnique({
      where: { id: requestId },
      include: {
        targetPsychologist: {
          select: {
            id: true,
            fullName: true,
            professionalTitle: true,
            slug: true,
            profilePhotoUrl: true,
          },
        },
        intakeResponse: true,
      },
    });

    if (!request) {
      throw new NotFoundError("Counseling request not found");
    }

    if (request.clientId !== clientProfile.id) {
      throw new ForbiddenError("Access denied: You do not own this counseling request");
    }

    return {
      id: request.id,
      status: request.status,
      isDirectBookingRequest: request.isDirectBookingRequest,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      targetPsychologist: request.targetPsychologist,
      intakeResponse: request.intakeResponse
        ? {
            id: request.intakeResponse.id,
            requestId: request.intakeResponse.requestId,
            ageBand: request.intakeResponse.ageBand,
            contactPreference: request.intakeResponse.contactPreference,
            preferredLanguage: request.intakeResponse.preferredLanguage,
            concernCategories: Array.isArray(request.intakeResponse.concernCategories)
              ? (request.intakeResponse.concernCategories as string[])
              : [],
            rawConcernSummary: request.intakeResponse.rawConcernSummary,
            preferredTimeWindows: request.intakeResponse.preferredTimeWindows as any,
            isEscalated: request.intakeResponse.isEscalated,
            createdAt: request.intakeResponse.createdAt.toISOString(),
          }
        : null,
    };
  }
}
