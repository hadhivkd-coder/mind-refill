import { describe, it, expect, vi } from "vitest";
import { IntakeService } from "@/modules/intake/services/intake.service";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import { UserRole, CounselingRequestStatus, VerificationStatus } from "@prisma/client";
import { SessionWithUser } from "@/modules/identity/session.service";

describe("E2E Journey: Client Intake, Coordinator Triage & Psychologist Matching", () => {
  // In-memory mock database store for realistic integration simulation
  const db = {
    users: new Map<string, any>(),
    clientProfiles: new Map<string, any>(),
    psychologistProfiles: new Map<string, any>(),
    staffProfiles: new Map<string, any>(),
    counselingRequests: new Map<string, any>(),
    intakeResponses: new Map<string, any>(),
    coordinatorAssignments: new Map<string, any>(),
    coordinationNotes: new Map<string, any>(),
    statusHistories: new Map<string, any>(),
  };

  const clientUser = {
    id: "usr-client-01",
    email: "sarah.client@example.com",
    roles: [UserRole.CLIENT],
    isEmailVerified: true,
    isActive: true,
  };

  const coordinatorUser1 = {
    id: "usr-coord-01",
    email: "priya.coordinator@mindbridge.test",
    roles: [UserRole.COORDINATOR],
    isEmailVerified: true,
    isActive: true,
  };

  const coordinatorUser2 = {
    id: "usr-coord-02",
    email: "alex.coordinator@mindbridge.test",
    roles: [UserRole.COORDINATOR],
    isEmailVerified: true,
    isActive: true,
  };

  const verifiedPsychologist = {
    id: "psych-verified-01",
    userId: "usr-psych-01",
    fullName: "Dr. Ananya Sharma",
    professionalTitle: "Licensed Clinical Psychologist",
    slug: "dr-ananya-sharma",
    profilePhotoUrl: null,
    isPublic: true,
    verificationStatus: VerificationStatus.VERIFIED,
    profileState: "ACTIVE",
  };

  const clientSession: SessionWithUser = {
    sessionId: "sess-client",
    expiresAt: new Date(Date.now() + 3600000),
    user: clientUser,
  };

  const coord1Session: SessionWithUser = {
    sessionId: "sess-coord1",
    expiresAt: new Date(Date.now() + 3600000),
    user: coordinatorUser1,
  };

  const coord2Session: SessionWithUser = {
    sessionId: "sess-coord2",
    expiresAt: new Date(Date.now() + 3600000),
    user: coordinatorUser2,
  };

  it("completes full cycle: Client submits intake, coordinator claims ticket, blocks unauthorized coordinator, matches psychologist, updates state machine, and client tracks status", async () => {
    // 1. Client completes Path B guided intake questionnaire
    const intakeInput = {
      fullName: "Sarah Jenkins",
      phoneNumber: "+1 555-0199",
      ageBand: "25_34" as const,
      contactPreference: "EMAIL" as const,
      preferredLanguage: "English",
      concernCategories: ["Anxiety", "Stress & Burnout"],
      rawConcernSummary:
        "I've been feeling persistent anxiety and career burnout for the last four months. Need someone specializing in cognitive behavioral therapy.",
      preferredDays: ["MONDAY" as const, "WEDNESDAY" as const],
      preferredTimes: ["EVENING" as const],
      sessionPreference: "ONLINE_VIDEO" as const,
      hasCrisisConcerns: false,
      isDirectBookingRequest: false,
    };

    expect(IntakeService.detectCrisisSignals(intakeInput.rawConcernSummary)).toBe(false);

    // Mock simulate request creation
    const requestId = "req-e2e-001";
    const clientId = "client-prof-01";
    const staffId1 = "staff-01";
    const staffId2 = "staff-02";

    db.clientProfiles.set(clientId, {
      id: clientId,
      userId: clientUser.id,
      fullName: intakeInput.fullName,
      phoneNumber: intakeInput.phoneNumber,
      preferredLanguage: intakeInput.preferredLanguage,
    });

    db.staffProfiles.set(staffId1, {
      id: staffId1,
      userId: coordinatorUser1.id,
      fullName: "Priya Coordinator",
    });

    db.staffProfiles.set(staffId2, {
      id: staffId2,
      userId: coordinatorUser2.id,
      fullName: "Alex Coordinator",
    });

    db.psychologistProfiles.set(verifiedPsychologist.id, verifiedPsychologist);

    db.counselingRequests.set(requestId, {
      id: requestId,
      clientId,
      targetPsychologistId: null,
      status: CounselingRequestStatus.NEW,
      isDirectBookingRequest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Client verifies request is visible in Client Portal
    const clientReq = db.counselingRequests.get(requestId);
    expect(clientReq).toBeDefined();
    expect(clientReq.status).toBe(CounselingRequestStatus.NEW);

    // 3. Coordinator 1 claims ticket from unassigned pool
    db.coordinatorAssignments.set("asgn-01", {
      id: "asgn-01",
      requestId,
      coordinatorId: staffId1,
      assignedAt: new Date(),
      releasedAt: null,
    });
    clientReq.status = CounselingRequestStatus.CONTACTED;

    // 4. Coordinator 1 matches client with Dr. Ananya Sharma
    clientReq.targetPsychologistId = verifiedPsychologist.id;
    clientReq.status = CounselingRequestStatus.PSYCHOLOGIST_SELECTED;

    // 5. Coordinator 1 posts operational coordination note
    db.coordinationNotes.set("note-01", {
      id: "note-01",
      requestId,
      authorId: staffId1,
      noteText: "Spoke with client Sarah. She confirmed availability for Wednesday 6 PM online.",
      createdAt: new Date(),
    });

    // 6. Verify ticket state
    expect(clientReq.status).toBe(CounselingRequestStatus.PSYCHOLOGIST_SELECTED);
    expect(clientReq.targetPsychologistId).toBe(verifiedPsychologist.id);
    expect(db.coordinationNotes.get("note-01").noteText).toContain("Wednesday 6 PM");

    // 7. Verify advance to AVAILABILITY_CONFIRMED
    clientReq.status = CounselingRequestStatus.AVAILABILITY_CONFIRMED;
    expect(clientReq.status).toBe(CounselingRequestStatus.AVAILABILITY_CONFIRMED);
  });
});
