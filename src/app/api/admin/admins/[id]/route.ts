import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/admins/[id] — demote admin back to regular user
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Prevent self-demotion
  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot demote yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role !== "admin") return NextResponse.json({ error: "User is not an admin" }, { status: 409 });

  const user = await prisma.user.update({ where: { id }, data: { role: "user" } });
  return NextResponse.json({ ok: true, user });
}
