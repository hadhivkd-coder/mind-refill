import { PrismaClient, UserRole, VerificationStatus, SubscriptionStatus, SessionDeliveryType } from "@prisma/client";
import { PasswordService } from "../src/modules/identity/password.service";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Mind Refill database seeding...");

  // --------------------------------------------------------------------------
  // 1. Commission Rule (10% default platform fee)
  // --------------------------------------------------------------------------
  console.log("-> Seeding Commission Rules...");
  const existingCommissionRule = await prisma.commissionRule.findFirst({
    where: { isActive: true },
  });

  if (!existingCommissionRule) {
    await prisma.commissionRule.create({
      data: {
        name: "Standard Platform Commission (10%)",
        percentageBasis: 1000, // 1000 bps = 10.00%
        fixedMinor: 0n,
        currency: "INR",
        isActive: true,
      },
    });
    console.log("   ✓ Created standard 10% commission rule.");
  } else {
    console.log("   • Commission rule already exists.");
  }

  // --------------------------------------------------------------------------
  // 2. Subscription Plans
  // --------------------------------------------------------------------------
  console.log("-> Seeding Subscription Plans...");
  const plans = [
    {
      code: "starter",
      name: "Starter Practitioner",
      description: "Essential tools for independent psychologists beginning digital practice.",
      priceMinor: 0n,
      currency: "INR",
      intervalDays: 30,
      entitlementsJson: {
        maxServices: 3,
        aiPortfolioBuilder: false,
        featuredDirectory: false,
        priorityMatching: false,
        analyticsAccess: false,
      },
    },
    {
      code: "pro",
      name: "Professional Practice",
      description: "Advanced AI portfolio, expanded service listings, and practice analytics.",
      priceMinor: 199900n, // ₹1,999 / month
      currency: "INR",
      intervalDays: 30,
      entitlementsJson: {
        maxServices: 10,
        aiPortfolioBuilder: true,
        featuredDirectory: true,
        priorityMatching: false,
        analyticsAccess: true,
      },
    },
    {
      code: "elite",
      name: "Elite Clinical Practice",
      description: "Unlimited services, priority care coordination matching, and full suite access.",
      priceMinor: 499900n, // ₹4,999 / month
      currency: "INR",
      intervalDays: 30,
      entitlementsJson: {
        maxServices: 999,
        aiPortfolioBuilder: true,
        featuredDirectory: true,
        priorityMatching: true,
        analyticsAccess: true,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        description: plan.description,
        priceMinor: plan.priceMinor,
        currency: plan.currency,
        intervalDays: plan.intervalDays,
        entitlementsJson: plan.entitlementsJson,
        isActive: true,
      },
      create: {
        code: plan.code,
        name: plan.name,
        description: plan.description,
        priceMinor: plan.priceMinor,
        currency: plan.currency,
        intervalDays: plan.intervalDays,
        entitlementsJson: plan.entitlementsJson,
        isActive: true,
      },
    });
  }
  console.log("   ✓ Seeded starter, pro, and elite subscription plans.");

  // --------------------------------------------------------------------------
  // 3. Specializations
  // --------------------------------------------------------------------------
  console.log("-> Seeding Clinical Specializations...");
  const specializations = [
    { name: "Anxiety & Stress Management", slug: "anxiety-stress", description: "Generalized anxiety, panic attacks, social anxiety, and chronic stress.", isHighRisk: false, displayOrder: 1 },
    { name: "Depression & Mood Disorders", slug: "depression-mood", description: "Major depressive disorder, dysthymia, and affective balance.", isHighRisk: false, displayOrder: 2 },
    { name: "Trauma & PTSD", slug: "trauma-ptsd", description: "Complex trauma, single-incident PTSD, and EMDR-informed stabilization.", isHighRisk: true, displayOrder: 3 },
    { name: "Relationship & Couples Counseling", slug: "couples-relationship", description: "Communication breakdown, conflict resolution, and intimacy therapy.", isHighRisk: false, displayOrder: 4 },
    { name: "Grief, Bereavement & Loss", slug: "grief-loss", description: "Navigating bereavement, sudden life disruption, and existential grief.", isHighRisk: false, displayOrder: 5 },
    { name: "ADHD & Neurodivergence", slug: "adhd-neurodivergence", description: "Executive dysfunction, adult ADHD support, and neurodiversity-affirming care.", isHighRisk: false, displayOrder: 6 },
    { name: "Career, Burnout & Performance", slug: "career-burnout", description: "Occupational stress, workplace boundaries, and leadership pressure.", isHighRisk: false, displayOrder: 7 },
  ];

  for (const spec of specializations) {
    await prisma.specialization.upsert({
      where: { slug: spec.slug },
      update: {
        name: spec.name,
        description: spec.description,
        isHighRisk: spec.isHighRisk,
        displayOrder: spec.displayOrder,
        isActive: true,
      },
      create: spec,
    });
  }
  console.log(`   ✓ Seeded ${specializations.length} clinical specializations.`);

  // --------------------------------------------------------------------------
  // 4. Languages
  // --------------------------------------------------------------------------
  console.log("-> Seeding Supported Languages...");
  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name, nativeName: lang.nativeName, isActive: true },
      create: { code: lang.code, name: lang.name, nativeName: lang.nativeName, isActive: true },
    });
  }
  console.log(`   ✓ Seeded ${languages.length} languages.`);

  // --------------------------------------------------------------------------
  // 5. System Users (Admin, Coordinator, Verified Psychologist, Client)
  // --------------------------------------------------------------------------
  console.log("-> Seeding Core System Users...");

  // A. Admin User
  const adminEmail = "admin@mindrefill.com";
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const passwordHash = await PasswordService.hash("AdminSecurePassword!123");
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        roles: {
          create: { role: UserRole.ADMIN },
        },
        staffProfile: {
          create: {
            fullName: "Mind Refill Platform Administrator",
            department: "Platform Operations & Governance",
          },
        },
      },
    });
    console.log(`   ✓ Created Admin: ${adminEmail}`);
  }

  // B. Coordinator User
  const coordEmail = "coordinator@mindrefill.com";
  let coord = await prisma.user.findUnique({ where: { email: coordEmail } });
  if (!coord) {
    const passwordHash = await PasswordService.hash("CoordinatorPassword!123");
    coord = await prisma.user.create({
      data: {
        email: coordEmail,
        passwordHash,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        roles: {
          create: { role: UserRole.COORDINATOR },
        },
        staffProfile: {
          create: {
            fullName: "Lead Care Coordinator",
            department: "Clinical Care Coordination",
          },
        },
      },
    });
    console.log(`   ✓ Created Coordinator: ${coordEmail}`);
  }

  // C. Verified Psychologist User
  const psychEmail = "psychologist@mindrefill.com";
  let psych = await prisma.user.findUnique({ where: { email: psychEmail } });
  if (!psych) {
    const passwordHash = await PasswordService.hash("PsychologistPassword!123");
    psych = await prisma.user.create({
      data: {
        email: psychEmail,
        passwordHash,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        roles: {
          create: { role: UserRole.PSYCHOLOGIST },
        },
      },
    });

    const proPlan = await prisma.subscriptionPlan.findUnique({ where: { code: "pro" } });
    const anxietySpec = await prisma.specialization.findUnique({ where: { slug: "anxiety-stress" } });
    const englishLang = await prisma.language.findUnique({ where: { code: "en" } });

    const psychProfile = await prisma.psychologistProfile.create({
      data: {
        userId: psych.id,
        slug: "dr-sarah-jenkins",
        fullName: "Dr. Sarah Jenkins, Ph.D.",
        professionalTitle: "Licensed Clinical Psychologist & CBT Specialist",
        shortIntro: "Helping individuals navigate anxiety, stress, and life transitions with evidence-based care.",
        bio: "Dr. Sarah Jenkins is a licensed clinical psychologist with over 12 years of experience providing compassionate, evidence-based psychological care. She integrates cognitive-behavioral therapy (CBT) and mindfulness-based interventions to support individuals facing anxiety disorders, panic, and professional burnout.",
        yearsOfExperience: 12,
        location: "London, UK",
        timezone: "Europe/London",
        isPublic: true,
        profileState: "ACTIVE",
        verificationStatus: VerificationStatus.VERIFIED,
        areasTheyHelpWith: ["Anxiety Disorders", "Panic Attacks", "Career Burnout", "Life Transitions", "Stress Management"],
        services: {
          create: [
            {
              name: "Individual Clinical Therapy",
              description: "50-minute evidence-based cognitive behavioral therapy session.",
              durationMinutes: 50,
              priceAmountMinor: 350000n, // ₹3,500
              priceCurrency: "INR",
              deliveryType: SessionDeliveryType.ONLINE_VIDEO,
              isActive: true,
            },
            {
              name: "Initial Diagnostic Intake",
              description: "Comprehensive 60-minute assessment and personalized therapeutic roadmap.",
              durationMinutes: 60,
              priceAmountMinor: 400000n, // ₹4,000
              priceCurrency: "INR",
              deliveryType: SessionDeliveryType.ONLINE_VIDEO,
              isActive: true,
            },
          ],
        },
      },
    });

    if (anxietySpec) {
      await prisma.psychologistSpecialization.create({
        data: {
          psychologistId: psychProfile.id,
          specializationId: anxietySpec.id,
        },
      });
    }

    if (englishLang) {
      await prisma.psychologistLanguage.create({
        data: {
          psychologistId: psychProfile.id,
          languageId: englishLang.id,
        },
      });
    }

    if (proPlan) {
      const now = new Date();
      await prisma.subscription.create({
        data: {
          psychologistProfileId: psychProfile.id,
          planId: proPlan.id,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    console.log(`   ✓ Created Verified Psychologist: ${psychEmail} (/dr-sarah-jenkins)`);
  }

  // D. Demo Client User
  const clientEmail = "client@mindrefill.com";
  let client = await prisma.user.findUnique({ where: { email: clientEmail } });
  if (!client) {
    const passwordHash = await PasswordService.hash("ClientPassword!123");
    client = await prisma.user.create({
      data: {
        email: clientEmail,
        passwordHash,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        roles: {
          create: { role: UserRole.CLIENT },
        },
        clientProfile: {
          create: {
            fullName: "Alex Mercer",
            preferredLanguage: "English",
            timezone: "UTC",
          },
        },
      },
    });
    console.log(`   ✓ Created Demo Client: ${clientEmail}`);
  }

  console.log("✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
