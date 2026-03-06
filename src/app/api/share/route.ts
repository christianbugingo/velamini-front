import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/share — return current sharing status for the logged-in user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const kb = await prisma.knowledgeBase.findUnique({
      where: { userId: session.user.id },
      select: { isPubliclyShared: true, shareSlug: true },
    });

    return NextResponse.json({
      ok: true,
      isPubliclyShared: kb?.isPubliclyShared ?? false,
      shareSlug: kb?.shareSlug ?? null,
    });
  } catch (error) {
    console.error("Get share status error:", error);
    return NextResponse.json({ ok: false, error: "Failed to get share status" }, { status: 500 });
  }
}
