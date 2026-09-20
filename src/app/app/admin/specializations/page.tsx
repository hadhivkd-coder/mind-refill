import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { TaxonomyService } from "@/modules/profiles/services/taxonomy.service";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import AdminSpecializationManager from "./specialization-manager";

export const dynamic = "force-dynamic";

export default async function AdminSpecializationsPage() {
  await enforcePageRole(UserRole.ADMIN);

  const specializations = await TaxonomyService.getAllSpecializations();

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/app/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Console
        </Link>

        <div className="bg-white rounded-3xl border border-serene-200 p-8 shadow-sm">
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
            Taxonomy Management
          </span>
          <h1 className="text-2xl font-bold text-serene-950 mt-1">
            Clinical Specializations
          </h1>
          <p className="text-xs text-serene-500 mt-1">
            Configure clinical taxonomy used for psychologist categorization, discovery indexing, and intake routing.
          </p>
        </div>

        <AdminSpecializationManager initialSpecializations={specializations} />
      </div>
    </div>
  );
}
