import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log, warn, error as logError } from "@/lib/logger";

// GET /api/swag/resolve?slug=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    warn("/api/swag/resolve", "Missing slug param");
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  log("/api/swag/resolve", "Resolving slug", { slug });

  // 1) Try swag content match (kebab → space reverse)
  const swag = await prisma.swag.findFirst({
    where: {
      content: {
        equals: slug.replace(/-/g, " "),
        mode: "insensitive",
      },
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });
  if (swag?.user) {
    log("/api/swag/resolve", "Resolved via swag content", { slug, userId: swag.user.id });
    return NextResponse.json({ userId: swag.user.id, name: swag.user.name, image: swag.user.image });
  }

  // 2) Fallback: match KnowledgeBase.shareSlug directly (case-insensitive)
  const kb = await prisma.knowledgeBase.findFirst({
    where: {
      shareSlug: { equals: slug, mode: "insensitive" },
    },
    select: {
      user: { select: { id: true, name: true, image: true } },
    },
  });
  if (kb?.user) {
    log("/api/swag/resolve", "Resolved via shareSlug", { slug, userId: kb.user.id });
    return NextResponse.json({ userId: kb.user.id, name: kb.user.name, image: kb.user.image });
  }

  warn("/api/swag/resolve", "Slug not found", { slug });
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
