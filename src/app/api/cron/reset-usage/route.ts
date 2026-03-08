import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Plan → monthly message limit (keep in sync with PLANS in pricing/page.tsx)
const PLAN_LIMITS: Record<string, number> = {
  free:    500,
  trial:   100,
  starter: 2_000,
  pro:     8_000,
  scale:   25_000,
};

// ── Token limits (keep in sync with webhook/route.ts) ───────────────────────
// DeepSeek blended cost ≈ 900 RWF/M tokens; budgeted at 35 % of plan price.
const ORG_TOKEN_LIMITS: Record<string, number> = {
  free:    200_000,
  trial:   100_000,
  starter: 2_000_000,
  pro:     6_000_000,
  scale:   14_000_000,
};

/**
 * GET /api/cron/reset-usage
 *
 * Resets monthlyMessageCount to 0 for every organisation and re-applies
 * the correct limit for their current plan.
 *
 * Triggered on the 1st of each month via Vercel Cron (see vercel.json).
 * Protected by CRON_SECRET — Vercel sets this header automatically when
 * the env var is defined.
 */
export async function GET(req: NextRequest) {
  // Validate cron secret — rejects any external caller
  const secret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Batch-update each plan tier in parallel
  const results = await Promise.all(
    Object.entries(PLAN_LIMITS).map(([planType, limit]) =>
      prisma.organization.updateMany({
        where: { planType },
        data: {
          monthlyMessageCount: 0,
          monthlyMessageLimit: limit,
          monthlyTokenCount:   0,
          monthlyTokenLimit:   ORG_TOKEN_LIMITS[planType] ?? 1_000_000,
          lastResetDate:       new Date(),
          tokensExhaustedAt:   null, // Clear grace period on monthly reset
        },
      })
    )
  );

  // Also reset personal usage for all users
  await prisma.user.updateMany({
    data: {
      personalMonthlyMsgCount:   0,
      personalMonthlyTokenCount: 0,
      creditsExhaustedAt:        null, // Clear grace period on monthly reset
    },
  });

  // Send end-of-month reset notification to all active personal users
  const personalUsers = await prisma.user.findMany({
    where:  { accountType: "personal", status: "active" },
    select: { id: true, personalMonthlyMsgLimit: true, personalPlanType: true },
  });
  if (personalUsers.length > 0) {
    await prisma.notification.createMany({
      data: personalUsers.map(u => ({
        userId: u.id,
        type:   "info",
        scope:  "personal",
        title:  "Monthly credits reset",
        body:   `A new month has started. Your ${(u.personalMonthlyMsgLimit ?? 200).toLocaleString()} credits have been refreshed. Top up any time in Billing to get more.`,
      })),
      skipDuplicates: true,
    }).catch(() => {});
  }

  // Send end-of-month reset notification to org owners
  const orgs = await prisma.organization.findMany({
    where:  { isActive: true },
    select: { id: true, ownerId: true, monthlyTokenLimit: true, planType: true },
  });
  for (const org of orgs) {
    if (!org.ownerId) continue;
    await prisma.notification.create({
      data: {
        userId:         org.ownerId,
        organizationId: org.id,
        type:           "info",
        scope:          "org",
        title:          "Monthly token quota reset",
        body:           `Your organisation's monthly AI token quota has been refreshed (${(org.monthlyTokenLimit ?? 1_000_000).toLocaleString()} tokens). Upgrade your plan in Billing to get a larger quota.`,
      },
    }).catch(() => {});
  }

  const totalReset = results.reduce((sum, r) => sum + r.count, 0);
  console.log(`[cron/reset-usage] Reset ${totalReset} organisations at ${new Date().toISOString()}`);

  return NextResponse.json({ ok: true, totalReset, resetAt: new Date().toISOString() });
}
