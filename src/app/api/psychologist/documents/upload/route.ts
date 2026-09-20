import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { VerificationService } from "@/modules/verification/services/verification.service";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { formatSafeError, AppError, ValidationError } from "@/shared/errors";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    requireRole(session, UserRole.PSYCHOLOGIST);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = (formData.get("documentType") as string) || "LICENSE";

    if (!file) {
      throw new ValidationError("No file attached in form upload");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const profile = await ProfileService.getPrivateProfileByUserId(session!.user.id);

    const doc = await VerificationService.uploadDocument(session!, {
      psychologistProfileId: profile.id,
      documentType,
      originalName: file.name,
      mimeType: file.type || "application/pdf",
      buffer,
    });

    return NextResponse.json(
      {
        message: "Document uploaded securely",
        documentId: doc.id,
        documentType: doc.documentType,
        originalName: doc.file.originalName,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
