import { describe, it, expect, vi } from "vitest";
import { AuthService } from "@/modules/identity/auth.service";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { QualificationService } from "@/modules/profiles/services/qualification.service";
import { VerificationService } from "@/modules/verification/services/verification.service";
import { DirectoryService } from "@/modules/directory/services/directory.service";
import { UserRole, VerificationStatus } from "@prisma/client";
import { prisma } from "@/shared/database/prisma";

vi.mock("@/modules/storage/services/local-storage.service", () => ({
  storageService: {
    uploadFile: vi.fn().mockResolvedValue({
      key: "verif-license.pdf",
      bucket: "private-docs",
      mimeType: "application/pdf",
      sizeBytes: 2048,
    }),
    getSignedDownloadUrl: vi.fn().mockResolvedValue("/api/storage/download?signed=true"),
  },
}));

vi.mock("@/shared/database/prisma", () => {
  let dbUser: any = null;
  let dbProfile: any = null;
  let dbStaff: any = null;
  const dbQualifications: any[] = [];
  let dbApplication: any = null;
  const dbDocuments: any[] = [];
  const dbReviews: any[] = [];

  return {
    prisma: {
      user: {
        findUnique: vi.fn(({ where }) => {
          if (dbUser && (dbUser.email === where.email || dbUser.id === where.id)) return Promise.resolve(dbUser);
          return Promise.resolve(null);
        }),
        create: vi.fn(({ data }) => {
          dbUser = {
            id: "user-psych-e2e",
            email: data.email,
            passwordHash: data.passwordHash,
            isEmailVerified: true,
            isActive: true,
            roles: [{ role: UserRole.PSYCHOLOGIST }],
          };
          return Promise.resolve(dbUser);
        }),
      },
      psychologistProfile: {
        findUnique: vi.fn(({ where }) => {
          if (dbProfile && (dbProfile.id === where.id || dbProfile.userId === where.userId)) {
            return Promise.resolve({
              ...dbProfile,
              qualifications: dbQualifications,
              experiences: [],
              specializations: [],
              languages: [],
              socialLinks: [],
              verificationApps: dbApplication
                ? [{ ...dbApplication, documents: dbDocuments, reviews: dbReviews }]
                : [],
            });
          }
          return Promise.resolve(null);
        }),
        findFirst: vi.fn(({ where }) => {
          if (dbProfile && dbProfile.slug === where.slug?.equals) {
            // Verify public & verified constraint
            if (where.isPublic && !dbProfile.isPublic) return Promise.resolve(null);
            if (where.verificationStatus && dbProfile.verificationStatus !== where.verificationStatus) {
              return Promise.resolve(null);
            }
            return Promise.resolve({
              ...dbProfile,
              qualifications: dbQualifications,
              experiences: [],
              specializations: [],
              languages: [],
              socialLinks: [],
            });
          }
          return Promise.resolve(null);
        }),
        create: vi.fn(({ data }) => {
          dbProfile = {
            id: "prof-e2e-1",
            userId: data.userId,
            fullName: data.fullName,
            professionalTitle: data.professionalTitle,
            slug: data.slug,
            bio: data.bio || "",
            isPublic: false,
            verificationStatus: VerificationStatus.PENDING,
            profileState: "ACTIVE",
            yearsOfExperience: 0,
          };
          return Promise.resolve(dbProfile);
        }),
        update: vi.fn(({ data }) => {
          for (const [k, v] of Object.entries(data)) {
            if (v !== undefined) {
              dbProfile[k] = v;
            }
          }
          return Promise.resolve(dbProfile);
        }),
        count: vi.fn(({ where }) => {
          if (
            dbProfile &&
            where.isPublic &&
            dbProfile.isPublic &&
            where.verificationStatus === dbProfile.verificationStatus
          ) {
            return Promise.resolve(1);
          }
          return Promise.resolve(0);
        }),
        findMany: vi.fn(({ where }) => {
          if (
            dbProfile &&
            where.isPublic &&
            dbProfile.isPublic &&
            where.verificationStatus === dbProfile.verificationStatus
          ) {
            return Promise.resolve([
              {
                ...dbProfile,
                specializations: [],
                languages: [],
              },
            ]);
          }
          return Promise.resolve([]);
        }),
      },
      qualification: {
        create: vi.fn(({ data }) => {
          const q = { id: `q-${Date.now()}`, ...data };
          dbQualifications.push(q);
          return Promise.resolve(q);
        }),
      },
      storedFile: {
        create: vi.fn(({ data }) => Promise.resolve({ id: "file-1", ...data })),
      },
      verificationApplication: {
        findFirst: vi.fn(() => Promise.resolve(dbApplication)),
        findUnique: vi.fn(() => Promise.resolve(dbApplication)),
        create: vi.fn(({ data }) => {
          dbApplication = {
            id: "app-e2e-1",
            psychologistId: data.psychologistId,
            status: data.status,
            submittedAt: new Date(),
          };
          return Promise.resolve(dbApplication);
        }),
        update: vi.fn(({ data }) => {
          Object.assign(dbApplication, data);
          return Promise.resolve(dbApplication);
        }),
      },
      verificationDocument: {
        create: vi.fn(({ data }) => {
          const doc = {
            id: "vdoc-1",
            ...data,
            file: { originalName: "license.pdf", bucket: "private-docs", storageKey: "verif-license.pdf" },
          };
          dbDocuments.push(doc);
          return Promise.resolve(doc);
        }),
        findUnique: vi.fn(() => Promise.resolve(dbDocuments[0] || null)),
      },
      verificationReview: {
        create: vi.fn(({ data }) => {
          const rev = { id: "rev-1", ...data, reviewer: { fullName: "Admin Chief" } };
          dbReviews.push(rev);
          return Promise.resolve(rev);
        }),
      },
      staffProfile: {
        findUnique: vi.fn(() => {
          dbStaff = { id: "staff-admin-1", fullName: "Admin Chief", userId: "admin-u1" };
          return Promise.resolve(dbStaff);
        }),
        create: vi.fn().mockResolvedValue({}),
      },
      emailVerificationToken: {
        create: vi.fn().mockResolvedValue({}),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn((arg) => {
        if (typeof arg === "function") return arg(prisma);
        return Promise.all(arg);
      }),
    },
  };
});

describe("E2E Psychologist Onboarding, Verification & Directory Journey", () => {
  it("completes journey: Register -> Profile -> Doc Upload -> Submit -> Admin Review -> Directory Appearance", async () => {
    // 1. Psychologist registers
    const registration = await AuthService.register({
      fullName: "Dr. Maya Angel",
      email: "maya@psychology.test",
      password: "Password1234!",
      role: UserRole.PSYCHOLOGIST,
    });
    expect(registration.userId).toBeDefined();

    // 2. Psychologist updates profile details & marks isPublic: true
    const updatedProfile = await ProfileService.updateProfile("prof-e2e-1", "user-psych-e2e", {
      professionalTitle: "Senior Consultant Clinical Psychologist",
      bio: "Specializing in compassionate, evidence-based trauma recovery with 10 years experience.",
      shortIntro: "Compassionate trauma recovery and mindfulness specialist.",
      yearsOfExperience: 10,
      isPublic: true,
    });
    expect(updatedProfile.isPublic).toBe(true);

    // 3. Adds clinical qualification
    const qualification = await QualificationService.addQualification(
      "prof-e2e-1",
      "user-psych-e2e",
      {
        degree: "M.Phil in Clinical Psychology",
        institution: "National Institute of Mental Health",
        yearObtained: 2014,
        isPublic: true,
      }
    );
    expect(qualification.degree).toBe("M.Phil in Clinical Psychology");

    // 4. Uploads clinical license document
    const mockSession = {
      sessionId: "s1",
      expiresAt: new Date(Date.now() + 10000),
      user: { id: "user-psych-e2e", email: "maya@psychology.test", roles: [UserRole.PSYCHOLOGIST], isActive: true, isEmailVerified: true },
    };
    const document = await VerificationService.uploadDocument(mockSession as any, {
      psychologistProfileId: "prof-e2e-1",
      documentType: "CLINICAL_LICENSE",
      originalName: "clinical_license_2026.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("fake-pdf-content"),
    });
    expect(document.id).toBeDefined();

    // 5. Submits verification application
    const submittedApp = await VerificationService.submitApplication("prof-e2e-1", "user-psych-e2e");
    expect(submittedApp.status).toBe(VerificationStatus.UNDER_REVIEW);

    // 6. Directory verification gate: Not yet verified, so Directory MUST return 0 results!
    const preVerificationDirectory = await DirectoryService.search({ query: "Maya" });
    expect(preVerificationDirectory.total).toBe(0);

    // 7. Admin reviews application and approves
    const adminSession = {
      sessionId: "s-admin",
      expiresAt: new Date(Date.now() + 10000),
      user: { id: "admin-u1", email: "admin@platform.test", roles: [UserRole.ADMIN], isActive: true, isEmailVerified: true },
    };
    const reviewResult = await VerificationService.reviewApplication(adminSession as any, {
      applicationId: "app-e2e-1",
      outcomeStatus: "VERIFIED",
      notes: "License confirmed with State Medical Council.",
    });
    expect(reviewResult.application.status).toBe("VERIFIED");

    // 8. Directory verification check: NOW the psychologist MUST appear in the directory!
    const postVerificationDirectory = await DirectoryService.search({ query: "Maya" });
    expect(postVerificationDirectory.total).toBe(1);
    expect(postVerificationDirectory.psychologists[0].fullName).toBe("Dr. Maya Angel");
    expect(postVerificationDirectory.psychologists[0].isVerified).toBe(true);

    // 9. Public profile by slug is now accessible and sanitized
    const publicProfile = await ProfileService.getPublicProfileBySlug(updatedProfile.slug);
    expect(publicProfile.fullName).toBe("Dr. Maya Angel");
    expect(publicProfile.isVerified).toBe(true);
    expect(publicProfile.qualifications[0].degree).toBe("M.Phil in Clinical Psychology");
  });
});
