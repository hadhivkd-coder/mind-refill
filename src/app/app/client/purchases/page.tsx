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
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/app/client"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Client Portal
        </Link>

        <header className="border-b border-serene-200 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
              Digital Library & Purchases
            </h1>
          </div>
          <p className="text-xs text-serene-500 mt-1">
            Access and download your acquired psychoeducational guides, clinical workbooks, and resources.
          </p>
        </header>

        {purchases.length === 0 ? (
          <div className="bg-white rounded-3xl border border-serene-200 p-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-serene-300 mx-auto" />
            <h2 className="text-sm font-bold text-serene-800">Your digital library is currently empty</h2>
            <p className="text-xs text-serene-500 max-w-sm mx-auto">
              Explore evidence-based self-guided workbooks and publications authored by verified psychologists.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {purchases.map((p) => (
              <div
                key={p.purchaseId}
                className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-brand-700">
                    By {p.authorName}
                  </div>
                  <h3 className="text-base font-bold text-serene-900">{p.title}</h3>
                  <p className="text-xs text-serene-500 line-clamp-3">{p.description}</p>
                </div>

                <div className="border-t border-serene-100 pt-4 flex items-center justify-between">
                  <span className="text-[11px] text-serene-400">
                    Purchased {new Date(p.grantedAt).toLocaleDateString()}
                  </span>

                  <a
                    href={`/api/content/ebooks/${p.ebookId}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
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
