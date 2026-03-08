"use client";

import { useEffect, useState } from "react";
import { Users, Brain, MessageSquare, TrendingUp, ArrowRight, Activity, Building2, Database, BotMessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import type { AdminView } from "./wrapper";

interface Props { onNavigate: (v: AdminView) => void }

interface StatsData {
  totalUsers:        { value: number; delta: string };
  trainingSessions:  { value: number; delta: string };
  totalMessages:     { value: number; delta: string };
  activeThisWeek:    { value: number; delta: string };
  totalOrgs:         { value: number; delta: string };
  totalOrgChats:     { value: number; delta: string };
  totalDataAnalyses: { value: number; delta: string };
}
interface RecentUser {
  id: string; name: string | null; email: string | null;
  createdAt: string; status: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)    return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

export default function AdminOverview({ onNavigate }: Props) {
  const [statsData, setStatsData]     = useState<StatsData | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setStatsData(d.stats);
          setRecentUsers(d.recentUsers ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = statsData ? [
    { label: "Total Users",       value: fmtNum(statsData.totalUsers.value),       delta: statsData.totalUsers.delta,       Icon: Users,         accent: "#29A9D4", soft: "rgba(41,169,212,.12)"  },
    { label: "Training Sessions", value: fmtNum(statsData.trainingSessions.value),  delta: statsData.trainingSessions.delta, Icon: Brain,         accent: "#6366F1", soft: "rgba(99,102,241,.12)"  },
    { label: "Messages Sent",     value: fmtNum(statsData.totalMessages.value),     delta: statsData.totalMessages.delta,    Icon: MessageSquare, accent: "#10B981", soft: "rgba(16,185,129,.12)"  },
    { label: "Active This Week",  value: fmtNum(statsData.activeThisWeek.value),    delta: statsData.activeThisWeek.delta,   Icon: Activity,      accent: "#F59E0B", soft: "rgba(245,158,11,.12)"  },
  ] : [
    { label: "Total Users",       value: "—", delta: "", Icon: Users,         accent: "#29A9D4", soft: "rgba(41,169,212,.12)"  },
    { label: "Training Sessions", value: "—", delta: "", Icon: Brain,         accent: "#6366F1", soft: "rgba(99,102,241,.12)"  },
    { label: "Messages Sent",     value: "—", delta: "", Icon: MessageSquare, accent: "#10B981", soft: "rgba(16,185,129,.12)"  },
    { label: "Active This Week",  value: "—", delta: "", Icon: Activity,      accent: "#F59E0B", soft: "rgba(245,158,11,.12)"  },
  ];

  const platformStats = statsData ? [
    { label: "Organizations",  value: fmtNum(statsData.totalOrgs.value),         delta: statsData.totalOrgs.delta,         Icon: Building2,       accent: "#EC4899", soft: "rgba(236,72,153,.12)"  },
    { label: "Org Bot Chats",  value: fmtNum(statsData.totalOrgChats.value),     delta: statsData.totalOrgChats.delta,     Icon: BotMessageSquare,accent: "#14B8A6", soft: "rgba(20,184,166,.12)"  },
    { label: "Data Analyses",  value: fmtNum(statsData.totalDataAnalyses.value), delta: statsData.totalDataAnalyses.delta, Icon: Database,        accent: "#F97316", soft: "rgba(249,115,22,.12)"  },
  ] : [
    { label: "Organizations",  value: "—", delta: "", Icon: Building2,       accent: "#EC4899", soft: "rgba(236,72,153,.12)"  },
    { label: "Org Bot Chats",  value: "—", delta: "", Icon: BotMessageSquare,accent: "#14B8A6", soft: "rgba(20,184,166,.12)"  },
    { label: "Data Analyses",  value: "—", delta: "", Icon: Database,        accent: "#F97316", soft: "rgba(249,115,22,.12)"  },
  ];

  return (
    <>
      <style>{`
        .ao{padding:18px 14px 48px;background:var(--c-bg);min-height:100%;transition:background .3s}
        @media(min-width:600px){.ao{padding:26px 24px 56px}}
        @media(min-width:1024px){.ao{padding:32px 36px 64px}}
        .ao-inner{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:24px}

        .ao-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}
        .ao-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.55rem,4vw,2.1rem);font-weight:400;letter-spacing:-.022em;color:var(--c-text);margin-bottom:4px}
        .ao-sub{font-size:.8rem;color:var(--c-muted)}
        .ao-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:20px;background:var(--c-danger-soft);border:1px solid color-mix(in srgb,var(--c-danger) 25%,transparent);font-size:.65rem;font-weight:700;color:var(--c-danger);letter-spacing:.05em;text-transform:uppercase;flex-shrink:0;margin-top:4px}
        .ao-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--c-danger);animation:aoblink 2s infinite}
        @keyframes aoblink{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}

        .ao-grid{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)}
        @media(min-width:900px){.ao-grid{grid-template-columns:repeat(4,1fr)}}

        .ao-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;padding:16px 16px 14px;display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow-sm);position:relative;overflow:hidden;transition:background .3s,border-color .2s,box-shadow .2s}
        .ao-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2.5px;background:var(--ci-accent);opacity:.7;border-radius:14px 14px 0 0}
        .ao-card:hover{box-shadow:var(--shadow-md);border-color:var(--ci-accent)}
        .ao-cic{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:var(--ci-soft);color:var(--ci-accent)}
        .ao-cic svg{width:15px;height:15px}
        .ao-cnum{font-family:'DM Serif Display',serif;font-size:clamp(1.6rem,3vw,2rem);font-weight:400;color:var(--c-text);letter-spacing:-.02em;line-height:1}
        .ao-clbl{font-size:.68rem;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:.05em;margin-top:2px}
        .ao-cdelta{font-size:.7rem;font-weight:700;color:var(--c-success);margin-top:4px}

        .ao-row{display:grid;gap:14px}
        @media(min-width:768px){.ao-row{grid-template-columns:1fr 340px}}

        .ao-panel{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;padding:20px 20px 16px;box-shadow:var(--shadow-sm);transition:background .3s,border-color .3s}
        .ao-ptitle{font-family:'DM Serif Display',serif;font-size:.96rem;color:var(--c-text);margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
        .ao-plink{font-size:.72rem;font-weight:600;color:var(--c-accent);cursor:pointer;display:flex;align-items:center;gap:3px;background:none;border:none;font-family:inherit;transition:opacity .14s}
        .ao-plink:hover{opacity:.75}
        .ao-plink svg{width:11px;height:11px}

        .ao-user-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--c-border)}
        .ao-user-row:last-child{border-bottom:none;padding-bottom:0}
        .ao-uav{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--c-accent),#7DD3FC);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.8rem;font-weight:700;flex-shrink:0}
        .ao-uinfo{flex:1;min-width:0}
        .ao-uname{font-size:.8rem;font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ao-uemail{font-size:.68rem;color:var(--c-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ao-utime{font-size:.66rem;color:var(--c-muted);white-space:nowrap;flex-shrink:0}
        .ao-ustatus{font-size:.62rem;font-weight:700;padding:2px 8px;border-radius:20px;flex-shrink:0;text-transform:uppercase;letter-spacing:.04em}
        .ao-ustatus--active{background:var(--c-success-soft);color:var(--c-success)}
        .ao-ustatus--pending{background:var(--c-warn-soft);color:var(--c-warn)}
        .ao-ustatus--flagged{background:var(--c-danger-soft);color:var(--c-danger)}

        .ao-qactions{display:flex;flex-direction:column;gap:8px}
        .ao-qa{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:11px;border:1px solid var(--c-border);background:var(--c-surface-2);cursor:pointer;transition:all .15s;font-family:inherit;width:100%;text-align:left;min-height:50px}
        .ao-qa:hover{background:var(--c-accent-soft);border-color:var(--c-accent);transform:translateX(3px)}
        .ao-qa-ic{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--c-accent-soft);color:var(--c-accent);flex-shrink:0}
        .ao-qa-ic svg{width:13px;height:13px}
        .ao-qa:hover .ao-qa-ic{background:var(--c-accent);color:#fff}
        .ao-qa-lbl{font-size:.82rem;font-weight:600;color:var(--c-text);flex:1}
        .ao-qa-sub{font-size:.68rem;color:var(--c-muted);margin-top:1px}
        .ao-qa-arr{color:var(--c-muted);opacity:0;transition:opacity .14s,transform .14s}
        .ao-qa:hover .ao-qa-arr{opacity:1;transform:translateX(2px)}
      `}</style>

      <div className="ao">
        <div className="ao-inner">
          <motion.div className="ao-hd" initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }} transition={{ duration:.4 }}>
            <div>
              <h1 className="ao-title">Admin Overview</h1>
              <p className="ao-sub">Platform-wide stats and recent activity.</p>
            </div>
            <div className="ao-badge"><span className="ao-badge-dot" /> Admin</div>
          </motion.div>

          {/* Stat cards */}
          <div className="ao-grid">
            {stats.map(({ label, value, delta, Icon, accent, soft }, i) => (
              <motion.div key={label} className="ao-card"
                style={{ '--ci-accent': accent, '--ci-soft': soft } as any}
                initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
                transition={{ duration:.3, delay: i * .06 }}>
                <div className="ao-cic"><Icon /></div>
                <div>
                  <div className="ao-cnum">{loading ? <span style={{opacity:.4}}>…</span> : value}</div>
                  <div className="ao-clbl">{label}</div>
                  {delta && <div className="ao-cdelta">{delta} this week</div>}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Platform feature stats */}
          <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))" }}>
            {platformStats.map(({ label, value, delta, Icon, accent, soft }, i) => (
              <motion.div key={label} className="ao-card"
                style={{ '--ci-accent': accent, '--ci-soft': soft } as any}
                initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }}
                transition={{ duration:.28, delay: .18 + i * .06 }}>
                <div className="ao-cic"><Icon /></div>
                <div>
                  <div className="ao-cnum" style={{ fontSize:"1.6rem" }}>{loading ? <span style={{opacity:.4}}>…</span> : value}</div>
                  <div className="ao-clbl">{label}</div>
                  {delta && <div className="ao-cdelta">{delta} this week</div>}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div className="ao-row" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:.28 }}>
            {/* Recent signups */}
            <div className="ao-panel">
              <div className="ao-ptitle">
                Recent Sign-ups
                <button className="ao-plink" onClick={() => onNavigate("users")}>
                  View all <ArrowRight />
                </button>
              </div>
              {loading && <div style={{color:"var(--c-muted)",fontSize:".8rem",padding:"12px 0"}}>Loading…</div>}
              {!loading && recentUsers.length === 0 && (
                <div style={{color:"var(--c-muted)",fontSize:".8rem",padding:"12px 0"}}>No users yet.</div>
              )}
              {recentUsers.map(u => (
                <div key={u.id} className="ao-user-row">
                  <div className="ao-uav">{(u.name ?? u.email ?? "?")[0].toUpperCase()}</div>
                  <div className="ao-uinfo">
                    <div className="ao-uname">{u.name ?? "(no name)"}</div>
                    <div className="ao-uemail">{u.email}</div>
                  </div>
                  <div className="ao-utime">{timeAgo(u.createdAt)}</div>
                  <span className={`ao-ustatus ao-ustatus--${u.status}`}>{u.status}</span>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="ao-panel">
              <div className="ao-ptitle">Quick Actions</div>
              <div className="ao-qactions">
                {[
                  { label: "Manage Users",      sub: "View, ban, or promote",      Icon: Users,        view: "users"      },
                  { label: "View Analytics",    sub: "Charts and growth data",      Icon: TrendingUp,   view: "analytics"  },
                  { label: "Review Reports",    sub: "3 pending flags",             Icon: Activity,     view: "moderation" },
                  { label: "System Settings",   sub: "Config and permissions",      Icon: MessageSquare,view: "settings"   },
                ].map(({ label, sub, Icon, view }) => (
                  <button key={view} className="ao-qa" onClick={() => onNavigate(view as AdminView)}>
                    <div className="ao-qa-ic"><Icon /></div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="ao-qa-lbl">{label}</div>
                      <div className="ao-qa-sub">{sub}</div>
                    </div>
                    <ArrowRight size={13} className="ao-qa-arr" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}