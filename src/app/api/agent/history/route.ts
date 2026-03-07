import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/agent/history
 *
 * Public endpoint — authenticated via X-Agent-Key header.
 * Returns all messages for a given session (chat).
 *
 * Query params:
 *   sessionId  - (required) the session ID returned by /api/agent/chat
 *
 * Response: { sessionId: string, messages: Message[] }
 */
export async function GET(req: Request) {
  try {
    const agentKey = req.headers.get("x-agent-key") || req.headers.get("X-Agent-Key");
    if (!agentKey) {
      return NextResponse.json({ error: "Missing X-Agent-Key header" }, { status: 401 });
    }

    const org = await prisma.organization.findUnique({
      where: { apiKey: agentKey },
      select: { id: true, isActive: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
    if (!org.isActive) {
      return NextResponse.json({ error: "Organisation is inactive" }, { status: 403 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId query parameter" }, { status: 400 });
    }

    // Verify this session belongs to this organisation
    const chat = await prisma.chat.findFirst({
      where: { id: sessionId, organizationId: org.id },
      select: {
        id:        true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: { id: true, role: true, content: true, createdAt: true },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      sessionId:    chat.id,
      createdAt:    chat.createdAt,
      updatedAt:    chat.updatedAt,
      messageCount: chat.messages.length,
      messages:     chat.messages,
    });
  } catch (error) {
    console.error("Agent history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
