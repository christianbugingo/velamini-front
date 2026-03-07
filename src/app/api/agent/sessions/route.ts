import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/agent/sessions
 *
 * Public endpoint — authenticated via X-Agent-Key header.
 * Returns a paginated list of conversation sessions for the organisation.
 *
 * Query params:
 *   limit  - number of results to return (default 20, max 100)
 *   page   - page number, 1-based (default 1)
 *
 * Response: { sessions: Session[], total: number, page: number, limit: number }
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
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
    const page  = Math.max(Number(url.searchParams.get("page")  ?? "1"),  1);
    const skip  = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.chat.findMany({
        where: { organizationId: org.id },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        select: {
          id:        true,
          createdAt: true,
          updatedAt: true,
          _count:    { select: { messages: true } },
          messages:  {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { role: true, content: true, createdAt: true },
          },
        },
      }),
      prisma.chat.count({ where: { organizationId: org.id } }),
    ]);

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        sessionId:    s.id,
        messageCount: s._count.messages,
        createdAt:    s.createdAt,
        updatedAt:    s.updatedAt,
        lastMessage:  s.messages[0] ?? null,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Agent sessions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
