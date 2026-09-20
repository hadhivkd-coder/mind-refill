import { prisma } from "@/shared/database/prisma";
import { PaymentStatus, UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";
import { minorToMajorString } from "@/shared/types/money";
import { SlugService } from "@/shared/slug/slug.service";
import { storageService } from "@/modules/storage/services/local-storage.service";
import { AuditService } from "@/modules/audit/audit.service";

export interface CreateEbookInput {
  title: string;
  description: string;
  priceAmountMinor: bigint;
  currency?: string;
  storedFileId: string;
  coverImageUrl?: string;
}

export class EbookService {
  /**
   * Psychologist registers a new digital e-book / psychoeducational guide.
   */
  static async createEbook(userId: string, input: CreateEbookInput) {
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    if (!input.title || input.title.trim().length < 3) {
      throw new ValidationError("Title must be at least 3 characters");
    }
    if (!input.description || input.description.trim().length < 10) {
      throw new ValidationError("Description must be at least 10 characters");
    }

    const file = await prisma.storedFile.findUnique({ where: { id: input.storedFileId } });
    if (!file) throw new NotFoundError("Ebook document file not found in secure storage");

    let candidate = SlugService.normalize(input.title);
    if (!candidate || candidate.length < 3) candidate = "ebook";
    let slug = candidate;
    let counter = 1;
    while (await prisma.ebook.findUnique({ where: { slug } })) {
      slug = `${candidate}-${counter++}`;
    }

    const ebook = await prisma.ebook.create({
      data: {
        authorPsychologistId: profile.id,
        storedFileId: input.storedFileId,
        slug,
        title: input.title.trim(),
        description: input.description.trim(),
        priceMinor: input.priceAmountMinor,
        currency: input.currency || "INR",
        coverImageUrl: input.coverImageUrl || null,
        isPublished: false,
      },
    });

    await AuditService.log({
      actorUserId: userId,
      action: "EBOOK_CREATED",
      entityType: "Ebook",
      entityId: ebook.id,
      safeMetadata: { slug: ebook.slug, priceMinor: input.priceAmountMinor.toString() },
    });

    return ebook;
  }

  /**
   * Toggles publication status of an ebook.
   */
  static async setPublicationStatus(session: SessionWithUser, ebookId: string, isPublished: boolean) {
    const ebook = await prisma.ebook.findUnique({
      where: { id: ebookId },
      include: { author: true },
    });
    if (!ebook) throw new NotFoundError("Ebook not found");

    const isAdmin = session.user.roles.includes(UserRole.ADMIN);
    const isAuthor = ebook.author?.userId === session.user.id;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenError("Only author or platform administrator can publish this ebook");
    }

    return prisma.ebook.update({
      where: { id: ebookId },
      data: { isPublished },
    });
  }

  /**
   * Lists published ebooks for public storefront.
   */
  static async listPublicEbooks() {
    try {
      const ebooks = await prisma.ebook.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, fullName: true, professionalTitle: true, slug: true },
          },
        },
      });

      return ebooks.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        description: e.description,
        coverImageUrl: e.coverImageUrl,
        priceMinor: e.priceMinor.toString(),
        priceMajor: minorToMajorString(e.priceMinor),
        currency: e.currency,
        author: e.author
          ? {
              name: e.author.fullName,
              title: e.author.professionalTitle,
              slug: e.author.slug,
            }
          : null,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Retrieves single public ebook by slug.
   */
  static async getPublicEbookBySlug(slug: string) {
    const ebook = await prisma.ebook.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, fullName: true, professionalTitle: true, slug: true, bio: true },
        },
      },
    });

    if (!ebook || !ebook.isPublished) {
      throw new NotFoundError("Ebook not found or currently unavailable");
    }

    return {
      id: ebook.id,
      slug: ebook.slug,
      title: ebook.title,
      description: ebook.description,
      coverImageUrl: ebook.coverImageUrl,
      priceMinor: ebook.priceMinor.toString(),
      priceMajor: minorToMajorString(ebook.priceMinor),
      currency: ebook.currency,
      author: ebook.author,
    };
  }

  /**
   * Executes atomic client purchase and grants permanent access.
   */
  static async purchaseEbook(clientUserId: string, ebookId: string) {
    const client = await prisma.clientProfile.findUnique({ where: { userId: clientUserId } });
    if (!client) throw new NotFoundError("Client profile not found");

    const ebook = await prisma.ebook.findUnique({ where: { id: ebookId } });
    if (!ebook) throw new NotFoundError("Ebook not found");
    if (!ebook.isPublished) throw new ValidationError("Cannot purchase unpublished ebook");

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        clientId_ebookId: {
          clientId: client.id,
          ebookId: ebook.id,
        },
      },
    });

    if (existingPurchase) {
      return { purchaseId: existingPurchase.id, alreadyOwned: true };
    }

    // Atomic transaction creating Order, OrderItem, and Purchase
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          clientId: client.id,
          totalMinor: ebook.priceMinor,
          currency: ebook.currency,
          status: PaymentStatus.SUCCEEDED,
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          ebookId: ebook.id,
          amountMinor: ebook.priceMinor,
          currency: ebook.currency,
        },
      });

      const purchase = await tx.purchase.create({
        data: {
          orderId: order.id,
          clientId: client.id,
          ebookId: ebook.id,
        },
      });

      await AuditService.log({
        actorUserId: clientUserId,
        action: "EBOOK_PURCHASED",
        entityType: "Purchase",
        entityId: purchase.id,
        safeMetadata: {
          ebookId: ebook.id,
          priceMinor: ebook.priceMinor.toString(),
          currency: ebook.currency,
        },
      });

      return { purchaseId: purchase.id, orderId: order.id, alreadyOwned: false };
    });
  }

  /**
   * Lists all ebooks purchased by a client.
   */
  static async getClientPurchases(clientUserId: string) {
    const client = await prisma.clientProfile.findUnique({ where: { userId: clientUserId } });
    if (!client) throw new NotFoundError("Client profile not found");

    const purchases = await prisma.purchase.findMany({
      where: { clientId: client.id },
      include: {
        ebook: {
          include: {
            author: { select: { fullName: true } },
          },
        },
      },
      orderBy: { grantedAt: "desc" },
    });

    return purchases.map((p) => ({
      purchaseId: p.id,
      ebookId: p.ebook.id,
      title: p.ebook.title,
      description: p.ebook.description,
      coverImageUrl: p.ebook.coverImageUrl,
      authorName: p.ebook.author?.fullName || "Staff",
      grantedAt: p.grantedAt.toISOString(),
    }));
  }

  /**
   * Generates a tamper-proof, time-limited download URL for an authorized purchaser or author.
   */
  static async getSecureDownloadUrl(session: SessionWithUser, ebookIdOrSlug: string): Promise<string> {
    let ebook = await prisma.ebook.findUnique({
      where: { id: ebookIdOrSlug },
      include: { file: true, author: true },
    });

    if (!ebook) {
      ebook = await prisma.ebook.findUnique({
        where: { slug: ebookIdOrSlug },
        include: { file: true, author: true },
      });
    }

    if (!ebook) throw new NotFoundError("Ebook not found");

    // Check authorization:
    // 1. Admin
    const isAdmin = session.user.roles.includes(UserRole.ADMIN);
    // 2. Author Psychologist
    const isAuthor = ebook.author?.userId === session.user.id;
    // 3. Purchaser
    let isPurchaser = false;
    const client = await prisma.clientProfile.findUnique({ where: { userId: session.user.id } });
    if (client) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          clientId_ebookId: {
            clientId: client.id,
            ebookId: ebook.id,
          },
        },
      });
      isPurchaser = !!purchase;
    }

    if (!isAdmin && !isAuthor && !isPurchaser) {
      throw new ForbiddenError("You must purchase this ebook to download it");
    }

    // Generate signed download URL (15-minute TTL)
    return storageService.getSignedDownloadUrl(ebook.file.bucket, ebook.file.storageKey, 900);
  }

  /**
   * Lists psychologist's authored ebooks.
   */
  static async listPsychologistEbooks(userId: string) {
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const ebooks = await prisma.ebook.findMany({
      where: { authorPsychologistId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    return ebooks.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      description: e.description,
      priceMajor: minorToMajorString(e.priceMinor),
      currency: e.currency,
      isPublished: e.isPublished,
      createdAt: e.createdAt.toISOString(),
    }));
  }
}
