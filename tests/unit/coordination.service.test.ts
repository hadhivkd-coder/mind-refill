import { describe, it, expect, vi, beforeEach } from "vitest";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import { prisma } from "@/shared/database/prisma";
import { UserRole, CounselingRequestStatus, VerificationStatus } from "@prisma/client";
import { ForbiddenError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    staffProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    counselingRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    coordinatorAssignment: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    coordinationNote: {
      create: vi.fn(),
    },
    counselingRequestStatusHistory: {
      create: vi.fn(),
    },
    psychologistProfile: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/modules/audit/audit.service", () => ({
  AuditService: {
    log: vi.fn().mockResolvedValue({ id: "audit-123" }),
  },
}));

describe("CoordinationService", () => {
  const coordinatorSession: SessionWithUser = {
    sessionId: "sess-1",
    expiresAt: new Date(Date.now() + 3600000),
    user: {
      id: "coord-user-1",
      email: "coordinator@mindbridge.test",
      roles: [UserRole.COORDINATOR],
      isEmailVerified: true,
      isActive: true,
    },
  };

  const otherCoordinatorSession: SessionWithUser = {
    sessionId: "sess-2",
    expiresAt: new Date(Date.now() + 3600000),
    user: {
      id: "coord-user-2",
      email: "other@mindbridge.test",
      roles: [UserRole.COORDINATOR],
      isEmailVerified: true,
      isActive: true,
    },
  };

  const clientSession: SessionWithUser = {
    sessionId: "sess-3",
    expiresAt: new Date(Date.now() + 3600000),
    user: {
      id: "client-user-1",
      email: "client@mindbridge.test",
      roles: [UserRole.CLIENT],
      isEmailVerified: true,
      isActive: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Role & Capability Guard", () => {
    it("should reject non-coordinator/non-admin users from accessing queue", async () => {
      await expect(CoordinationService.getQueue(clientSession)).rejects.toThrow(ForbiddenError);
    });
  });

  describe("Assignment-Level Authorization Guard", () => {
    it("should prevent a coordinator from snooping on requests assigned to another coordinator", async () => {
      vi.mocked(prisma.staffProfile.findUnique).mockResolvedValue({
        id: "staff-2",
        userId: "coord-user-2",
        fullName: "Coordinator Two",
      } as any);

      vi.mocked(prisma.counselingRequest.findUnique).mockResolvedValue({
        id: "req-locked",
        clientId: "client-1",
        status: CounselingRequestStatus.CONTACTED,
        isDirectBookingRequest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        client: { id: "c-1", userId: "u-1", fullName: "Jane", user: { email: "jane@test.com" } },
        targetPsychologist: null,
        intakeResponse: null,
        assignments: [
          {
            id: "asgn-1",
            coordinatorId: "staff-1", // ASSIGNED TO STAFF 1
            coordinator: { id: "staff-1", fullName: "Coordinator One" },
          },
        ],
        notes: [],
        statusHistory: [],
      } as any);

      // Other coordinator tries to access details
      await expect(
        CoordinationService.getRequestDetails(otherCoordinatorSession, "req-locked")
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("State Machine Status Updates", () => {
    it("should reject invalid status skips", async () => {
      vi.mocked(prisma.staffProfile.findUnique).mockResolvedValue({
        id: "staff-1",
        userId: "coord-user-1",
        fullName: "Coordinator One",
      } as any);

      vi.mocked(prisma.counselingRequest.findUnique).mockResolvedValue({
        id: "req-1",
        clientId: "client-1",
        status: CounselingRequestStatus.NEW,
        isDirectBookingRequest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        client: { id: "c-1", userId: "u-1", fullName: "Jane", user: { email: "jane@test.com" } },
        targetPsychologist: null,
        intakeResponse: null,
        assignments: [],
        notes: [],
        statusHistory: [],
      } as any);

      // Attempting to jump directly from NEW to COMPLETED
      await expect(
        CoordinationService.updateStatus(coordinatorSession, "req-1", CounselingRequestStatus.COMPLETED)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("matchPsychologist", () => {
    it("should reject matching an unverified or inactive psychologist", async () => {
      vi.mocked(prisma.staffProfile.findUnique).mockResolvedValue({
        id: "staff-1",
        userId: "coord-user-1",
        fullName: "Coordinator One",
      } as any);

      vi.mocked(prisma.counselingRequest.findUnique).mockResolvedValue({
        id: "req-1",
        clientId: "client-1",
        status: CounselingRequestStatus.INTAKE_COMPLETED,
        isDirectBookingRequest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        client: { id: "c-1", userId: "u-1", fullName: "Jane", user: { email: "jane@test.com" } },
        targetPsychologist: null,
        intakeResponse: null,
        assignments: [],
        notes: [],
        statusHistory: [],
      } as any);

      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({
        id: "p-unverified",
        fullName: "Dr. Suspended",
        verificationStatus: VerificationStatus.SUSPENDED,
        profileState: "INACTIVE",
      } as any);

      await expect(
        CoordinationService.matchPsychologist(coordinatorSession, "req-1", "p-unverified")
      ).rejects.toThrow(ValidationError);
    });
  });
});
