import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { EbookService } from "@/modules/content/services/ebook.service";
import { prisma } from "@/shared/database/prisma";
import { handleApiError, ValidationError, NotFoundError } from "@/shared/errors";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const ebooks = await EbookService.listPsychologistEbooks(authed.user.id);
    return NextResponse.json({ success: true, data: ebooks });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: authed.user.id },
    });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const body = await req.json();
    if (!body.title || body.title.trim().length < 3) {
      throw new ValidationError("Title must be at least 3 characters");
    }
    if (!body.description || body.description.trim().length < 10) {
      throw new ValidationError("Description must be at least 10 characters");
    }

    const priceAmount = Number(body.price || 299);
    const priceMinor = BigInt(Math.round(priceAmount * 100));

    let storedFileId = body.storedFileId;
    if (!storedFileId) {
      const virtualKey = `ebooks/${profile.id}/${randomUUID()}-${Date.now()}.pdf`;
      const file = await prisma.storedFile.create({
        data: {
          storageKey: virtualKey,
          bucket: "psychologist-products",
          originalName: `${body.title.slice(0, 40).replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
          mimeType: "application/pdf",
          sizeBytes: BigInt(250000),
          isScannedSafe: true,
          uploadedById: authed.user.id,
        },
      });
      storedFileId = file.id;
    }

    const ebook = await EbookService.createEbook(authed.user.id, {
      title: body.title,
      description: body.description,
      priceAmountMinor: priceMinor,
      currency: "INR",
      storedFileId,
      coverImageUrl: body.coverImageUrl || null,
    });

    if (body.publishImmediately !== false) {
      await EbookService.setPublicationStatus(authed, ebook.id, true);
    }

    return NextResponse.json(
      { success: true, message: "Product created successfully", data: ebook },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
