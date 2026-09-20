import { prisma } from "@/shared/database/prisma";
import { storageService } from "@/modules/storage/services/local-storage.service";
import { AuditService } from "@/modules/audit/audit.service";
import { requireOwner, requireRole } from "@/modules/authorization/guards";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "@/shared/errors";
import { UserRole, VerificationStatus } from "@prisma/client";
import { SessionWithUser } from "@/modules/identity/session.service";
import crypto from "crypto";

export interface UploadVerificationDocumentInput {
  psychologistProfileId: string;
  documentType: string; // e.g. "LICENSE", "DEGREE", "GOVERNMENT_ID"
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}

export interface ReviewApplicationInput {
  applicationId: string;
  outcomeStatus: "VERIFIED" | "REJECTED" | "SUSPENDED";
  notes?: string;
}

export class VerificationService {
  private static PRIVATE_BUCKET = "psychology-platform-private-documents";

  /**
   * Uploads a verification document into private storage and attaches it to the psychologist's application.
   */
  static async uploadDocument(session: SessionWithUser, input: UploadVerificationDocumentInput) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { id: input.psychologistProfileId },
    });

    if (!profile) {
      throw new NotFoundError("Psychologist profile");
    }

    requireOwner(profile.userId, session.user.id);

    // Ensure or create active verification application
    let application = await prisma.verificationApplication.findFirst({
      where: {
        psychologistId: profile.id,
        status: { in: [VerificationStatus.PENDING, VerificationStatus.UNDER_REVIEW, VerificationStatus.REJECTED] },
      },
      orderBy: { submittedAt: "desc" },
    });

    if (!application) {
      application = await prisma.verificationApplication.create({
        data: {
          psychologistId: profile.id,
          status: VerificationStatus.PENDING,
        },
      });
    }

    // Generate opaque storage key
    const extension = input.originalName.split(".").pop()?.toLowerCase() || "pdf";
    const opaqueKey = `verif-${crypto.randomUUID()}.${extension}`;

    // Upload to private storage
    const stored = await storageService.uploadFile({
      bucket: this.PRIVATE_BUCKET,
      key: opaqueKey,
      content: input.buffer,
      mimeType: input.mimeType,
      sizeBytes: input.buffer.length,
    });

    // Create database metadata entries in a transaction
    return prisma.$transaction(async (tx) => {
      const storedFile = await tx.storedFile.create({
        data: {
          bucket: stored.bucket,
          storageKey: stored.key,
          originalName: input.originalName,
          mimeType: stored.mimeType,
          sizeBytes: BigInt(stored.sizeBytes),
          isScannedSafe: true, // Auto-verified in development
          uploadedById: session.user.id,
        },
      });

      const verificationDoc = await tx.verificationDocument.create({
        data: {
          applicationId: application!.id,
          storedFileId: storedFile.id,
          documentType: input.documentType.trim(),
        },
        include: {
          file: true,
        },
      });

      await AuditService.log({
        actorUserId: session.user.id,
        action: "VERIFICATION_DOCUMENT_UPLOADED",
        entityType: "VerificationDocument",
        entityId: verificationDoc.id,
        safeMetadata: {
          documentType: input.documentType,
          sizeBytes: input.buffer.length,
        },
      });

      return verificationDoc;
    });
  }

  /**
   * Generates a secure, temporary signed download URL for an authorized viewer.
   * Access is STRICTLY restricted to:
   * 1. The psychologist who owns the document.
   * 2. Platform administrators or authorized staff.
   */
  static async getSignedDocumentUrl(documentId: string, session: SessionWithUser): Promise<string> {
    const doc = await prisma.verificationDocument.findUnique({
      where: { id: documentId },
      include: {
        file: true,
        application: {
          include: {
            psychologist: true,
          },
        },
      },
    });

    if (!doc) {
      throw new NotFoundError("Verification document");
    }

    const isOwner = doc.application.psychologist.userId === session.user.id;
    const isAdminOrStaff = session.user.roles.includes(UserRole.ADMIN) || session.user.roles.includes(UserRole.COORDINATOR);

    if (!isOwner && !isAdminOrStaff) {
      throw new ForbiddenError("Access denied: You are not authorized to access this private document");
    }

    return storageService.getSignedDownloadUrl(doc.file.bucket, doc.file.storageKey, 900); // 15 mins
  }

  /**
   * Submits verification application for administrative review.
   */
  static async submitApplication(psychologistProfileId: string, currentUserId: string) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { id: psychologistProfileId },
      include: {
        verificationApps: {
          orderBy: { submittedAt: "desc" },
          take: 1,
          include: { documents: true },
        },
      },
    });

    if (!profile) {
      throw new NotFoundError("Psychologist profile");
    }

    requireOwner(profile.userId, currentUserId);

    const latestApp = profile.verificationApps[0];
    if (!latestApp || latestApp.documents.length === 0) {
      throw new ValidationError("You must upload at least one verification document (license or degree) before submitting");
    }

    if (latestApp.status === VerificationStatus.UNDER_REVIEW) {
      throw new ValidationError("Your application is already currently under review");
    }

    return prisma.$transaction(async (tx) => {
      const updatedApp = await tx.verificationApplication.update({
        where: { id: latestApp.id },
        data: {
          status: VerificationStatus.UNDER_REVIEW,
          updatedAt: new Date(),
        },
      });

      await tx.psychologistProfile.update({
        where: { id: profile.id },
        data: {
          verificationStatus: VerificationStatus.UNDER_REVIEW,
        },
      });

      await AuditService.log({
        actorUserId: currentUserId,
        action: "VERIFICATION_APPLICATION_SUBMITTED",
        entityType: "VerificationApplication",
        entityId: updatedApp.id,
      });

      return updatedApp;
    });
  }

  /**
   * Reviews and decides on a verification application. Admin only.
   */
  static async reviewApplication(adminSession: SessionWithUser, input: ReviewApplicationInput) {
    requireRole(adminSession, UserRole.ADMIN);

    const application = await prisma.verificationApplication.findUnique({
      where: { id: input.applicationId },
      include: { psychologist: true },
    });

    if (!application) {
      throw new NotFoundError("Verification application");
    }

    const reviewerStaff = await prisma.staffProfile.findUnique({
      where: { userId: adminSession.user.id },
    });

    if (!reviewerStaff) {
      throw new ValidationError("Reviewer staff profile not found");
    }

    const newStatus = input.outcomeStatus as VerificationStatus;

    return prisma.$transaction(async (tx) => {
      // 1. Update application status
      const updatedApp = await tx.verificationApplication.update({
        where: { id: application.id },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      // 2. Update psychologist profile verification status
      await tx.psychologistProfile.update({
        where: { id: application.psychologistId },
        data: {
          verificationStatus: newStatus,
        },
      });

      // 3. Append immutable verification review record
      const reviewRecord = await tx.verificationReview.create({
        data: {
          applicationId: application.id,
          reviewerId: reviewerStaff.id,
          outcomeStatus: newStatus,
          notes: input.notes?.trim() ?? null,
        },
      });

      await AuditService.log({
        actorUserId: adminSession.user.id,
        action: `VERIFICATION_${newStatus}`,
        entityType: "VerificationApplication",
        entityId: application.id,
        safeMetadata: {
          outcomeStatus: newStatus,
          psychologistId: application.psychologistId,
        },
      });

      return {
        application: updatedApp,
        review: reviewRecord,
      };
    });
  }

  /**
   * Lists verification applications for administrative triage.
   */
  static async listApplications(statusFilter?: VerificationStatus) {
    return prisma.verificationApplication.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { submittedAt: "desc" },
      include: {
        psychologist: {
          include: {
            user: { select: { email: true } },
          },
        },
        documents: {
          include: { file: true },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: { reviewer: true },
        },
      },
    });
  }
}
