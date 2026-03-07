"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { applyTheme } from "@/components/Navbar";
import {
  MessageSquare, List, History, ThumbsUp,
  Puzzle, Code2, Key, Zap, BookOpen,
  Globe, Lock, Copy, Check, Layers,
} from "lucide-react";

/* ── Sidebar ────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "overview",   label: "Overview",           Icon: BookOpen,    group: "Getting Started" },
  { id: "quickstart", label: "Quick Start",        Icon: Zap,         group: "Getting Started" },
  { id: "auth",       label: "Authentication",     Icon: Key,         group: "Getting Started" },
  { id: "chat",       label: "POST /agent/chat",   Icon: MessageSquare, group: "Public Endpoints" },
  { id: "sessions",   label: "GET /agent/sessions",Icon: List,        group: "Public Endpoints" },
  { id: "history",    label: "GET /agent/history", Icon: History,     group: "Public Endpoints" },
  { id: "feedback",   label: "POST /agent/feedback",Icon: ThumbsUp,   group: "Public Endpoints" },
  { id: "embed",      label: "Embed Widget",       Icon: Puzzle,      group: "Integrations" },
  { id: "react",      label: "React / JS",         Icon: Code2,       group: "Integrations" },
  { id: "widget-ref", label: "Widget Options",     Icon: Layers,      group: "Reference" },
  { id: "errors",     label: "Error Codes",        Icon: Globe,       group: "Reference" },
  { id: "security",   label: "Security",           Icon: Lock,        group: "Reference" },
];
const GROUPS = ["Getting Started", "Public Endpoints", "Integrations", "Reference"];

/* ── CodeBlock ──────────────────────────────────────────────── */
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };
  return (
    <div style={{ position: "relative", marginBottom: "1.2rem" }}>
      <pre style={{
        background: "var(--dc-bg)", border: "1px solid var(--dc-border-code)",
        borderRadius: 10, padding: "1rem 3.5rem 1rem 1.2rem", overflowX: "auto",
        fontSize: ".77rem", lineHeight: 1.75, color: "var(--dc-code)",
        fontFamily: "'Geist Mono','Cascadia Code','Courier New',monospace",
        margin: 0, whiteSpace: "pre",
      }}>
        <code>{code}</code>
      </pre>
      <button onClick={copy} style={{
        position: "absolute", top: 10, right: 10,
        background: "var(--dc-surface2)", border: "1px solid var(--dc-border)",
        borderRadius: 7, padding: "4px 8px", cursor: "pointer",
        color: copied ? "var(--dc-green)" : "var(--dc-muted)",
        display: "flex", alignItems: "center", gap: 4,
        fontSize: ".61rem", fontFamily: "inherit", transition: "color .15s",
      }}>
        {copied ? <Check size={10} /> : <Copy size={10} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

/* ── Note ────────────────────────────────────────────────────── */
function Note({ children, warn }: { children: React.ReactNode; warn?: boolean }) {
  const c = warn ? "#f59e0b" : "var(--dc-accent)";
  return (
    <div style={{
      borderLeft: `3px solid ${c}`, borderRadius: "0 10px 10px 0",
      background: warn ? "rgba(245,158,11,.07)" : "color-mix(in srgb,var(--dc-accent) 7%,transparent)",
      padding: "10px 14px", fontSize: ".82rem", color: "var(--dc-muted)",
      lineHeight: 1.65, marginBottom: "1.1rem",
    }}>{children}</div>
  );
}

/* ── Inline code ─────────────────────────────────────────────── */
function C({ children }: { children: string }) {
  return (
    <code style={{
      fontFamily: "'Geist Mono',monospace", fontSize: ".77rem",
      color: "var(--dc-accent)",
      background: "color-mix(in srgb,var(--dc-accent) 10%,transparent)",
      padding: "1px 5px", borderRadius: 4,
    }}>{children}</code>
  );
}

/* ── H2 ──────────────────────────────────────────────────────── */
function H2({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "1.3rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--dc-fg)", margin: 0 }}>{title}</h2>
      {sub && <p style={{ color: "var(--dc-muted)", fontSize: ".82rem", marginTop: ".3rem", marginBottom: 0 }}>{sub}</p>}
    </div>
  );
}

/* ── H3 ──────────────────────────────────────────────────────── */
function H3({ title }: { title: string }) {
  return <h3 style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--dc-fg)", margin: "1.5rem 0 .55rem" }}>{title}</h3>;
}

/* ── Method pill ─────────────────────────────────────────────── */
function Method({ m }: { m: "POST" | "GET" | "DELETE" | "PATCH" }) {
  const c: Record<string, string> = { POST: "#0ea5e9", GET: "#22c55e", DELETE: "#ef4444", PATCH: "#f59e0b" };
  return (
    <span style={{
      background: `${c[m]}22`, color: c[m],
      fontWeight: 800, fontSize: ".6rem", letterSpacing: ".05em",
      padding: "3px 8px", borderRadius: 5,
    }}>{m}</span>
  );
}

/* ── Endpoint card ───────────────────────────────────────────── */
function EP({ method, path, desc }: { method: "POST" | "GET" | "DELETE" | "PATCH"; path: string; desc: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px",
      border: "1px solid var(--dc-border)", borderRadius: 10,
      background: "var(--dc-surface2)", marginBottom: 8,
    }}>
      <Method m={method} />
      <div style={{ minWidth: 0 }}>
        <code style={{ fontFamily: "'Geist Mono',monospace", fontSize: ".8rem", color: "var(--dc-accent)" }}>{path}</code>
        <p style={{ margin: "3px 0 0", fontSize: ".76rem", color: "var(--dc-muted)" }}>{desc}</p>
      </div>
    </div>
  );
}

/* ── Badge ───────────────────────────────────────────────────── */
function Badge({ label, c }: { label: string; c: string }) {
  return (
    <span style={{
      background: `${c}18`, color: c,
      fontSize: ".59rem", fontWeight: 800, letterSpacing: ".06em",
      textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap" as const,
    }}>{label}</span>
  );
}

/* ── Param table ─────────────────────────────────────────────── */
function ParamTable({ rows }: { rows: [string, string, boolean, string][] }) {
  const th: React.CSSProperties = {
    textAlign: "left", padding: "7px 12px",
    background: "var(--dc-surface2)", color: "var(--dc-muted)",
    fontSize: ".61rem", fontWeight: 700, letterSpacing: ".08em",
    textTransform: "uppercase", borderBottom: "1px solid var(--dc-border)",
  };
  const td: React.CSSProperties = { padding: "8px 12px", borderBottom: "1px solid var(--dc-border)", verticalAlign: "top", lineHeight: 1.5 };
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".79rem", marginBottom: "1.1rem" }}>
      <thead><tr><th style={th}>Field</th><th style={th}>Type</th><th style={th}>Required</th><th style={th}>Description</th></tr></thead>
      <tbody>
        {rows.map(([field, type, req, desc]) => (
          <tr key={field}>
            <td style={td}><C>{field}</C></td>
            <td style={{ ...td, color: "var(--dc-muted)" }}>{type}</td>
            <td style={td}><Badge label={req ? "yes" : "no"} c={req ? "#f59e0b" : "#64748b"} /></td>
            <td style={{ ...td, color: "var(--dc-muted)" }}>{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  PAGE                                                           */
/* ─────────────────────────────────────────────────────────────── */
export default function DocsPage() {
  const [isDark, setIsDark] = useState(false);
  const [active, setActive] = useState("overview");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefer = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const d = stored ? stored === "dark" : prefer;
      setIsDark(d); applyTheme(d);
    } catch {}
  }, []);

  const toggleTheme = () => setIsDark(p => {
    const n = !p; applyTheme(n); localStorage.setItem("theme", n ? "dark" : "light"); return n;
  });

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-25% 0px -65% 0px" }
    );
    SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const p = (txt: string) => (
    <p style={{ fontSize: ".83rem", color: "var(--dc-muted)", lineHeight: 1.8, margin: "0 0 .9rem" }}>{txt}</p>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Geist+Mono:wght@400&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        body{margin:0}
        :root{
          --dc-page:   #f0f8ff;
          --dc-surface:#fff;
          --dc-surface2:#f4faff;
          --dc-border: #cae6f8;
          --dc-border-code:#1a3248;
          --dc-fg:     #0c1a26;
          --dc-muted:  #4a7a98;
          --dc-accent: #0ea5e9;
          --dc-bg:     #0c1420;
          --dc-code:   #a5d8f0;
          --dc-green:  #16a34a;
        }
        .ddark{
          --dc-page:   #070c12;
          --dc-surface:#0a1520;
          --dc-surface2:#0e1c2a;
          --dc-border: #1a3248;
          --dc-border-code:#1a3248;
          --dc-fg:     #e8f4fd;
          --dc-muted:  #7ea8c4;
          --dc-accent: #38bdf8;
          --dc-bg:     #060d14;
          --dc-code:   #93d4f5;
          --dc-green:  #22c55e;
        }
        .dw{background:var(--dc-page);color:var(--dc-fg);min-height:100dvh;transition:background .3s,color .3s;font-family:system-ui,-apple-system,sans-serif}
        .dl{display:flex;max-width:1220px;margin:0 auto;padding:0 1rem;padding-top:3.75rem}
        /* sidebar */
        .dsb{width:230px;flex-shrink:0;position:sticky;top:3.75rem;height:calc(100dvh - 3.75rem);overflow-y:auto;padding:2rem 0;scrollbar-width:none;border-right:1px solid var(--dc-border)}
        .dsb::-webkit-scrollbar{display:none}
        .dsb-lbl{font-size:.57rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--dc-muted);padding:0 1rem 5px;margin-top:1.4rem}
        .dsb-lbl:first-child{margin-top:0}
        .dsb-btn{display:flex;align-items:center;gap:8px;padding:6px 1rem;border:none;border-left:2px solid transparent;background:none;width:100%;text-align:left;font-size:.79rem;color:var(--dc-muted);cursor:pointer;font-family:inherit;transition:color .12s,background .12s}
        .dsb-btn:hover{color:var(--dc-fg)}
        .dsb-btn.on{color:var(--dc-accent)!important;border-left-color:var(--dc-accent);background:color-mix(in srgb,var(--dc-accent) 7%,transparent);font-weight:600}
        .dsb-btn svg{width:12px;height:12px;flex-shrink:0}
        /* content */
        .dcon{flex:1;min-width:0;padding:2.5rem 1rem 5rem 3rem;max-width:800px}
        .dsec{padding-top:2.5rem;border-top:1px solid var(--dc-border);margin-top:2.5rem}
        .dsec:first-child{border-top:none;margin-top:0;padding-top:0}
        /* response grid */
        .dgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:700px){.dgrid{grid-template-columns:1fr}}
        @media(max-width:860px){.dsb{display:none}.dcon{padding-left:0}}
      `}</style>

      <div className={`dw${isDark ? " ddark" : ""}`}>
        <Navbar isDarkMode={isDark} onThemeToggle={toggleTheme} />

        <div className="dl">

          {/* ── Sidebar ── */}
          <aside className="dsb">
            {GROUPS.map(group => (
              <div key={group}>
                <div className="dsb-lbl">{group}</div>
                {SECTIONS.filter(s => s.group === group).map(({ id, label, Icon }) => (
                  <button key={id} className={`dsb-btn${active === id ? " on" : ""}`} onClick={() => scrollTo(id)}>
                    <Icon />{label}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          {/* ── Content ── */}
          <main className="dcon">

            {/* ─── OVERVIEW ─────────────────────────────────── */}
            <section id="overview" className="dsec">
              <H2 title="Velamini Public API" sub="Integrate your trained AI agent into any platform using 4 simple endpoints." />
              <Note>
                <strong>Base URL — </strong><C>https://velamini.com/api</C><br />
                All endpoints below live under <C>/api/agent/</C> and authenticate via the <C>X-Agent-Key</C> header.
              </Note>
              {p("Every organisation on Velamini gets a unique API key (looks like vela_xxxx). Use it to chat with the agent, retrieve past conversations, view message history, and collect user feedback — without exposing your dashboard credentials.")}

              <EP method="POST" path="/api/agent/chat"     desc="Send a message, get a reply" />
              <EP method="GET"  path="/api/agent/sessions" desc="List all conversation sessions" />
              <EP method="GET"  path="/api/agent/history"  desc="Get all messages for a session" />
              <EP method="POST" path="/api/agent/feedback" desc="Submit thumbs up / thumbs down feedback" />
            </section>

            {/* ─── QUICK START ──────────────────────────────── */}
            <section id="quickstart" className="dsec">
              <H2 title="Quick Start" sub="Get your agent responding in 60 seconds." />
              {[
                ["Open the API & Embed tab", "Go to your organisation dashboard → API & Embed tab."],
                ["Copy your API key",        "Copy the key shown (vela_xxxx). Keep it secret."],
                ["Make your first request",  "Run the curl command below — replace the key with yours."],
              ].map(([t, d], i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", marginBottom: 8, border: "1px solid var(--dc-border)", borderRadius: 10, background: "var(--dc-surface2)" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "color-mix(in srgb,var(--dc-accent) 14%,transparent)", color: "var(--dc-accent)", fontSize: ".7rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: ".84rem", fontWeight: 700, color: "var(--dc-fg)", marginBottom: 2 }}>{t}</div>
                    <div style={{ fontSize: ".77rem", color: "var(--dc-muted)", lineHeight: 1.55 }}>{d}</div>
                  </div>
                </div>
              ))}
              <CodeBlock code={`curl -X POST https://velamini.com/api/agent/chat \\
  -H "Content-Type: application/json" \\
  -H "X-Agent-Key: vela_your_key_here" \\
  -d '{"message": "Hello, what can you help me with?"}'`} />
              <CodeBlock code={`// Response
{
  "reply":     "Hi! I'm your AI assistant. I can help you with...",
  "sessionId": "cm9abc123def456",
  "agentName": "Support Bot"
}`} />
            </section>

            {/* ─── AUTH ─────────────────────────────────────── */}
            <section id="auth" className="dsec">
              <H2 title="Authentication" sub="All 4 public endpoints use the same header." />
              {p("Include your organisation's API key in the X-Agent-Key HTTP header on every request. The key is validated against your organisation — if it's wrong, expired, or the org is disabled, you'll get a 401 or 403.")}
              <CodeBlock code={`X-Agent-Key: vela_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`} />
              <Note warn>
                <strong>Never expose your key in public client-side code or git repositories.</strong> Use the Embed Widget (which handles key management safely) or call from your own server.  You can rotate your key any time from the API & Embed tab.
              </Note>
            </section>

            {/* ─── CHAT ─────────────────────────────────────── */}
            <section id="chat" className="dsec">
              <H2 title="POST /api/agent/chat" sub="Send a message to your agent and get an AI reply." />
              <EP method="POST" path="/api/agent/chat" desc="The core endpoint — send a user message, get the agent's response." />

              <H3 title="Request body" />
              <ParamTable rows={[
                ["message",   "string",  true,  "The user's message. Maximum 2 000 characters."],
                ["sessionId", "string",  false, "Session ID from a previous response. Re-using the same ID continues the conversation with full history."],
                ["history",   "array",   false, "Fallback context: array of { role: 'user'|'assistant', content: string }. Used only if sessionId is new or absent."],
              ]} />

              <H3 title="cURL example" />
              <CodeBlock code={`curl -X POST https://velamini.com/api/agent/chat \\
  -H "Content-Type: application/json" \\
  -H "X-Agent-Key: vela_your_key_here" \\
  -d '{
    "message":   "Do you offer free shipping?",
    "sessionId": "cm9abc123def456"
  }'`} />

              <H3 title="Response" />
              <CodeBlock code={`{
  "reply":     "Yes! We offer free standard shipping on orders over $50.",
  "sessionId": "cm9abc123def456",
  "agentName": "Support Bot"
}`} />

              <H3 title="Multi-turn conversation" />
              {p("The sessionId ties messages together in the database. Re-send it on every follow-up message and the agent will automatically have the full conversation history as context.")}
              <CodeBlock code={`// Turn 1 — no sessionId yet
const r1 = await fetch("https://velamini.com/api/agent/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Agent-Key": KEY },
  body: JSON.stringify({ message: "What products do you sell?" }),
});
const d1 = await r1.json();
// d1.sessionId → "cm9abc123def456"

// Turn 2 — re-use sessionId to continue the conversation
const r2 = await fetch("https://velamini.com/api/agent/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Agent-Key": KEY },
  body: JSON.stringify({
    message:   "Which one is the cheapest?",
    sessionId: d1.sessionId,   // ← same session
  }),
});`} />
            </section>

            {/* ─── SESSIONS ─────────────────────────────────── */}
            <section id="sessions" className="dsec">
              <H2 title="GET /api/agent/sessions" sub="List all conversation sessions for your organisation." />
              <EP method="GET" path="/api/agent/sessions" desc="Returns a paginated list of sessions, newest first." />

              <H3 title="Query parameters" />
              <ParamTable rows={[
                ["limit", "number", false, "Results per page. Default 20, max 100."],
                ["page",  "number", false, "Page number (1-based). Default 1."],
              ]} />

              <H3 title="cURL example" />
              <CodeBlock code={`curl "https://velamini.com/api/agent/sessions?limit=10&page=1" \\
  -H "X-Agent-Key: vela_your_key_here"`} />

              <H3 title="Response" />
              <CodeBlock code={`{
  "sessions": [
    {
      "sessionId":    "cm9abc123def456",
      "messageCount": 6,
      "createdAt":    "2026-03-07T10:00:00.000Z",
      "updatedAt":    "2026-03-07T10:05:00.000Z",
      "lastMessage": {
        "role":      "assistant",
        "content":   "Is there anything else I can help with?",
        "createdAt": "2026-03-07T10:05:00.000Z"
      }
    }
  ],
  "total": 142,
  "page":  1,
  "limit": 10
}`} />
            </section>

            {/* ─── HISTORY ──────────────────────────────────── */}
            <section id="history" className="dsec">
              <H2 title="GET /api/agent/history" sub="Retrieve every message in a specific conversation session." />
              <EP method="GET" path="/api/agent/history" desc="Returns all messages for a session, in chronological order." />

              <H3 title="Query parameters" />
              <ParamTable rows={[
                ["sessionId", "string", true, "The session ID returned by POST /api/agent/chat."],
              ]} />

              <H3 title="cURL example" />
              <CodeBlock code={`curl "https://velamini.com/api/agent/history?sessionId=cm9abc123def456" \\
  -H "X-Agent-Key: vela_your_key_here"`} />

              <H3 title="Response" />
              <CodeBlock code={`{
  "sessionId":    "cm9abc123def456",
  "createdAt":    "2026-03-07T10:00:00.000Z",
  "updatedAt":    "2026-03-07T10:05:00.000Z",
  "messageCount": 4,
  "messages": [
    { "id": "msg_1", "role": "user",      "content": "Do you offer free shipping?", "createdAt": "2026-03-07T10:00:00.000Z" },
    { "id": "msg_2", "role": "assistant", "content": "Yes! Orders over $50...",      "createdAt": "2026-03-07T10:00:01.000Z" },
    { "id": "msg_3", "role": "user",      "content": "What about returns?",          "createdAt": "2026-03-07T10:04:00.000Z" },
    { "id": "msg_4", "role": "assistant", "content": "We accept returns within...",   "createdAt": "2026-03-07T10:04:01.000Z" }
  ]
}`} />
            </section>

            {/* ─── FEEDBACK ─────────────────────────────────── */}
            <section id="feedback" className="dsec">
              <H2 title="POST /api/agent/feedback" sub="Submit a thumbs up or thumbs down rating for a conversation." />
              <EP method="POST" path="/api/agent/feedback" desc="Record user satisfaction feedback, optionally linked to a session." />

              <H3 title="Request body" />
              <ParamTable rows={[
                ["rating",    "number", true,  "1 = thumbs up, -1 = thumbs down. Only 1 or -1 is accepted."],
                ["sessionId", "string", false, "The session ID to attach this feedback to."],
                ["comment",   "string", false, "Optional free-text comment from the user."],
              ]} />

              <H3 title="cURL example" />
              <CodeBlock code={`curl -X POST https://velamini.com/api/agent/feedback \\
  -H "Content-Type: application/json" \\
  -H "X-Agent-Key: vela_your_key_here" \\
  -d '{
    "rating":    1,
    "sessionId": "cm9abc123def456",
    "comment":   "Very helpful, answered quickly!"
  }'`} />

              <H3 title="Response" />
              <CodeBlock code={`{
  "ok": true,
  "id": "feedback_cm9xyz"
}`} />

              <H3 title="Typical usage — add a feedback row after each reply" />
              <CodeBlock code={`// After rendering the agent's reply, show thumbs up/down buttons
async function submitFeedback(rating: 1 | -1, sessionId: string) {
  await fetch("https://velamini.com/api/agent/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Key": YOUR_KEY,
    },
    body: JSON.stringify({ rating, sessionId }),
  });
}`} />
            </section>

            {/* ─── EMBED WIDGET ─────────────────────────────── */}
            <section id="embed" className="dsec">
              <H2 title="Embed Widget" sub="One script tag — instant chat bubble on any webpage." />
              {p("The widget is self-contained vanilla JS. It calls /api/agent/chat automatically, handles session persistence, dark/light theme, and mobile layout. No React, no build step.")}

              <H3 title="Installation" />
              <CodeBlock code={`<!-- Paste before </body> on any HTML page -->
<script
  src="https://velamini.com/embed/agent.js"
  data-agent-key="vela_your_key_here"
  data-agent-name="Support Bot"
  data-theme="auto"
  defer>
</script>`} />

              <H3 title="Configuration attributes" />
              <ParamTable rows={[
                ["data-agent-key",  "string", true,  "Your organisation's API key."],
                ["data-agent-name", "string", false, "Name shown in the chat header."],
                ["data-theme",      "string", false, "auto (default) | light | dark."],
                ["data-api-base",   "string", false, "Override the API origin (for self-hosted). Defaults to https://velamini.com."],
              ]} />

              <H3 title="Platform-specific instructions" />
              <CodeBlock code={`// WordPress / Webflow / Squarespace
// Paste in: Appearance → Theme Editor → footer.php
// OR Site Settings → Custom Code → Footer

// Next.js — inject in layout.tsx
useEffect(() => {
  if (document.getElementById("vela-root")) return;
  const s = document.createElement("script");
  s.src              = "https://velamini.com/embed/agent.js";
  s.defer            = true;
  s.dataset.agentKey = process.env.NEXT_PUBLIC_AGENT_KEY!;
  s.dataset.theme    = "auto";
  document.body.appendChild(s);
}, []);`} />

              <H3 title="Headless trigger (custom open button)" />
              <CodeBlock code={`// Dispatch this event from any button to open/close the widget
window.dispatchEvent(new CustomEvent("vela:open"));
window.dispatchEvent(new CustomEvent("vela:close"));\`} />`} />
            </section>

            {/* ─── REACT ────────────────────────────────────── */}
            <section id="react" className="dsec">
              <H2 title="React / JavaScript Integration" sub="Build a fully custom chat UI using the 4 public endpoints." />

              <H3 title="Full chat hook" />
              <CodeBlock code={`import { useState, useRef } from "react";

const KEY = process.env.NEXT_PUBLIC_AGENT_KEY!;
const BASE = "https://velamini.com/api/agent";

export function useAgentChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading,  setLoading]  = useState(false);
  const sessionId = useRef<string | undefined>(undefined);

  const send = async (text: string) => {
    setMessages(m => [...m, { role: "user", content: text }]);
    setLoading(true);

    const res  = await fetch(\`\${BASE}/chat\`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Key": KEY },
      body: JSON.stringify({ message: text, sessionId: sessionId.current }),
    });
    const data = await res.json();
    sessionId.current = data.sessionId;
    setMessages(m => [...m, { role: "assistant", content: data.reply }]);
    setLoading(false);
    return data.sessionId as string;
  };

  const submitFeedback = async (rating: 1 | -1) => {
    if (!sessionId.current) return;
    await fetch(\`\${BASE}/feedback\`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Key": KEY },
      body: JSON.stringify({ rating, sessionId: sessionId.current }),
    });
  };

  return { messages, loading, send, submitFeedback };
}`} />

              <H3 title="Load past sessions" />
              <CodeBlock code={`async function loadSessions(page = 1) {
  const res  = await fetch(
    \`https://velamini.com/api/agent/sessions?page=\${page}&limit=20\`,
    { headers: { "X-Agent-Key": KEY } }
  );
  const { sessions, total } = await res.json();
  return { sessions, total };
}

async function loadHistory(sessionId: string) {
  const res  = await fetch(
    \`https://velamini.com/api/agent/history?sessionId=\${sessionId}\`,
    { headers: { "X-Agent-Key": KEY } }
  );
  const { messages } = await res.json();
  return messages;
}`} />
            </section>

            {/* ─── WIDGET REF ───────────────────────────────── */}
            <section id="widget-ref" className="dsec">
              <H2 title="Widget Options Reference" />
              <ParamTable rows={[
                ["data-agent-key",  "string", true,  "Organisation API key starting with vela_."],
                ["data-agent-name", "string", false, "Header title in chat panel. Falls back to org agentName."],
                ["data-theme",      "string", false, "auto | light | dark. auto follows prefers-color-scheme + page's data-theme."],
                ["data-api-base",   "string", false, "Full origin override e.g. https://my-instance.com."],
              ]} />

              <H3 title="Widget behaviour" />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".79rem", marginBottom: "1.1rem" }}>
                <thead><tr>{["Feature", "Detail"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 12px", background: "var(--dc-surface2)", color: "var(--dc-muted)", fontSize: ".61rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", borderBottom: "1px solid var(--dc-border)" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {[
                    ["Session persistence", "Conversation stored in localStorage and the Velamini DB. Survives page refresh."],
                    ["Mobile layout",       "Full-width bottom drawer on screens < 480 px."],
                    ["Keyboard",            "Enter to send · Shift+Enter for newline · Esc to close."],
                    ["Context window",      "Sends last 8 messages as history for coherent multi-turn replies."],
                    ["Typing indicator",    "Animated dots while the agent is thinking."],
                    ["Chat + History API",  "sessionId from the widget can be used with /agent/sessions and /agent/history."],
                  ].map(([f, d]) => (
                    <tr key={f}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--dc-border)", color: "var(--dc-fg)", whiteSpace: "nowrap" }}>{f}</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--dc-border)", color: "var(--dc-muted)" }}>{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* ─── ERRORS ───────────────────────────────────── */}
            <section id="errors" className="dsec">
              <H2 title="Error Codes" sub="All endpoints return errors in the same shape." />
              <CodeBlock code={`{ "error": "Human-readable error message" }`} />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".79rem", marginBottom: "1.1rem" }}>
                <thead><tr>{["Status", "Meaning", "Cause"].map(h => <th key={h} style={{ textAlign: "left", padding: "7px 12px", background: "var(--dc-surface2)", color: "var(--dc-muted)", fontSize: ".61rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", borderBottom: "1px solid var(--dc-border)" }}>{h}</th>)}</tr></thead>
                <tbody>
                  {[
                    ["400", "Bad Request",          "Missing / invalid field in request body or query params."],
                    ["401", "Unauthorized",          "Missing X-Agent-Key, or the key does not match any organisation."],
                    ["403", "Forbidden",             "Organisation is disabled (isActive = false)."],
                    ["404", "Not Found",             "Session ID not found or does not belong to this organisation."],
                    ["500", "Internal Server Error", "Unexpected error — retry after a moment."],
                    ["502", "Bad Gateway",           "The AI service returned an error."],
                    ["503", "Service Unavailable",   "AI service is temporarily unavailable."],
                  ].map(([code, name, cause]) => (
                    <tr key={code}>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--dc-border)" }}>
                        <Badge label={code} c={code.startsWith("2") ? "#22c55e" : code.startsWith("4") ? "#f59e0b" : "#ef4444"} />
                      </td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--dc-border)", color: "var(--dc-fg)", fontWeight: 600 }}>{name}</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid var(--dc-border)", color: "var(--dc-muted)" }}>{cause}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* ─── SECURITY ─────────────────────────────────── */}
            <section id="security" className="dsec">
              <H2 title="Security" sub="Best practices for protecting your API key and agent." />
              {[
                ["Keep keys in environment variables", "Store your key as NEXT_PUBLIC_AGENT_KEY or server-side AGENT_KEY — never hard-code in source files."],
                ["Rotate regularly",                   "Use the API & Embed tab in the dashboard to generate a new key instantly. Rotate when you suspect exposure."],
                ["Disable unused organisations",       "Set isActive: false from the Settings tab to instantly reject all requests from that key."],
                ["CORS",                               "Only /api/agent/* endpoints accept cross-origin requests (needed for the embed widget). All dashboard admin routes require a session cookie."],
                ["Message limits",                     "Messages over 2 000 characters are rejected to prevent prompt injection and abuse."],
                ["HTTPS only",                         "Always use https:// — HTTP requests will be redirected or rejected."],
              ].map(([title, desc]) => (
                <div key={title} style={{ padding: "11px 14px", marginBottom: 8, border: "1px solid var(--dc-border)", borderRadius: 10, background: "var(--dc-surface2)" }}>
                  <div style={{ fontSize: ".83rem", fontWeight: 700, color: "var(--dc-fg)", marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: ".77rem", color: "var(--dc-muted)", lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </section>

          </main>
        </div>
      </div>
    </>
  );
}

