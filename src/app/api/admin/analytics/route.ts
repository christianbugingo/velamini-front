import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Build signups by month for last 7 months
  const now = new Date();
  const monthlySignups: { month: string; users: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = await prisma.user.count({ where: { createdAt: { gte: start, lt: end } } });
    monthlySignups.push({
      month: start.toLocaleString("en-US", { month: "short" }),
      users: count,
    });
  }

  // Daily messages for last 7 days
  const dailyMessages: { day: string; messages: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const count = await prisma.message.count({ where: { createdAt: { gte: start, lt: end } } });
    dailyMessages.push({
      day: start.toLocaleString("en-US", { weekday: "short" }),
      messages: count,
    });
  }

  // Monthly messages for last 7 months
  const monthlyMessages: { month: string; messages: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = await prisma.message.count({ where: { createdAt: { gte: start, lt: end } } });
    monthlyMessages.push({
      month: start.toLocaleString("en-US", { month: "short" }),
      messages: count,
    });
  }

  // Metrics
  const totalUsers = await prisma.user.count();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth   = await prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } });
  const newLastMonth   = await prisma.user.count({ where: { createdAt: { gte: prevMonthStart, lt: prevMonthEnd } } });
  const rawDelta = newLastMonth === 0 ? (newThisMonth > 0 ? 100 : 0) : ((newThisMonth - newLastMonth) / newLastMonth * 100);
  const growthPct = (rawDelta >= 0 ? "+" : "") + rawDelta.toFixed(0) + "%";

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekMessages = await prisma.message.count({ where: { createdAt: { gte: sevenDaysAgo } } });
  const avgMsgPerDay = weekMessages > 0 ? (weekMessages / 7).toFixed(0) : "0";

  const usersWithChats = await prisma.user.count({
    where: { virtualSelfChats: { some: {} } },
  });
  const retentionRate = totalUsers > 0 ? ((usersWithChats / totalUsers) * 100).toFixed(0) + "%" : "0%";

  return NextResponse.json({
    ok: true,
    monthlySignups,
    dailyMessages,
    monthlyMessages,
    metrics: {
      userGrowth:    growthPct,
      avgMsgPerDay,
      retentionRate,
      totalUsers,
    },
  });
}
