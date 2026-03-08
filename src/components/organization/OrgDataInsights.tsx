"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Upload, FileText, Trash2, MessageSquare, ChevronLeft,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Star, Users, Clock, DollarSign, PieChart as PieIcon,
  BarChart2, Send, Loader2, X, Save, History,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChartSpec {
  type: "bar" | "line" | "area" | "pie";
  title: string;
  xKey?: string;
  data: { name: string; value: number }[];
}

interface Insight {
  title: string;
  text: string;
  icon: string;
}

interface Decision {
  text: string;
  priority: "high" | "medium" | "low";
}

interface Analysis {
  fileName: string;
  rowCount: number;
  columnNames: string[];
  summary: string;
  insights: Insight[];
  charts: ChartSpec[];
  decisions: Decision[];
}

interface SavedAnalysis extends Analysis {
  id: string;
  createdAt: string;
  chatHistory?: { role: "user" | "assistant"; content: string }[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  chart?: ChartSpec;
}

interface Props {
  orgId: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CHART_COLORS = ["#38AECC","#818CF8","#34D399","#F59E0B","#EF4444","#EC4899","#14B8A6","#F97316"];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Helpers ───────────────────────────────────────────────────────────────────

function insightIcon(name: string) {
  const map: Record<string, React.ReactNode> = {
    "trending-up":   <TrendingUp  size={14} />,
    "trending-down": <TrendingDown size={14} />,
    "alert":         <AlertTriangle size={14} />,
    "check":         <CheckCircle  size={14} />,
    "star":          <Star         size={14} />,
    "pie":           <PieIcon      size={14} />,
    "bar":           <BarChart2    size={14} />,
    "users":         <Users        size={14} />,
    "clock":         <Clock        size={14} />,
    "dollar":        <DollarSign   size={14} />,
  };
  return map[name] ?? <Star size={14} />;
}

function priorityColor(p: string) {
  if (p === "high")   return "var(--c-danger)";
  if (p === "medium") return "var(--c-warn)";
  return "var(--c-success)";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ── Chart renderer ────────────────────────────────────────────────────────────

function DataChart({ spec }: { spec: ChartSpec }) {
  const common = {
    data: spec.data,
    margin: { top: 4, right: 8, left: -16, bottom: 4 },
  };

  const tooltip = (
    <Tooltip
      contentStyle={{
        background: "var(--c-surface)", border: "1px solid var(--c-border)",
        borderRadius: 8, fontSize: ".72rem", color: "var(--c-text)",
      }}
    />
  );

  if (spec.type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={spec.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={76} label={(props) => `${props.name ?? ""} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
            {spec.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          {tooltip}
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (spec.type === "line") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart {...common}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
          <XAxis dataKey="name" tick={{ fill: "var(--c-muted)", fontSize: 10 }} />
          <YAxis tick={{ fill: "var(--c-muted)", fontSize: 10 }} width={40} />
          {tooltip}
          <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (spec.type === "area") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart {...common}>
          <defs>
            <linearGradient id="diGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
          <XAxis dataKey="name" tick={{ fill: "var(--c-muted)", fontSize: 10 }} />
          <YAxis tick={{ fill: "var(--c-muted)", fontSize: 10 }} width={40} />
          {tooltip}
          <Area type="monotone" dataKey="value" stroke={CHART_COLORS[0]} fill="url(#diGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // default: bar
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
        <XAxis dataKey="name" tick={{ fill: "var(--c-muted)", fontSize: 10 }} />
        <YAxis tick={{ fill: "var(--c-muted)", fontSize: 10 }} width={40} />
        {tooltip}
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {spec.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── File parser ───────────────────────────────────────────────────────────────

async function parseFile(file: File): Promise<{ rows: Record<string, unknown>[]; columnNames: string[] }> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "json") {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const rows: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : [parsed];
    const columnNames = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { rows, columnNames };
  }

  if (ext === "csv" || ext === "tsv") {
    // Use dynamic import for papaparse
    const Papa = (await import("papaparse")).default;
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result: { data: Record<string, unknown>[]; meta: { fields?: string[] } }) => {
          const rows = result.data as Record<string, unknown>[];
          const columnNames = result.meta.fields ?? [];
          resolve({ rows, columnNames });
        },
        error: reject,
      });
    });
  }

  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: null });
    const columnNames = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { rows, columnNames };
  }

  if (ext === "pdf") {
    // PDF — we can't parse client-side easily; return metadata only
    return { rows: [{ note: "PDF files cannot be parsed for data. Please use CSV, XLSX, or JSON." }], columnNames: ["note"] };
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OrgDataInsights({ orgId }: Props) {
  type View = "home" | "analyzing" | "analysis" | "chat";

  const [view, setView]         = useState<View>("home");
  const [dragActive, setDragActive]   = useState(false);
  const [parseError, setParseError]   = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [savedAnalyses,   setSavedAnalyses]   = useState<SavedAnalysis[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving]     = useState(false);
  const [savedId, setSavedId]   = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef   = useRef<HTMLDivElement>(null);

  // Load saved analyses
  useEffect(() => {
    setLoadingList(true);
    fetch(`/api/organizations/${orgId}/data-insights`)
      .then(r => r.json())
      .then(d => { if (d.ok) setSavedAnalyses(d.analyses ?? []); })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, [orgId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ── File handling ───────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    setParseError(null);
    setAnalyzeError(null);
    setSavedId(null);

    if (file.size > MAX_FILE_BYTES) {
      setParseError("File is too large. Maximum size is 10 MB.");
      return;
    }

    setView("analyzing");

    let rows: Record<string, unknown>[] = [];
    let columnNames: string[] = [];

    try {
      const parsed = await parseFile(file);
      rows        = parsed.rows;
      columnNames = parsed.columnNames;
    } catch (e) {
      setView("home");
      setParseError(e instanceof Error ? e.message : "Failed to parse file.");
      return;
    }

    if (!rows.length) {
      setView("home");
      setParseError("The file appears to be empty.");
      return;
    }

    try {
      const res = await fetch(`/api/organizations/${orgId}/data-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze",
          fileName: file.name,
          rows,
          columnNames,
        }),
      });
      const data = await res.json();

      if (!data.ok) {
        setView("home");
        setAnalyzeError(data.error ?? "Analysis failed.");
        return;
      }

      setCurrentAnalysis({
        fileName: file.name,
        rowCount: rows.length,
        columnNames,
        ...data.analysis,
      });
      setChatMessages([]);
      setView("analysis");
    } catch {
      setView("home");
      setAnalyzeError("Network error. Please try again.");
    }
  }, [orgId]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }, [handleFile]);

  // ── Save analysis ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!currentAnalysis || saving || savedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/data-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", ...currentAnalysis }),
      });
      const data = await res.json();
      if (data.ok) {
        setSavedId(data.id);
        // Refetch list
        const listRes = await fetch(`/api/organizations/${orgId}/data-insights`);
        const listData = await listRes.json();
        if (listData.ok) setSavedAnalyses(listData.analyses ?? []);
      }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  // ── Load saved analysis ─────────────────────────────────────────────────────

  const handleLoadSaved = (s: SavedAnalysis) => {
    setCurrentAnalysis({
      fileName: s.fileName,
      rowCount: s.rowCount,
      columnNames: s.columnNames as string[],
      summary: s.summary,
      insights: s.insights as Insight[],
      charts: s.charts as ChartSpec[],
      decisions: s.decisions as Decision[],
    });
    setSavedId(s.id);
    // Restore persisted chat history if any
    setChatMessages(
      (s.chatHistory ?? []).map(m => ({ role: m.role, content: m.content }))
    );
    setView("analysis");
  };

  // ── Delete saved analysis ───────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/organizations/${orgId}/data-insights?analysisId=${id}`, { method: "DELETE" });
      setSavedAnalyses(prev => prev.filter(a => a.id !== id));
      if (savedId === id) setSavedId(null);
    } catch { /* ignore */ }
  };

  // ── Chat ────────────────────────────────────────────────────────────────────

  const handleChat = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading || !currentAnalysis) return;

    setChatInput("");
    const newMsg: ChatMessage = { role: "user", content: msg };
    setChatMessages(prev => [...prev, newMsg]);
    setChatLoading(true);

    try {
      const res = await fetch(`/api/organizations/${orgId}/data-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          message: msg,
          analysisId: savedId ?? undefined,
          history: chatMessages.map(m => ({ role: m.role, content: m.content })),
          dataContext: {
            fileName: currentAnalysis.fileName,
            columnNames: currentAnalysis.columnNames,
            rowCount: currentAnalysis.rowCount,
            sampleRows: [],
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: data.reply,
          chart: data.chart ?? undefined,
        }]);
      } else {
        setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that request." }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Render views ────────────────────────────────────────────────────────────

  return (
    <>
      <style>{DI_CSS}</style>
      <div className="di-root">

        {/* ── HOME ──────────────────────────────────────────────────────── */}
        {view === "home" && (
          <div className="di-home">
            {/* Upload zone */}
            <div
              className={`di-drop${dragActive ? " di-drop--over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.xlsx,.xls,.json,.pdf"
                style={{ display: "none" }}
                onChange={onInputChange}
              />
              <div className="di-drop-ic"><Upload size={26} /></div>
              <div className="di-drop-title">Drop your file here</div>
              <div className="di-drop-sub">CSV, XLSX, JSON, PDF &mdash; up to 10 MB</div>
              <div className="di-drop-btn">Browse files</div>
            </div>

            {/* Errors */}
            {(parseError || analyzeError) && (
              <div className="di-err">
                <AlertTriangle size={13} />
                <span>{parseError ?? analyzeError}</span>
                <button className="di-err-x" onClick={() => { setParseError(null); setAnalyzeError(null); }}>
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Saved analyses */}
            <div className="di-saved-hd">
              <History size={14} />
              <span>Saved Analyses</span>
            </div>
            {loadingList ? (
              <div className="di-loading-row"><Loader2 size={14} className="di-spin" /><span>Loading…</span></div>
            ) : savedAnalyses.length === 0 ? (
              <div className="di-empty">No saved analyses yet. Upload a file to get started.</div>
            ) : (
              <div className="di-saved-list">
                {savedAnalyses.map(a => (
                  <div key={a.id} className="di-saved-card" onClick={() => handleLoadSaved(a)}>
                    <FileText size={16} className="di-saved-icon" />
                    <div className="di-saved-body">
                      <div className="di-saved-name">{a.fileName}</div>
                      <div className="di-saved-meta">{a.rowCount.toLocaleString()} rows · {fmtDate(a.createdAt)}</div>
                    </div>
                    <button
                      className="di-saved-del"
                      onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYZING ─────────────────────────────────────────────────── */}
        {view === "analyzing" && (
          <div className="di-analyzing">
            <div className="di-analyzing-ic"><Loader2 size={32} className="di-spin" /></div>
            <div className="di-analyzing-title">Analyzing your data…</div>
            <div className="di-analyzing-sub">AI is reading the dataset and generating insights</div>
          </div>
        )}

        {/* ── ANALYSIS ──────────────────────────────────────────────────── */}
        {view === "analysis" && currentAnalysis && (
          <div className="di-analysis">
            {/* Toolbar */}
            <div className="di-toolbar">
              <button className="di-tb-back" onClick={() => setView("home")}>
                <ChevronLeft size={15} />
                <span>Back</span>
              </button>
              <div className="di-tb-file">
                <FileText size={13} />
                <span>{currentAnalysis.fileName}</span>
                <span className="di-tb-rows">{currentAnalysis.rowCount.toLocaleString()} rows</span>
              </div>
              <div className="di-tb-actions">
                <button
                  className={`di-tb-btn${savedId ? " di-tb-btn--saved" : ""}`}
                  onClick={handleSave}
                  disabled={saving || !!savedId}
                  title={savedId ? "Saved" : "Save analysis"}
                >
                  {saving ? <Loader2 size={13} className="di-spin" /> : <Save size={13} />}
                  <span>{savedId ? "Saved" : saving ? "Saving…" : "Save"}</span>
                </button>
                <button
                  className="di-tb-btn di-tb-btn--chat"
                  onClick={() => setView("chat")}
                >
                  <MessageSquare size={13} />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>

            {/* Summary card */}
            <div className="di-summary-card">
              <div className="di-summary-text">{currentAnalysis.summary}</div>
            </div>

            {/* Insights grid */}
            {currentAnalysis.insights.length > 0 && (
              <>
                <div className="di-section-lbl">Insights</div>
                <div className="di-insights-grid">
                  {currentAnalysis.insights.map((ins, i) => (
                    <div key={i} className="di-insight-card">
                      <div className="di-insight-icon">{insightIcon(ins.icon)}</div>
                      <div className="di-insight-title">{ins.title}</div>
                      <div className="di-insight-text">{ins.text}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Charts grid */}
            {currentAnalysis.charts.length > 0 && (
              <>
                <div className="di-section-lbl">Charts</div>
                <div className="di-charts-grid">
                  {currentAnalysis.charts.map((ch, i) => (
                    <div key={i} className="di-chart-card">
                      <div className="di-chart-title">{ch.title}</div>
                      <DataChart spec={ch} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Decisions */}
            {currentAnalysis.decisions.length > 0 && (
              <>
                <div className="di-section-lbl">Recommendations</div>
                <div className="di-decisions">
                  {currentAnalysis.decisions.map((d, i) => (
                    <div key={i} className="di-decision">
                      <div className="di-decision-dot" style={{ background: priorityColor(d.priority) }} />
                      <div className="di-decision-text">{d.text}</div>
                      <div className="di-decision-pri" style={{ color: priorityColor(d.priority) }}>
                        {d.priority}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── CHAT ──────────────────────────────────────────────────────── */}
        {view === "chat" && currentAnalysis && (
          <div className="di-chat">
            <div className="di-toolbar">
              <button className="di-tb-back" onClick={() => setView("analysis")}>
                <ChevronLeft size={15} />
                <span>Back to Analysis</span>
              </button>
              <div className="di-tb-file">
                <MessageSquare size={13} />
                <span>Ask AI about <strong>{currentAnalysis.fileName}</strong></span>
              </div>
            </div>

            <div className="di-chat-msgs">
              {chatMessages.length === 0 && (
                <div className="di-chat-empty">
                  <MessageSquare size={28} />
                  <div>Ask anything about your dataset</div>
                  <div className="di-chat-empty-sub">e.g. "What are the top categories?" or "Show me a sales trend chart"</div>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={`di-msg di-msg--${m.role}`}>
                  <div className="di-msg-bubble">
                    <div className="di-msg-content">{m.content}</div>
                    {m.chart && (
                      <div className="di-msg-chart">
                        <div className="di-chart-title">{m.chart.title}</div>
                        <DataChart spec={m.chart} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="di-msg di-msg--assistant">
                  <div className="di-msg-bubble di-msg-bubble--loading">
                    <Loader2 size={13} className="di-spin" />
                    <span>Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="di-chat-input-row">
              <input
                className="di-chat-input"
                placeholder="Ask a question about your data…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                disabled={chatLoading}
              />
              <button
                className="di-chat-send"
                onClick={handleChat}
                disabled={chatLoading || !chatInput.trim()}
              >
                {chatLoading ? <Loader2 size={15} className="di-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const DI_CSS = `
.di-root{display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden}

/* ── Home ── */
.di-home{flex:1;overflow-y:auto;padding:22px 24px;display:flex;flex-direction:column;gap:20px;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}

.di-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:40px 24px;border:2px dashed var(--c-border);border-radius:16px;cursor:pointer;transition:all .18s;background:var(--c-surface);text-align:center}
.di-drop:hover,.di-drop--over{border-color:var(--c-accent);background:var(--c-accent-soft)}
.di-drop-ic{width:52px;height:52px;border-radius:14px;background:var(--c-accent-soft);display:flex;align-items:center;justify-content:center;color:var(--c-accent)}
.di-drop-title{font-size:.95rem;font-weight:600;color:var(--c-text)}
.di-drop-sub{font-size:.76rem;color:var(--c-muted)}
.di-drop-btn{margin-top:4px;padding:8px 18px;background:var(--c-accent);color:#fff;border-radius:9px;font-size:.78rem;font-weight:600;pointer-events:none}

.di-err{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;background:var(--c-danger-soft);border:1px solid color-mix(in srgb,var(--c-danger) 30%,transparent);color:var(--c-danger);font-size:.78rem}
.di-err-x{margin-left:auto;display:flex;align-items:center;justify-content:center;background:none;border:none;color:var(--c-danger);cursor:pointer;padding:2px;border-radius:4px}
.di-err-x:hover{background:color-mix(in srgb,var(--c-danger) 15%,transparent)}

.di-saved-hd{display:flex;align-items:center;gap:7px;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-muted)}
.di-loading-row{display:flex;align-items:center;gap:8px;font-size:.8rem;color:var(--c-muted)}
.di-empty{font-size:.8rem;color:var(--c-muted);text-align:center;padding:24px 0}

.di-saved-list{display:flex;flex-direction:column;gap:6px}
.di-saved-card{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;border:1px solid var(--c-border);background:var(--c-surface);cursor:pointer;transition:all .13s}
.di-saved-card:hover{border-color:var(--c-accent);background:var(--c-accent-soft)}
.di-saved-icon{color:var(--c-accent);flex-shrink:0}
.di-saved-body{flex:1;min-width:0}
.di-saved-name{font-size:.84rem;font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.di-saved-meta{font-size:.72rem;color:var(--c-muted);margin-top:1px}
.di-saved-del{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;background:none;color:var(--c-muted);cursor:pointer;border-radius:7px;flex-shrink:0;transition:all .13s}
.di-saved-del:hover{color:var(--c-danger);background:var(--c-danger-soft)}

/* ── Analyzing ── */
.di-analyzing{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:40px;text-align:center}
.di-analyzing-ic{width:64px;height:64px;border-radius:18px;background:var(--c-accent-soft);display:flex;align-items:center;justify-content:center;color:var(--c-accent)}
.di-analyzing-title{font-size:1rem;font-weight:600;color:var(--c-text)}
.di-analyzing-sub{font-size:.8rem;color:var(--c-muted)}

/* ── Shared toolbar ── */
.di-toolbar{display:flex;align-items:center;gap:10px;padding:12px 20px;border-bottom:1px solid var(--c-border);flex-shrink:0;flex-wrap:wrap;gap:8px}
.di-tb-back{display:flex;align-items:center;gap:5px;padding:6px 10px;border-radius:8px;border:1px solid var(--c-border);background:transparent;color:var(--c-muted);font-size:.78rem;font-weight:500;cursor:pointer;transition:all .13s;font-family:inherit}
.di-tb-back:hover{color:var(--c-text);border-color:var(--c-text)}
.di-tb-file{display:flex;align-items:center;gap:6px;font-size:.78rem;color:var(--c-muted);flex:1;min-width:0}
.di-tb-file span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.di-tb-rows{padding:2px 7px;background:var(--c-surface-2);border-radius:20px;font-size:.68rem;color:var(--c-muted);flex-shrink:0}
.di-tb-actions{display:flex;gap:6px;flex-shrink:0}
.di-tb-btn{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface);color:var(--c-muted);font-size:.76rem;font-weight:600;cursor:pointer;transition:all .13s;font-family:inherit}
.di-tb-btn:hover:not(:disabled){border-color:var(--c-accent);color:var(--c-accent)}
.di-tb-btn:disabled{opacity:.5;cursor:default}
.di-tb-btn--saved{color:var(--c-success)!important;border-color:var(--c-success)!important}
.di-tb-btn--chat{background:var(--c-accent);border-color:var(--c-accent);color:#fff}
.di-tb-btn--chat:hover:not(:disabled){background:var(--c-accent-dim);border-color:var(--c-accent-dim);color:#fff}

/* ── Analysis ── */
.di-analysis{flex:1;overflow-y:auto;padding:20px 22px;display:flex;flex-direction:column;gap:18px;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}
.di-summary-card{padding:16px 18px;border-radius:13px;background:var(--c-surface);border:1px solid var(--c-border)}
.di-summary-text{font-size:.85rem;color:var(--c-text);line-height:1.65}
.di-section-lbl{font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted)}

.di-insights-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:11px}
.di-insight-card{padding:14px 15px;border-radius:12px;background:var(--c-surface);border:1px solid var(--c-border);transition:border-color .13s}
.di-insight-card:hover{border-color:var(--c-accent)}
.di-insight-icon{width:28px;height:28px;border-radius:8px;background:var(--c-accent-soft);display:flex;align-items:center;justify-content:center;color:var(--c-accent);margin-bottom:9px}
.di-insight-title{font-size:.8rem;font-weight:700;color:var(--c-text);margin-bottom:4px}
.di-insight-text{font-size:.74rem;color:var(--c-muted);line-height:1.55}

.di-charts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.di-chart-card{padding:14px 15px;border-radius:12px;background:var(--c-surface);border:1px solid var(--c-border)}
.di-chart-title{font-size:.8rem;font-weight:600;color:var(--c-text);margin-bottom:12px}

.di-decisions{display:flex;flex-direction:column;gap:7px;padding-bottom:16px}
.di-decision{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;border-radius:11px;background:var(--c-surface);border:1px solid var(--c-border)}
.di-decision-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px}
.di-decision-text{flex:1;font-size:.8rem;color:var(--c-text);line-height:1.55}
.di-decision-pri{font-size:.66rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;flex-shrink:0;margin-top:2px}

/* ── Chat ── */
.di-chat{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden}
.di-chat-msgs{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}
.di-chat-empty{display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px 20px;text-align:center;color:var(--c-muted);font-size:.84rem;margin:auto}
.di-chat-empty svg{color:var(--c-accent);opacity:.6}
.di-chat-empty-sub{font-size:.74rem;color:var(--c-muted);opacity:.7}

.di-msg{display:flex}
.di-msg--user{justify-content:flex-end}
.di-msg--assistant{justify-content:flex-start}
.di-msg-bubble{max-width:72%;padding:11px 14px;border-radius:13px;font-size:.82rem;line-height:1.6}
.di-msg--user .di-msg-bubble{background:var(--c-accent);color:#fff;border-bottom-right-radius:3px}
.di-msg--assistant .di-msg-bubble{background:var(--c-surface);border:1px solid var(--c-border);color:var(--c-text);border-bottom-left-radius:3px}
.di-msg-bubble--loading{display:flex;align-items:center;gap:8px;color:var(--c-muted)}
.di-msg-chart{margin-top:10px;border-top:1px solid var(--c-border);padding-top:10px}
.di-msg-content{white-space:pre-wrap;word-break:break-word}

.di-chat-input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--c-border);flex-shrink:0}
.di-chat-input{flex:1;padding:10px 14px;border-radius:10px;border:1px solid var(--c-border);background:var(--c-surface);color:var(--c-text);font-size:.83rem;font-family:inherit;outline:none;transition:border-color .13s}
.di-chat-input:focus{border-color:var(--c-accent)}
.di-chat-input::placeholder{color:var(--c-muted)}
.di-chat-input:disabled{opacity:.5}
.di-chat-send{width:40px;height:40px;border-radius:10px;border:none;background:var(--c-accent);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .13s;flex-shrink:0}
.di-chat-send:hover:not(:disabled){background:var(--c-accent-dim)}
.di-chat-send:disabled{opacity:.5;cursor:default}

/* ── Spinner ── */
@keyframes di-spin{to{transform:rotate(360deg)}}
.di-spin{animation:di-spin .8s linear infinite}
`;
