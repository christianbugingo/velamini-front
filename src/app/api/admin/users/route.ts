import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users?search=&status=&page=1&pageSize=7
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search") ?? "";
  const status   = searchParams.get("status") ?? "all";
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "7")));

  const plan = searchParams.get("plan") ?? "all";

  const where: Record<string, unknown> = {};
  where.role = "user"; // never show admin accounts in the users/personal views
  if (status !== "all") where.status = status;
  if (plan !== "all") where.personalPlanType = plan;
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, users, activePlus, activeFree, banned] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:  (page - 1) * pageSize,
      take:  pageSize,
      select: {
        id: true, name: true, email: true, image: true,
        createdAt: true, status: true, role: true, onboardingComplete: true,
        personalPlanType: true,
        personalMonthlyMsgCount: true,
        personalMonthlyMsgLimit: true,
        personalMonthlyTokenCount: true,
        personalMonthlyTokenLimit: true,
        personalPlanRenewalDate: true,
        creditsExhaustedAt: true,
        _count: { select: { virtualSelfChats: true } },
      },
    }),
    prisma.user.count({ where: { role: "user", personalPlanType: "plus", status: "active" } }),
    prisma.user.count({ where: { role: "user", personalPlanType: "free", status: "active" } }),
    prisma.user.count({ where: { role: "user", status: "banned" } }),
  ]);

  const stats = { total: await prisma.user.count({ where: { role: "user" } }), activePlus, activeFree, banned };

  return NextResponse.json({ ok: true, users, stats, total, page, pageSize, pages: Math.ceil(total / pageSize) });
}
