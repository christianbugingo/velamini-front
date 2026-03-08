import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/[id]  { status?: string, role?: string }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { status, role, personalPlanType } = body as { status?: string; role?: string; personalPlanType?: string };

  const allowed = { status: ["active","pending","banned","flagged"], role: ["user","admin"], plan: ["free","plus"] };
  const data: Record<string, unknown> = {};
  if (status          && allowed.status.includes(status))          data.status = status;
  if (role            && allowed.role.includes(role))              data.role   = role;
  if (personalPlanType && allowed.plan.includes(personalPlanType)) {
    data.personalPlanType = personalPlanType;
    // Update limits to match the new plan
    if (personalPlanType === "plus") {
      data.personalMonthlyMsgLimit   = 1500;
      data.personalMonthlyTokenLimit = 1000000;
    } else {
      data.personalMonthlyMsgLimit   = 200;
      data.personalMonthlyTokenLimit = 150000;
    }
  }

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ ok: true, user });
}
