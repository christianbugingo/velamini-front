import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/resumes — list all saved resumes for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const resumes = await prisma.generatedResume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, style: true, tone: true, jobTitle: true, createdAt: true, html: true },
    });

    return NextResponse.json({ resumes });
  } catch (err) {
    console.error("[resumes GET]", err);
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

// DELETE /api/resumes?id=xxx — delete a single resume
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Ensure the resume belongs to this user
    const resume = await prisma.generatedResume.findUnique({ where: { id } });
    if (!resume || resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.generatedResume.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[resumes DELETE]", err);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
