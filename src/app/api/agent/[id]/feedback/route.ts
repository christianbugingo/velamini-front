import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/agent/[id]/feedback
 *
 * Public endpoint — rated by org ID (no API key required).
 * Used by the hosted chat page.
 *
 * Body: { rating: 1 | -1, sessionId?: string, comment?: string }
 * Response: { ok: true, id: string }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { rating, sessionId, comment } = body as {
      rating:     number;
      sessionId?: string;
      comment?:   string;
    };

    if (rating !== 1 && rating !== -1) {
      return NextResponse.json({ error: "rating must be 1 or -1" }, { status: 400 });
    }

    // Verify org exists and is active
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, isActive: true },
    });

    if (!org || !org.isActive) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // If sessionId provided, verify it belongs to this org
    if (sessionId) {
      const chat = await prisma.chat.findFirst({
        where: { id: sessionId, organizationId: org.id },
        select: { id: true },
      });
      if (!chat) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    }

    const commentStr = [
      `[org:${org.id}]`,
      sessionId ? `[session:${sessionId}]` : null,
      comment   ? comment.slice(0, 500)   : null,
    ]
      .filter(Boolean)
      .join(" ");

    const fb = await prisma.feedback.create({
      data: { rating, comment: commentStr },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: fb.id });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
