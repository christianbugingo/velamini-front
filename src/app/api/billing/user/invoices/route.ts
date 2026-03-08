import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/user/invoices
 * Returns the last 20 billing records for the authenticated user.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, records] = await Promise.all([
    prisma.user.findUnique({
      where:  { id: session.user.id },
      select: {
        personalPlanType:        true,
        personalMonthlyMsgCount: true,
        personalMonthlyMsgLimit: true,
        personalPlanRenewalDate: true,
      },
    }),
    prisma.userBillingRecord.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take:    20,
      select: {
        id: true, plan: true, amountRWF: true,
        txRef: true, flwRef: true, status: true, createdAt: true,
      },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    plan: {
      type:           user.personalPlanType,
      msgCount:       user.personalMonthlyMsgCount,
      msgLimit:       user.personalMonthlyMsgLimit,
      renewalDate:    user.personalPlanRenewalDate?.toISOString() ?? null,
    },
    invoices: records.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
