import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { EbookService } from "@/modules/content/services/ebook.service";
import Link from "next/link";
import { ArrowLeft, BookOpen, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientPurchasesPage() {
  const session = await enforcePageRole(UserRole.CLIENT);
  const purchases = await EbookService.getClientPurchases(session.user.id);

  return (
    <div className="min-h-screen bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] p-4 sm:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/app/client"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9CAF91] hover:text-[#F1EBDD] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Client Sanctuary</span>
          </Link>
          <Link
            href="/ebooks"
            className="px-5 py-2.5 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full transition-all shadow-sm active:scale-95"
          >
            Explore Library
          </Link>
        </div>

        <header className="border-b border-white/10 pb-5">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#9CAF91]" />
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F7F3E9]">
              Digital Library & Workbooks
            </h1>
          </div>
          <p className="text-xs text-[#C9D2BC] mt-1 font-light">
            Access and download your acquired psychoeducational guides, clinical workbooks, and self-care resources.
          </p>
        </header>

        {purchases.length === 0 ? (
          <div className="atmospheric-card rounded-3xl border border-white/10 p-12 text-center shadow-lg space-y-3 bg-[#122C25]/80">
            <BookOpen className="w-10 h-10 text-[#9CAF91] mx-auto opacity-60" />
            <h2 className="font-serif text-xl text-[#F7F3E9]">Your digital library is currently empty</h2>
            <p className="text-xs text-[#C9D2BC] max-w-sm mx-auto font-light leading-relaxed">
              Explore evidence-based self-guided workbooks and publications authored by verified psychologists.
            </p>
            <div className="pt-3">
              <Link
                href="/ebooks"
                className="px-6 py-2.5 bg-[#F1EBDD] text-[#173C32] text-xs font-semibold rounded-full shadow-md transition-all active:scale-95 inline-block"
              >
                Browse Books & Workbooks
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {purchases.map((p) => (
              <div
                key={p.purchaseId}
                className="atmospheric-card rounded-3xl border border-white/10 p-6 shadow-md flex flex-col justify-between space-y-4 bg-[#122C25]/85 hover:border-[#9CAF91]/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-[#9CAF91]">
                    By {p.authorName}
                  </div>
                  <h3 className="font-serif text-xl font-normal text-[#F7F3E9]">{p.title}</h3>
                  <p className="text-xs text-[#C9D2BC] font-light line-clamp-3 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <span className="text-[11px] text-[#9CAF91]">
                    Acquired {new Date(p.grantedAt).toLocaleDateString()}
                  </span>

                  <a
                    href={`/api/content/ebooks/${p.ebookId}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 py-2 px-5 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full transition-all shadow-sm active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
