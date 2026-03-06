import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json().catch(() => ({}));
    let { shareSlug } = body;

    // If no slug passed, use the one already stored in the KB (set when swag was created)
    if (!shareSlug) {
      const kb = await prisma.knowledgeBase.findUnique({
        where: { userId },
        select: { shareSlug: true },
      });
      shareSlug = kb?.shareSlug;
    }

    // Final fallback: derive from the user's first swag
    if (!shareSlug) {
      const swag = await prisma.swag.findFirst({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { content: true },
      });
      if (swag?.content) {
        shareSlug = swag.content.trim().replace(/\s+/g, "-").toLowerCase();
      }
    }

    if (!shareSlug) {
      return NextResponse.json(
        { ok: false, error: "No share slug found. Create swag first." },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(shareSlug)) {
      return NextResponse.json(
        { ok: false, error: "Slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Check if slug is already taken by another user
    const existing = await prisma.knowledgeBase.findUnique({ where: { shareSlug } });
    if (existing && existing.userId !== userId) {
      return NextResponse.json({ ok: false, error: "This slug is already taken" }, { status: 409 });
    }

    const knowledgeBase = await prisma.knowledgeBase.update({
      where: { userId },
      data: { shareSlug, isPubliclyShared: true },
    });

    const shareUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/chat/${shareSlug}`;

    return NextResponse.json({ ok: true, shareUrl, shareSlug: knowledgeBase.shareSlug });
  } catch (error) {
    console.error("Enable sharing error:", error);
    return NextResponse.json({ ok: false, error: "Failed to enable sharing" }, { status: 500 });
  }
}
