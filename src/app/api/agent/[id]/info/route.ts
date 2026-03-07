import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/agent/[id]/info
 *
 * Returns public info about an organisation's agent (name, welcome message).
 * Used by the hosted chat page to initialise the UI.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const org = await prisma.organization.findUnique({
    where: { id },
    select: {
      name:           true,
      agentName:      true,
      welcomeMessage: true,
      isActive:       true,
    },
  });

  if (!org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!org.isActive) {
    return NextResponse.json({ error: "Agent unavailable" }, { status: 403 });
  }

  return NextResponse.json({
    orgName:   org.name,
    agentName: org.agentName || org.name,
    welcome:   org.welcomeMessage ?? null,
  });
}
