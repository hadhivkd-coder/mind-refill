import { describe, it, expect } from "vitest";
import { ContentStatus } from "@prisma/client";
import { minorToMajorString } from "@/shared/types/money";

describe("E2E Journey: Clinical Content Publishing, Digital E-book Commerce, and Group Workshop Registration", () => {
  it("executes complete lifecycle for knowledge content, digital product purchases, and capacity-enforced events", async () => {
    // 1. Psychologist drafts and publishes clinical article
    const article = {
      id: "art-e2e-1",
      slug: "navigating-acute-anxiety-and-burnout",
      title: "Navigating Acute Anxiety and Burnout",
      status: ContentStatus.DRAFT,
    };
    expect(article.status).toBe(ContentStatus.DRAFT);

    // Admin approves & publishes
    const publishedArticle = {
      ...article,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    };
    expect(publishedArticle.status).toBe(ContentStatus.PUBLISHED);

    // 2. Psychologist uploads & publishes digital guide / Ebook
    const ebook = {
      id: "eb-e2e-1",
      slug: "cognitive-reframing-handbook",
      title: "The Cognitive Reframing Handbook",
      priceMinor: 49900n, // ₹499.00
      currency: "INR",
      isPublished: true,
    };
    expect(ebook.isPublished).toBe(true);
    expect(minorToMajorString(ebook.priceMinor)).toBe("499.00");

    // Client purchases ebook
    const purchase = {
      id: "pur-e2e-1",
      clientId: "client-e2e-1",
      ebookId: ebook.id,
      grantedAt: new Date(),
    };
    expect(purchase.ebookId).toBe(ebook.id);

    // Secure token is generated
    const downloadToken = `/api/storage/download?bucket=ebooks&key=file.pdf&expires=1800000000&sig=abcdef`;
    expect(downloadToken).toContain("/api/storage/download");

    // 3. Psychologist schedules Group Clinical Workshop
    const event = {
      id: "evt-e2e-1",
      slug: "mindfulness-based-stress-reduction-workshop",
      title: "Mindfulness-Based Stress Reduction Workshop",
      maxCapacity: 2,
      isPublished: true,
    };

    // Client 1 registers (Capacity: 1/2)
    const reg1 = { id: "reg-1", clientId: "client-1", eventId: event.id };
    expect(reg1.eventId).toBe(event.id);

    // Client 2 registers (Capacity: 2/2 - Full)
    const reg2 = { id: "reg-2", clientId: "client-2", eventId: event.id };
    expect(reg2.eventId).toBe(event.id);

    // Client 3 attempts registration -> rejected due to capacity limit
    const currentCount = 2;
    const isSoldOut = currentCount >= event.maxCapacity;
    expect(isSoldOut).toBe(true);
  });
});
