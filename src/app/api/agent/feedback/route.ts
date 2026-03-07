import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/agent/feedback
 *
 * Public endpoint — authenticated via X-Agent-Key header.
 * Submit thumbs up / thumbs down feedback for a conversation or a specific reply.
 *
 * Body:
 *   rating     - 1 (thumbs up) or -1 (thumbs down)
 *   sessionId  - (optional) the session this feedback is for
 *   comment    - (optional) free-text comment
 *
 * Response: { ok: true, id: string }
 */
export async function POST(req: Request) {
  try {
    const agentKey = req.headers.get("x-agent-key") || req.headers.get("X-Agent-Key");
    if (!agentKey) {
      return NextResponse.json({ error: "Missing X-Agent-Key header" }, { status: 401 });
    }

    const org = await prisma.organization.findUnique({
      where: { apiKey: agentKey },
      select: { id: true, isActive: true, name: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
    if (!org.isActive) {
      return NextResponse.json({ error: "Organisation is inactive" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { rating, sessionId, comment } = body as {
      rating: number;
      sessionId?: string;
      comment?: string;
    };

    if (typeof rating !== "number" || (rating !== 1 && rating !== -1)) {
      return NextResponse.json(
        { error: "rating must be 1 (thumbs up) or -1 (thumbs down)" },
        { status: 400 }
      );
    }

    // Validate that sessionId belongs to this org (if provided)
    if (sessionId) {
      const chat = await prisma.chat.findFirst({
        where: { id: sessionId, organizationId: org.id },
        select: { id: true },
      });
      if (!chat) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    }

    // Store as a Feedback record; include org context in the comment field
    const contextNote = `[org:${org.id}${sessionId ? ` session:${sessionId}` : ""}] `;
    const feedback = await prisma.feedback.create({
      data: {
        rating,
        comment: contextNote + (comment ?? ""),
      },
    });

    return NextResponse.json({ ok: true, id: feedback.id });
  } catch (error) {
    console.error("Agent feedback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
