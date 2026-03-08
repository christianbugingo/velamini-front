import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/admins?search=&page=1&pageSize=10
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search") ?? "";
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "10")));

  const where: Record<string, unknown> = { role: "admin" };
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, admins] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip:  (page - 1) * pageSize,
      take:  pageSize,
      select: {
        id: true, name: true, email: true, image: true,
        createdAt: true, status: true, role: true,
        passwordHash: false, // never expose hash
      },
    }),
  ]);

  return NextResponse.json({ ok: true, admins, total, page, pageSize, pages: Math.ceil(total / pageSize) });
}

// POST /api/admin/admins — promote an existing user to admin
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json() as { userId?: string };
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role === "admin") return NextResponse.json({ error: "Already an admin" }, { status: 409 });

  const admin = await prisma.user.update({ where: { id: userId }, data: { role: "admin" } });
  return NextResponse.json({ ok: true, admin });
}
