import { prisma } from "@/shared/database/prisma";
import { ContentStatus, UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";
import { SlugService } from "@/shared/slug/slug.service";
import { AuditService } from "@/modules/audit/audit.service";

export interface CreateArticleInput {
  title: string;
  summary?: string;
  body: string;
  contentType?: string; // ARTICLE, RESOURCE, VIDEO_REF
}

export interface UpdateArticleInput {
  title?: string;
  summary?: string;
  body?: string;
  contentType?: string;
}

export class ContentService {
  /**
   * Psychologist drafts a new article or clinical resource.
   */
  static async createArticle(userId: string, input: CreateArticleInput) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    if (!input.title || input.title.trim().length < 5) {
      throw new ValidationError("Title must be at least 5 characters");
    }
    if (!input.body || input.body.trim().length < 50) {
      throw new ValidationError("Body content must be at least 50 characters");
    }

    let candidate = SlugService.normalize(input.title);
    if (!candidate || candidate.length < 3) candidate = "article";
    let slug = candidate;
    let counter = 1;
    while (await prisma.contentItem.findUnique({ where: { slug } })) {
      slug = `${candidate}-${counter++}`;
    }

    const article = await prisma.contentItem.create({
      data: {
        authorPsychologistId: profile.id,
        slug,
        title: input.title.trim(),
        summary: input.summary?.trim() || null,
        body: input.body.trim(),
        contentType: input.contentType || "ARTICLE",
        status: ContentStatus.DRAFT,
      },
    });

    await AuditService.log({
      actorUserId: userId,
      action: "CONTENT_ARTICLE_CREATED",
      entityType: "ContentItem",
      entityId: article.id,
      safeMetadata: { slug: article.slug, contentType: article.contentType },
    });

    return article;
  }

  /**
   * Updates article draft content. Author or Admin only.
   */
  static async updateArticle(session: SessionWithUser, articleId: string, input: UpdateArticleInput) {
    const article = await prisma.contentItem.findUnique({
      where: { id: articleId },
      include: { author: true },
    });
    if (!article) throw new NotFoundError("Article not found");

    const isAdmin = session.user.roles.includes(UserRole.ADMIN);
    const isAuthor = article.author?.userId === session.user.id;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenError("Only the authoring psychologist or platform admin can edit this article");
    }

    const data: any = {};
    if (input.title) data.title = input.title.trim();
    if (input.summary !== undefined) data.summary = input.summary?.trim() || null;
    if (input.body) data.body = input.body.trim();
    if (input.contentType) data.contentType = input.contentType;

    return prisma.contentItem.update({
      where: { id: articleId },
      data,
    });
  }

  /**
   * Submits draft article for platform editorial review.
   */
  static async submitForReview(userId: string, articleId: string) {
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const article = await prisma.contentItem.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundError("Article not found");
    if (article.authorPsychologistId !== profile.id) {
      throw new ForbiddenError("Cannot submit articles authored by another practitioner");
    }

    return prisma.contentItem.update({
      where: { id: articleId },
      data: { status: ContentStatus.IN_REVIEW },
    });
  }

  /**
   * Approves and publishes article to public resources section (Admin only).
   */
  static async publishArticle(session: SessionWithUser, articleId: string) {
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Admin access required to publish articles");
    }

    const article = await prisma.contentItem.findUnique({ where: { id: articleId } });
    if (!article) throw new NotFoundError("Article not found");

    return prisma.contentItem.update({
      where: { id: articleId },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Lists published articles for the public directory.
   */
  static async listPublicArticles(page = 1, limit = 12, contentType?: string) {
    const skip = (page - 1) * limit;
    const where: any = { status: ContentStatus.PUBLISHED };
    if (contentType) where.contentType = contentType;

    const [total, items] = await Promise.all([
      prisma.contentItem.count({ where }),
      prisma.contentItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: {
            select: { id: true, fullName: true, professionalTitle: true, slug: true },
          },
        },
      }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        contentType: item.contentType,
        publishedAt: item.publishedAt?.toISOString() ?? null,
        author: item.author
          ? {
              name: item.author.fullName,
              title: item.author.professionalTitle,
              slug: item.author.slug,
            }
          : null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieves single published article by slug.
   */
  static async getPublicArticleBySlug(slug: string) {
    const article = await prisma.contentItem.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, fullName: true, professionalTitle: true, slug: true, bio: true },
        },
      },
    });

    if (!article || article.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundError("Article not found or not currently published");
    }

    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      body: article.body,
      contentType: article.contentType,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      author: article.author,
    };
  }

  /**
   * Lists psychologist's personal authored articles.
   */
  static async listPsychologistArticles(userId: string) {
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    return prisma.contentItem.findMany({
      where: { authorPsychologistId: profile.id },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Lists all articles across platform for Admin editorial review.
   */
  static async listAdminArticles(session: SessionWithUser) {
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Admin access required");
    }

    return prisma.contentItem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, fullName: true, professionalTitle: true },
        },
      },
    });
  }
}
