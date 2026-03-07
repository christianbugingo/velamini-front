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
  const { status, role } = body as { status?: string; role?: string };

  const allowed = { status: ["active","pending","banned","flagged"], role: ["user","admin"] };
  const data: Record<string, string> = {};
  if (status && allowed.status.includes(status)) data.status = status;
  if (role   && allowed.role.includes(role))     data.role   = role;

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ ok: true, user });
}
