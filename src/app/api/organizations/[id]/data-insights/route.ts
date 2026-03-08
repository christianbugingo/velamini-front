import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// ── GET: list saved analyses for this org ─────────────────────────────────────
export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orgId } = await params;

    const org = await prisma.organization.findFirst({
      where: { id: orgId, ownerId: session.user.id },
      select: { id: true },
    });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const analyses = await prisma.dataAnalysis.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        rowCount: true,
        columnNames: true,
        summary: true,
        insights: true,
        charts: true,
        decisions: true,
        chatHistory: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, analyses });
  } catch (err) {
    console.error("[data-insights] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch analyses" }, { status: 500 });
  }
}

// ── POST: analyze data | save analysis | chat ─────────────────────────────────
export async function POST(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orgId } = await params;

    const org = await prisma.organization.findFirst({
      where: { id: orgId, ownerId: session.user.id },
      select: {
        id:                true,
        monthlyTokenCount: true,
        monthlyTokenLimit: true,
        tokensExhaustedAt: true,
      },
    });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const GRACE_MS = 3 * 24 * 60 * 60 * 1000;

    const body = await req.json();
    const { action } = body;

    // ── action: analyze ───────────────────────────────────────────────────────
    if (action === "analyze") {
      const { fileName, rows, columnNames } = body as {
        fileName: string;
        rows: Record<string, unknown>[];
        columnNames: string[];
      };

      if (!rows?.length || !columnNames?.length) {
        return NextResponse.json({ ok: false, error: "No data provided" }, { status: 400 });
      }

      const deepseekKey = process.env.DEEPSEEK_API_KEY;
      if (!deepseekKey) {
        return NextResponse.json({ ok: false, error: "AI service unavailable" }, { status: 503 });
      }

      // Token quota check
      if (org.monthlyTokenCount >= org.monthlyTokenLimit) {
        const now = Date.now();
        if (!org.tokensExhaustedAt) {
          await prisma.organization.update({ where: { id: orgId }, data: { tokensExhaustedAt: new Date(now) } });
          await prisma.notification.create({ data: { userId: session.user.id, organizationId: orgId, type: "warning", scope: "org", title: "Token quota exhausted", body: "Your organisation has used all its monthly AI tokens. A 3-day grace period is active — top up before it expires to keep uninterrupted service." } }).catch(() => {});
        } else if (now > org.tokensExhaustedAt.getTime() + GRACE_MS) {
          return NextResponse.json({ ok: false, error: "Monthly token quota exhausted. Please upgrade your plan to continue.", type: "quota" }, { status: 429 });
        }
      } else if (org.tokensExhaustedAt) {
        await prisma.organization.update({ where: { id: orgId }, data: { tokensExhaustedAt: null } }).catch(() => {});
      }

      // Limit rows sent to AI to avoid token overflow
      const sampleRows = rows.slice(0, 120);
      const dataPreview = JSON.stringify(sampleRows, null, 0).slice(0, 18000);

      const prompt = `You are a data analyst. Analyze this dataset and return ONLY valid JSON, no markdown.

File: "${fileName}"
Columns: ${columnNames.join(", ")}
Total rows: ${rows.length}
Sample data (first ${sampleRows.length} rows):
${dataPreview}

Return this exact JSON shape:
{
  "summary": "2-3 sentence overview of the dataset",
  "insights": [
    { "title": "Insight title", "text": "Detailed insight text", "icon": "one of: trending-up|trending-down|alert|check|star|pie|bar|users|clock|dollar" }
  ],
  "charts": [
    { "type": "bar|line|area|pie", "title": "Chart title", "xKey": "column name for x axis", "data": [{ "name": "label", "value": number }] }
  ],
  "decisions": [
    { "text": "Actionable recommendation", "priority": "high|medium|low" }
  ]
}

Rules:
- insights: 4-6 items, each with a meaningful insight about the data
- charts: 2-4 charts, pick the most informative visualizations based on the data shape
- decisions: 3-5 actionable recommendations
- All values in charts.data must be numbers`;

      const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          max_tokens: 3000,
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!aiRes.ok) {
        console.error("[data-insights] DeepSeek error:", aiRes.status);
        return NextResponse.json({ ok: false, error: "AI service error" }, { status: 502 });
      }

      const aiData = await aiRes.json();

      // Deduct tokens from org quota (best-effort)
      await prisma.organization.update({
        where: { id: orgId },
        data: {
          monthlyMessageCount: { increment: 1 },
          monthlyTokenCount:   { increment: aiData?.usage?.total_tokens ?? 0 },
        },
      }).catch(() => {});

      const raw = aiData?.choices?.[0]?.message?.content?.trim() ?? "{}";

      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

      let parsed: { summary: string; insights: unknown[]; charts: unknown[]; decisions: unknown[] };
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        console.error("[data-insights] JSON parse error, raw:", cleaned.slice(0, 300));
        return NextResponse.json({ ok: false, error: "AI returned invalid JSON" }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        analysis: {
          summary: parsed.summary ?? "",
          insights: parsed.insights ?? [],
          charts: parsed.charts ?? [],
          decisions: parsed.decisions ?? [],
        },
      });
    }

    // ── action: save ──────────────────────────────────────────────────────────
    if (action === "save") {
      const { fileName, rowCount, columnNames, summary, insights, charts, decisions, chatHistory } = body;

      const saved = await prisma.dataAnalysis.create({
        data: {
          orgId,
          fileName: fileName ?? "Untitled",
          rowCount: rowCount ?? 0,
          columnNames: columnNames ?? [],
          summary: summary ?? "",
          insights: insights ?? [],
          charts: charts ?? [],
          decisions: decisions ?? [],
          chatHistory: chatHistory ?? [],
        },
      });

      return NextResponse.json({ ok: true, id: saved.id });
    }

    // ── action: chat ──────────────────────────────────────────────────────────
    if (action === "chat") {
      const { message, history = [], dataContext, analysisId } = body as {
        message: string;
        history: { role: string; content: string }[];
        analysisId?: string;
        dataContext: {
          fileName: string;
          columnNames: string[];
          rowCount: number;
          sampleRows: Record<string, unknown>[];
        };
      };

      if (!message?.trim()) {
        return NextResponse.json({ ok: false, error: "Message required" }, { status: 400 });
      }

      const deepseekKey = process.env.DEEPSEEK_API_KEY;
      if (!deepseekKey) {
        return NextResponse.json({ ok: false, error: "AI service unavailable" }, { status: 503 });
      }

      // Token quota check
      if (org.monthlyTokenCount >= org.monthlyTokenLimit) {
        const now = Date.now();
        if (!org.tokensExhaustedAt) {
          await prisma.organization.update({ where: { id: orgId }, data: { tokensExhaustedAt: new Date(now) } });
          await prisma.notification.create({ data: { userId: session.user.id, organizationId: orgId, type: "warning", scope: "org", title: "Token quota exhausted", body: "Your organisation has used all its monthly AI tokens. A 3-day grace period is active — top up before it expires to keep uninterrupted service." } }).catch(() => {});
        } else if (now > org.tokensExhaustedAt.getTime() + GRACE_MS) {
          return NextResponse.json({ ok: false, error: "Monthly token quota exhausted. Please upgrade your plan to continue.", type: "quota" }, { status: 429 });
        }
      } else if (org.tokensExhaustedAt) {
        await prisma.organization.update({ where: { id: orgId }, data: { tokensExhaustedAt: null } }).catch(() => {});
      }

      const systemPrompt = `You are a data analyst assistant. The user has uploaded a dataset and wants to ask questions about it.

Dataset: "${dataContext?.fileName ?? "unknown"}"
Columns: ${dataContext?.columnNames?.join(", ") ?? "unknown"}
Row count: ${dataContext?.rowCount ?? "unknown"}
Sample data: ${JSON.stringify(dataContext?.sampleRows?.slice(0, 30) ?? [], null, 0).slice(0, 6000)}

Answer questions about this data. When appropriate, suggest a chart by embedding this JSON in your response:
[CHART:{"type":"bar|line|area|pie","title":"Chart title","data":[{"name":"label","value":number}]}]

Keep answers concise and data-driven.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-10).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ];

      const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          max_tokens: 1000,
          temperature: 0.5,
          messages,
        }),
      });

      if (!aiRes.ok) {
        return NextResponse.json({ ok: false, error: "AI service error" }, { status: 502 });
      }

      const aiData = await aiRes.json();

      // Deduct tokens from org quota (best-effort)
      await prisma.organization.update({
        where: { id: orgId },
        data: {
          monthlyMessageCount: { increment: 1 },
          monthlyTokenCount:   { increment: aiData?.usage?.total_tokens ?? 0 },
        },
      }).catch(() => {});

      const reply: string = aiData?.choices?.[0]?.message?.content?.trim() ?? "Sorry, I couldn't process that.";

      // Persist this exchange to the DataAnalysis record (best-effort)
      if (analysisId) {
        try {
          const existing = await prisma.dataAnalysis.findFirst({
            where: { id: analysisId, orgId },
            select: { chatHistory: true },
          });
          if (existing) {
            const prev = Array.isArray(existing.chatHistory) ? existing.chatHistory as { role: string; content: string }[] : [];
            const updated = [
              ...prev,
              { role: "user", content: message },
              { role: "assistant", content: reply },
            ];
            await prisma.dataAnalysis.update({
              where: { id: analysisId },
              data: { chatHistory: updated },
            });
          }
        } catch { /* best-effort */ }
      }

      // Extract inline chart if any
      const chartMatch = reply.match(/\[CHART:(\{.*?\})\]/s);
      let inlineChart: unknown = null;
      if (chartMatch) {
        try { inlineChart = JSON.parse(chartMatch[1]); } catch { /* ignore */ }
      }
      const cleanReply = reply.replace(/\[CHART:.*?\]/s, "").trim();

      return NextResponse.json({ ok: true, reply: cleanReply, chart: inlineChart });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[data-insights] POST error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

// ── DELETE: remove a saved analysis ──────────────────────────────────────────
export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orgId } = await params;
    const { searchParams } = new URL(req.url);
    const analysisId = searchParams.get("analysisId");

    if (!analysisId) {
      return NextResponse.json({ ok: false, error: "analysisId required" }, { status: 400 });
    }

    // Verify this org belongs to the authenticated user
    const analysis = await prisma.dataAnalysis.findFirst({
      where: { id: analysisId, orgId },
      include: { org: { select: { ownerId: true } } },
    });

    if (!analysis || analysis.org.ownerId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    await prisma.dataAnalysis.delete({ where: { id: analysisId } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[data-insights] DELETE error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
