"use client";

import { useState } from "react";
import { ShieldAlert, CheckCircle, XCircle, Eye, MessageSquare, User, AlertTriangle } from "lucide-react";

type Severity = "high" | "medium" | "low";
type ReportStatus = "pending" | "resolved" | "dismissed";

interface Report {
  id: string; type: "message" | "profile" | "content";
  reporter: string; target: string; reason: string;
  excerpt: string; time: string; severity: Severity; status: ReportStatus;
}

const MOCK_REPORTS: Report[] = [
  { id:"1", type:"message",  reporter:"Alice K.",  target:"Unknown User",   reason:"Spam / Repetitive content",     excerpt:"Buy crypto now!!! 100x gains guaranteed click here...",   time:"1h ago",  severity:"high",   status:"pending"   },
  { id:"2", type:"profile",  reporter:"Ben O.",    target:"DigitalTwin_X",  reason:"Impersonation",                 excerpt:"Profile claims to be Elon Musk's verified digital twin.", time:"3h ago",  severity:"high",   status:"pending"   },
  { id:"3", type:"content",  reporter:"Clara M.",  target:"Frank A.",       reason:"Inappropriate training data",   excerpt:"User submitted offensive Q&A content in knowledge base.", time:"6h ago",  severity:"medium", status:"pending"   },
  { id:"4", type:"message",  reporter:"David O.",  target:"Grace W.",       reason:"Harassment",                    excerpt:"Stop messaging me or I'll find you offline...",           time:"1d ago",  severity:"high",   status:"resolved"  },
  { id:"5", type:"profile",  reporter:"Eva N.",    target:"Hasan Y.",       reason:"False information",             excerpt:"Profile bio contains fabricated professional credentials.", time:"2d ago",  severity:"low",    status:"dismissed" },
];

const typeIcon: Record<Report["type"], any> = {
  message: MessageSquare, profile: User, content: AlertTriangle,
};

const severityClass: Record<Severity, string> = {
  high: "am-sev--high", medium: "am-sev--med", low: "am-sev--low",
};

const statusClass: Record<ReportStatus, string> = {
  pending: "am-st--pending", resolved: "am-st--resolved", dismissed: "am-st--dismissed",
};

export default function AdminModeration() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [filter, setFilter]   = useState<ReportStatus | "all">("pending");
  const [expanded, setExp]    = useState<string | null>(null);

  const updateStatus = (id: string, status: ReportStatus) =>
    setReports(p => p.map(r => r.id === id ? { ...r, status } : r));

  const filtered = filter === "all" ? reports : reports.filter(r => r.status === filter);
  const pendingCount = reports.filter(r => r.status === "pending").length;

  return (
    <>
      <style>{`
        .am{padding:18px 14px 48px;background:var(--c-bg);min-height:100%;transition:background .3s}
        @media(min-width:600px){.am{padding:26px 24px 56px}}
        @media(min-width:1024px){.am{padding:32px 36px 64px}}
        .am-inner{max-width:900px;margin:0 auto;display:flex;flex-direction:column;gap:20px}

        .am-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}
        .am-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.5rem,4vw,2rem);font-weight:400;letter-spacing:-.022em;color:var(--c-text);margin-bottom:4px}
        .am-sub{font-size:.8rem;color:var(--c-muted)}
        .am-count{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;background:var(--c-danger-soft);border:1px solid color-mix(in srgb,var(--c-danger) 25%,transparent);font-size:.68rem;font-weight:700;color:var(--c-danger);flex-shrink:0}

        .am-filters{display:flex;gap:5px;flex-wrap:wrap}
        .am-filter{padding:6px 13px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);font-size:.74rem;font-weight:600;cursor:pointer;transition:all .13s;font-family:inherit}
        .am-filter:hover{border-color:var(--c-accent);color:var(--c-accent)}
        .am-filter--on{background:var(--c-accent-soft);border-color:var(--c-accent);color:var(--c-accent)}

        .am-list{display:flex;flex-direction:column;gap:10px}

        .am-report{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-sm);transition:background .3s,border-color .3s}
        .am-report--high{border-left:3px solid var(--c-danger)}
        .am-report--medium{border-left:3px solid var(--c-warn)}
        .am-report--low{border-left:3px solid var(--c-muted)}

        .am-report-head{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;transition:background .13s}
        .am-report-head:hover{background:var(--c-surface-2)}

        .am-type-ic{width:32px;height:32px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--c-surface-2);color:var(--c-muted)}
        .am-type-ic svg{width:14px;height:14px}
        .am-report-head:hover .am-type-ic{background:var(--c-accent-soft);color:var(--c-accent)}

        .am-rinfo{flex:1;min-width:0}
        .am-rtarget{font-size:.82rem;font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .am-rreason{font-size:.7rem;color:var(--c-muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

        .am-rmeta{display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end}
        .am-sev{font-size:.62rem;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.04em}
        .am-sev--high{background:var(--c-danger-soft);color:var(--c-danger)}
        .am-sev--med{background:var(--c-warn-soft);color:var(--c-warn)}
        .am-sev--low{background:var(--c-surface-2);color:var(--c-muted)}
        .am-st{font-size:.62rem;font-weight:700;padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.04em}
        .am-st--pending{background:var(--c-warn-soft);color:var(--c-warn)}
        .am-st--resolved{background:var(--c-success-soft);color:var(--c-success)}
        .am-st--dismissed{background:var(--c-surface-2);color:var(--c-muted)}
        .am-rtime{font-size:.68rem;color:var(--c-muted);white-space:nowrap}

        .am-report-body{padding:0 16px 14px;border-top:1px solid var(--c-border);background:var(--c-surface-2)}
        .am-excerpt{font-size:.8rem;color:var(--c-muted);font-style:italic;line-height:1.6;padding:10px 0 12px;border-bottom:1px solid var(--c-border)}
        .am-reporter{font-size:.7rem;color:var(--c-muted);margin:8px 0 12px}
        .am-reporter strong{color:var(--c-text)}
        .am-actions{display:flex;gap:7px;flex-wrap:wrap}
        .am-action-btn{display:flex;align-items:center;gap:5px;padding:7px 13px;border-radius:9px;border:1px solid var(--c-border);background:var(--c-surface);font-size:.76rem;font-weight:600;cursor:pointer;transition:all .14s;font-family:inherit;color:var(--c-muted)}
        .am-action-btn:hover{border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-soft)}
        .am-action-btn--resolve:hover{border-color:var(--c-success);color:var(--c-success);background:var(--c-success-soft)}
        .am-action-btn--dismiss:hover{border-color:var(--c-muted);color:var(--c-text);background:var(--c-surface-2)}
        .am-action-btn--ban:hover{border-color:var(--c-danger);color:var(--c-danger);background:var(--c-danger-soft)}
        .am-action-btn svg{width:12px;height:12px}

        .am-empty{text-align:center;padding:48px 20px;color:var(--c-muted);font-size:.84rem}
        .am-empty-ic{display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:14px;background:var(--c-surface-2);margin:0 auto 12px;color:var(--c-muted)}
      `}</style>

      <div className="am">
        <div className="am-inner">
          <div className="am-hd">
            <div>
              <h1 className="am-title">Content Moderation</h1>
              <p className="am-sub">Review and act on reported users and content.</p>
            </div>
            {pendingCount > 0 && (
              <div className="am-count"><ShieldAlert size={12} /> {pendingCount} pending</div>
            )}
          </div>

          <div className="am-filters">
            {(["pending","resolved","dismissed","all"] as const).map(f => (
              <button key={f} className={`am-filter ${filter === f ? "am-filter--on" : ""}`}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="am-list">
            {filtered.length === 0 ? (
              <div className="am-empty">
                <div className="am-empty-ic"><ShieldAlert size={20} /></div>
                No {filter === "all" ? "" : filter} reports found.
              </div>
            ) : filtered.map(r => {
              const TypeIcon = typeIcon[r.type];
              return (
                <div key={r.id} className={`am-report am-report--${r.severity}`}>
                  <div className="am-report-head" onClick={() => setExp(expanded === r.id ? null : r.id)}>
                    <div className="am-type-ic"><TypeIcon /></div>
                    <div className="am-rinfo">
                      <div className="am-rtarget">{r.target}</div>
                      <div className="am-rreason">{r.reason}</div>
                    </div>
                    <div className="am-rmeta">
                      <span className={`am-sev ${severityClass[r.severity]}`}>{r.severity}</span>
                      <span className={`am-st ${statusClass[r.status]}`}>{r.status}</span>
                      <span className="am-rtime">{r.time}</span>
                    </div>
                  </div>

                  {expanded === r.id && (
                    <div className="am-report-body">
                      <div className="am-excerpt">"{r.excerpt}"</div>
                      <div className="am-reporter">Reported by <strong>{r.reporter}</strong></div>
                      {r.status === "pending" && (
                        <div className="am-actions">
                          <button className="am-action-btn" onClick={() => setExp(null)}><Eye size={12} /> View Profile</button>
                          <button className="am-action-btn am-action-btn--resolve" onClick={() => { updateStatus(r.id, "resolved"); setExp(null); }}>
                            <CheckCircle size={12} /> Resolve
                          </button>
                          <button className="am-action-btn am-action-btn--dismiss" onClick={() => { updateStatus(r.id, "dismissed"); setExp(null); }}>
                            <XCircle size={12} /> Dismiss
                          </button>
                          <button className="am-action-btn am-action-btn--ban">
                            <XCircle size={12} /> Ban User
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}