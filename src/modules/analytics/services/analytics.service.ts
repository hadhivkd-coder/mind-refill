import { prisma } from "@/shared/database/prisma";
import { AppointmentStatus, PaymentStatus, SettlementStatus, SubscriptionStatus, UserRole, VerificationStatus } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";
import { minorToMajorString } from "@/shared/types/money";

export class AnalyticsService {
  /**
   * Computes operational and financial KPIs for a psychologist.
   */
  static async getPsychologistAnalytics(userId: string) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const [
      appointments,
      settlements,
      ebooks,
      purchasesCount,
      events,
      registrationsCount,
      articlesCount,
    ] = await Promise.all([
      prisma.appointment.findMany({
        where: { psychologistId: profile.id },
        select: { status: true },
      }),
      prisma.settlementItem.findMany({
        where: { psychologistProfileId: profile.id },
        select: { grossAmountMinor: true, commissionAmountMinor: true, netPayableMinor: true, status: true },
      }),
      prisma.ebook.findMany({
        where: { authorPsychologistId: profile.id },
        select: { id: true },
      }),
      prisma.purchase.count({
        where: { ebook: { authorPsychologistId: profile.id } },
      }),
      prisma.event.findMany({
        where: { hostPsychologistId: profile.id },
        select: { id: true },
      }),
      prisma.eventRegistration.count({
        where: { event: { hostPsychologistId: profile.id } },
      }),
      prisma.contentItem.count({
        where: { authorPsychologistId: profile.id, status: "PUBLISHED" },
      }),
    ]);

    // Appointment stats
    const totalAppointments = appointments.length;
    let completed = 0;
    let upcoming = 0;
    let cancelled = 0;
    let noShow = 0;

    for (const apt of appointments) {
      if (apt.status === AppointmentStatus.COMPLETED) completed++;
      else if (apt.status === AppointmentStatus.CONFIRMED || apt.status === AppointmentStatus.REQUESTED) upcoming++;
      else if (apt.status === AppointmentStatus.CANCELLED) cancelled++;
      else if (apt.status === AppointmentStatus.NO_SHOW) noShow++;
    }

    const completedOrCancelled = completed + cancelled + noShow;
    const completionRate = completedOrCancelled > 0 ? Math.round((completed / completedOrCancelled) * 100) : 100;

    // Financial stats
    let grossTotalMinor = 0n;
    let commissionTotalMinor = 0n;
    let netTotalMinor = 0n;

    for (const s of settlements) {
      if (s.status !== SettlementStatus.ADJUSTED) {
        grossTotalMinor += s.grossAmountMinor;
        commissionTotalMinor += s.commissionAmountMinor;
        netTotalMinor += s.netPayableMinor;
      }
    }

    return {
      appointments: {
        total: totalAppointments,
        completed,
        upcoming,
        cancelled,
        noShow,
        completionRatePercent: completionRate,
      },
      finances: {
        grossTotalMajor: minorToMajorString(grossTotalMinor),
        commissionTotalMajor: minorToMajorString(commissionTotalMinor),
        netTotalMajor: minorToMajorString(netTotalMinor),
        currency: "INR",
      },
      contentAndProducts: {
        totalEbooksAuthored: ebooks.length,
        totalEbookPurchases: purchasesCount,
        totalEventsHosted: events.length,
        totalEventRegistrations: registrationsCount,
        publishedArticlesCount: articlesCount,
      },
    };
  }

  /**
   * Computes platform-wide executive KPIs for Admin.
   */
  static async getAdminPlatformAnalytics(session: SessionWithUser) {
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Admin access required for platform analytics");
    }

    const [
      totalClients,
      totalPsychologists,
      verifiedPsychologists,
      pendingVerifications,
      totalStaff,
      succeededTransactions,
      paidPayouts,
      activeSubscriptions,
      requestsByStatus,
      appointmentsByStatus,
    ] = await Promise.all([
      prisma.clientProfile.count(),
      prisma.psychologistProfile.count(),
      prisma.psychologistProfile.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
      prisma.verificationApplication.count({ where: { status: VerificationStatus.PENDING } }),
      prisma.staffProfile.count(),
      prisma.paymentTransaction.findMany({
        where: { status: PaymentStatus.SUCCEEDED },
        select: { grossAmountMinor: true, commissionAmountMinor: true, netPayableMinor: true },
      }),
      prisma.payout.findMany({
        where: { status: "PAID" },
        select: { totalAmountMinor: true },
      }),
      prisma.subscription.findMany({
        where: { status: SubscriptionStatus.ACTIVE },
        include: { plan: { select: { code: true } } },
      }),
      prisma.counselingRequest.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // Financial totals
    let gmvMinor = 0n;
    let platformCommissionMinor = 0n;
    let netPayableMinor = 0n;

    for (const t of succeededTransactions) {
      gmvMinor += t.grossAmountMinor;
      platformCommissionMinor += t.commissionAmountMinor;
      netPayableMinor += t.netPayableMinor;
    }

    let disbursedPayoutsMinor = 0n;
    for (const p of paidPayouts) {
      disbursedPayoutsMinor += p.totalAmountMinor;
    }

    // Subscriptions by plan
    const subscriptionsByPlan: Record<string, number> = {};
    for (const sub of activeSubscriptions) {
      const code = sub.plan.code;
      subscriptionsByPlan[code] = (subscriptionsByPlan[code] || 0) + 1;
    }

    // Care requests breakdown
    const carePipeline: Record<string, number> = {};
    for (const r of requestsByStatus) {
      carePipeline[r.status] = r._count.id;
    }

    // Appointments breakdown
    const appointmentStats: Record<string, number> = {};
    let totalAppointments = 0;
    for (const a of appointmentsByStatus) {
      appointmentStats[a.status] = a._count.id;
      totalAppointments += a._count.id;
    }

    return {
      users: {
        totalClients,
        totalPsychologists,
        verifiedPsychologists,
        pendingVerifications,
        totalStaff,
      },
      finances: {
        gmvMajor: minorToMajorString(gmvMinor),
        platformCommissionMajor: minorToMajorString(platformCommissionMinor),
        netPayableMajor: minorToMajorString(netPayableMinor),
        disbursedPayoutsMajor: minorToMajorString(disbursedPayoutsMinor),
        currency: "INR",
        transactionCount: succeededTransactions.length,
      },
      subscriptions: {
        totalActive: activeSubscriptions.length,
        byPlan: subscriptionsByPlan,
      },
      carePipeline,
      appointments: {
        total: totalAppointments,
        byStatus: appointmentStats,
      },
    };
  }
}
