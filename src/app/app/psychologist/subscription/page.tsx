import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { SubscriptionService } from "@/modules/subscriptions/services/subscription.service";
import Link from "next/link";
import { ArrowLeft, Crown } from "lucide-react";
import { SubscriptionManager } from "./subscription-manager";

export const dynamic = "force-dynamic";

export default async function PsychologistSubscriptionPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);
  const [plans, subData] = await Promise.all([
    SubscriptionService.listPlans(),
    SubscriptionService.getPsychologistSubscription(session.user.id),
  ]);

  const activePlanCode = subData.effectivePlan?.code || "starter";

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/app/psychologist"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Psychologist Portal
        </Link>

        <header className="border-b border-serene-200 pb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
              Practice Plan & Subscriptions
            </h1>
          </div>
          <p className="text-xs text-serene-500 mt-1">
            Choose a plan tailored to your clinical capacity. Upgrade anytime to unlock AI portfolio generation and priority triage matching.
          </p>
        </header>

        <SubscriptionManager
          plans={plans}
          currentSub={subData.subscription}
          activePlanCode={activePlanCode}
        />
      </div>
    </div>
  );
}
