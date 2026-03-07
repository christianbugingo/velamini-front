"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, DollarSign, Zap, ArrowUpRight,
  ArrowDownRight, BarChart3, Brain, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── Mock data — replace with real API ────────────────────────────────────────
const MRR_TREND = [
  { month:"Sep", mrr:0      }, { month:"Oct", mrr:45000  },
  { month:"Nov", mrr:95000  }, { month:"Dec", mrr:160000 },
  { month:"Jan", mrr:245000 }, { month:"Feb", mrr:310000 },
  { month:"Mar", mrr:395000 },
];

const COST_TREND = [
  { month:"Sep", cost:0      }, { month:"Oct", cost:18000  },
  { month:"Nov", cost:38000  }, { month:"Dec", cost:62000  },
  { month:"Jan", cost:91000  }, { month:"Feb", cost:118000 },
  { month:"Mar", cost:148000 },
];

const PLAN_DIST = [
  { name:"Free",    value:48, color:"#34D399" },
  { name:"Starter", value:21, color:"#38AECC" },
  { name:"Pro",     value:15, color:"#818CF8" },
  { name:"Scale",   value:7,  color:"#FCD34D" },
];

const ORG_LIST = [
  { name:"Acme Ltd",       plan:"Pro",     msgs:4820, limit:8000, mrr:15000, status:"active"   },
  { name:"KigoTech",       plan:"Scale",   msgs:18400,limit:25000,mrr:35000, status:"active"   },
  { name:"EduConnect RW",  plan:"Starter", msgs:1200, limit:2000, mrr:5000,  status:"active"   },
  { name:"HealthHub",      plan:"Pro",     msgs:7900, limit:8000, mrr:15000, status:"warning"  },
  { name:"ShopEasy",       plan:"Free",    msgs:480,  limit:500,  mrr:0,     status:"warning"  },
  { name:"Rwanda Tours",   plan:"Starter", msgs:340,  limit:2000, mrr:5000,  status:"active"   },
  { name:"FinFlow",        plan:"Scale",   msgs:3200, limit:25000,mrr:35000, status:"active"   },
  { name:"MediaGroup",     plan:"Pro",     msgs:2100, limit:8000, mrr:15000, status:"inactive" },
];

const TOKEN_COST_PER_MSG = 0.005; // USD ~≈ 6.5 RWF at current rate
const RWF_PER_USD        = 1300;
const TOKEN_COST_RWF     = TOKEN_COST_PER_MSG * RWF_PER_USD;

function formatRWF(n: number) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M RWF`;
  if (n >= 1_000)     return `${(n/1_000).toFixed(0)}K RWF`;
  return `${n.toLocaleString()} RWF`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:9, padding:"8px 12px", fontSize:".74rem", color:"var(--c-text)", boxShadow:"var(--shadow-md)" }}>
      <div style={{ fontWeight:700, marginBottom:3 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color:p.color }}>{p.name}: {formatRWF(p.value)}</div>
      ))}
    </div>
  );
};

export default function AdminRevenue() {
  const [period, setPeriod] = useState<"7d"|"30d"|"all">("30d");

  const totalMRR     = MRR_TREND.at(-1)!.mrr;
  const prevMRR      = MRR_TREND.at(-2)!.mrr;
  const mrrGrowth    = ((totalMRR - prevMRR) / prevMRR * 100).toFixed(1);
  const totalCost    = COST_TREND.at(-1)!.cost;
  const grossMargin  = (((totalMRR - totalCost) / totalMRR) * 100).toFixed(0);
  const totalOrgs    = PLAN_DIST.reduce((s, p) => s + p.value, 0);
  const paidOrgs     = PLAN_DIST.filter(p => p.name !== "Free").reduce((s, p) => s + p.value, 0);
  const totalMsgs    = ORG_LIST.reduce((s, o) => s + o.msgs, 0);
  const estTokenCost = Math.round(totalMsgs * TOKEN_COST_RWF);

  const kpis = [
    { label:"Monthly Revenue",  value: formatRWF(totalMRR),      delta:`+${mrrGrowth}%`,   up:true,  color:"#34D399", Icon:TrendingUp   },
    { label:"Gross Margin",     value: `${grossMargin}%`,         delta:"vs last month",    up:true,  color:"#38AECC", Icon:BarChart3    },
    { label:"Paying Orgs",      value: `${paidOrgs}`,            delta:`of ${totalOrgs} total`, up:true,  color:"#818CF8", Icon:Users        },
    { label:"Est. API Cost",    value: formatRWF(estTokenCost),  delta:`${totalMsgs.toLocaleString()} msgs`, up:false, color:"#FCD34D", Icon:Brain  },
  ];

  return (
    <>
      <style>{`
        .ar{display:flex;flex-direction:column;gap:18px}

        /* kpi grid */
        .ar-kpis{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)}
        @media(min-width:700px){.ar-kpis{grid-template-columns:repeat(4,1fr)}}
        .ar-kpi{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;padding:16px;box-shadow:var(--shadow-sm);position:relative;overflow:hidden;transition:border-color .15s}
        .ar-kpi::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--ak-color)}
        .ar-kpi:hover{border-color:var(--ak-color)}
        .ar-kpi-ic{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--ak-color) 12%,transparent);color:var(--ak-color);margin-bottom:9px}
        .ar-kpi-ic svg{width:13px;height:13px}
        .ar-kpi-val{font-family:'DM Serif Display',serif;font-size:1.55rem;color:var(--c-text);letter-spacing:-.02em;line-height:1}
        .ar-kpi-lbl{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--c-muted);margin-top:2px}
        .ar-kpi-delta{display:inline-flex;align-items:center;gap:3px;font-size:.68rem;font-weight:700;margin-top:5px;padding:2px 7px;border-radius:6px}
        .ar-kpi-delta--up{background:color-mix(in srgb,var(--c-success) 12%,transparent);color:var(--c-success)}
        .ar-kpi-delta--down{background:color-mix(in srgb,var(--c-warn) 12%,transparent);color:var(--c-warn)}
        .ar-kpi-delta svg{width:9px;height:9px}

        /* charts grid */
        .ar-charts{display:grid;gap:16px}
        @media(min-width:680px){.ar-charts{grid-template-columns:3fr 2fr}}

        /* plan donut */
        .ar-donut-list{display:flex;flex-direction:column;gap:7px;margin-top:8px}
        .ar-donut-row{display:flex;align-items:center;gap:8px}
        .ar-donut-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
        .ar-donut-name{font-size:.76rem;color:var(--c-text);flex:1}
        .ar-donut-count{font-size:.76rem;font-weight:700;color:var(--c-text)}
        .ar-donut-pct{font-size:.66rem;color:var(--c-muted);margin-left:2px}

        /* period toggle */
        .ar-period{display:flex;gap:4px;background:var(--c-surface-2);border:1px solid var(--c-border);border-radius:10px;padding:3px;width:fit-content;margin-bottom:14px}
        .ar-period-btn{padding:5px 12px;border-radius:7px;border:none;background:none;font-size:.72rem;font-weight:700;color:var(--c-muted);cursor:pointer;font-family:inherit;transition:all .13s}
        .ar-period-btn--on{background:var(--c-surface);color:var(--c-accent);box-shadow:var(--shadow-sm)}

        /* org table */
        .ar-table-wrap{overflow-x:auto;border-radius:12px;border:1px solid var(--c-border)}
        .ar-table{width:100%;border-collapse:collapse;min-width:580px}
        .ar-table th{padding:10px 14px;text-align:left;font-size:.63rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--c-muted);background:var(--c-surface-2);border-bottom:1px solid var(--c-border)}
        .ar-table td{padding:10px 14px;font-size:.76rem;color:var(--c-muted);border-bottom:1px solid color-mix(in srgb,var(--c-border) 55%,transparent)}
        .ar-table tr:last-child td{border-bottom:none}
        .ar-table tr:hover td{background:color-mix(in srgb,var(--c-surface-2) 50%,transparent)}
        .ar-table-name{font-weight:700;color:var(--c-text)}

        /* plan chip */
        .ar-chip{display:inline-flex;padding:2px 8px;border-radius:6px;font-size:.62rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}
        .ar-chip--free   {background:color-mix(in srgb,#34D399 12%,transparent);color:#34D399}
        .ar-chip--starter{background:color-mix(in srgb,#38AECC 12%,transparent);color:#38AECC}
        .ar-chip--pro    {background:color-mix(in srgb,#818CF8 12%,transparent);color:#818CF8}
        .ar-chip--scale  {background:color-mix(in srgb,#FCD34D 12%,transparent);color:#FCD34D}

        /* status dot */
        .ar-status{display:inline-flex;align-items:center;gap:5px;font-size:.7rem;font-weight:600}
        .ar-status-dot{width:6px;height:6px;border-radius:50%}
        .ar-status--active   .ar-status-dot{background:#34D399}
        .ar-status--warning  .ar-status-dot{background:#FCD34D;animation:odpulse 2s infinite}
        .ar-status--inactive .ar-status-dot{background:#3D6580}

        /* mini usage bar */
        .ar-mini-bar{height:4px;background:var(--c-surface-2);border-radius:2px;overflow:hidden;width:80px}
        .ar-mini-fill{height:100%;border-radius:2px}

        /* cost note */
        .ar-cost-note{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border-radius:11px;background:color-mix(in srgb,#FCD34D 6%,transparent);border:1px solid color-mix(in srgb,#FCD34D 20%,transparent);font-size:.76rem;color:var(--c-muted);line-height:1.6}
        .ar-cost-note svg{width:14px;height:14px;color:#FCD34D;flex-shrink:0;margin-top:1px}
        .ar-cost-note strong{color:var(--c-text)}
      `}</style>

      <div className="ar">

        {/* KPIs */}
        <div className="ar-kpis">
          {kpis.map(({ label, value, delta, up, color, Icon }, i) => (
            <motion.div key={label} className="ar-kpi"
              style={{ "--ak-color": color } as any}
              initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * .07 }}>
              <div className="ar-kpi-ic"><Icon/></div>
              <div className="ar-kpi-val">{value}</div>
              <div className="ar-kpi-lbl">{label}</div>
              <div className={`ar-kpi-delta ar-kpi-delta--${up ? "up" : "down"}`}>
                {up ? <ArrowUpRight size={9}/> : <ArrowDownRight size={9}/>}
                {delta}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cost transparency note */}
        <div className="ar-cost-note">
          <AlertCircle size={14}/>
          <span>
            <strong>Token cost estimate:</strong> Based on ~{TOKEN_COST_RWF.toFixed(1)} RWF per message
            ({TOKEN_COST_PER_MSG} USD × {RWF_PER_USD} RWF/USD). Actual costs vary by message length.
            Monitor your Anthropic dashboard for real billing figures.
          </span>
        </div>

        {/* MRR vs Cost chart + Plan distribution */}
        <motion.div className="ar-charts"
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.25 }}>

          {/* Revenue vs Cost */}
          <div className="od-card">
            <div className="od-card-title">Revenue vs API Cost</div>
            <div className="od-card-sub">Monthly RWF revenue earned vs estimated Anthropic token cost.</div>
            <div className="ar-period">
              {(["7d","30d","all"] as const).map(p => (
                <button key={p} className={`ar-period-btn ${period === p ? "ar-period-btn--on" : ""}`}
                  onClick={() => setPeriod(p)}>{p}</button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={MRR_TREND}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={.22}/>
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FCD34D" stopOpacity={.18}/>
                    <stop offset="100%" stopColor="#FCD34D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--c-muted)" }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fontSize:10, fill:"var(--c-muted)" }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="mrr"  name="Revenue" stroke="#34D399" strokeWidth={2} fill="url(#mrrGrad)"  dot={false}/>
                {/* overlay cost */}
              </AreaChart>
            </ResponsiveContainer>
            {/* cost bars overlay */}
            <ResponsiveContainer width="100%" height={100} style={{ marginTop:-8 }}>
              <BarChart data={COST_TREND} barSize={14}>
                <XAxis dataKey="month" tick={false} axisLine={false} tickLine={false}/>
                <YAxis tick={false} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="cost" name="API Cost" fill="#FCD34D" opacity={.65} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", gap:16, marginTop:4, fontSize:".7rem", color:"var(--c-muted)" }}>
              <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:10, height:4, borderRadius:2, background:"#34D399", display:"inline-block" }}/> Revenue</span>
              <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ width:10, height:4, borderRadius:2, background:"#FCD34D", display:"inline-block" }}/> API Cost (est.)</span>
            </div>
          </div>

          {/* Plan distribution */}
          <div className="od-card">
            <div className="od-card-title">Plan distribution</div>
            <div className="od-card-sub">{totalOrgs} total organisations.</div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={PLAN_DIST} cx="50%" cy="50%" innerRadius={44} outerRadius={64}
                  dataKey="value" strokeWidth={0}>
                  {PLAN_DIST.map((p, i) => <Cell key={i} fill={p.color}/>)}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [`${v} orgs`, n]}
                  contentStyle={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:9, fontSize:".74rem" }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="ar-donut-list">
              {PLAN_DIST.map(p => (
                <div key={p.name} className="ar-donut-row">
                  <div className="ar-donut-dot" style={{ background:p.color }}/>
                  <span className="ar-donut-name">{p.name}</span>
                  <span className="ar-donut-count">{p.value}</span>
                  <span className="ar-donut-pct">({((p.value/totalOrgs)*100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Org billing table */}
        <motion.div className="od-card"
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.36 }}>
          <div className="od-card-title">Organisation billing</div>
          <div className="od-card-sub">All active organisations, their plan, usage, and monthly revenue contribution.</div>
          <div className="ar-table-wrap">
            <table className="ar-table">
              <thead>
                <tr>
                  <th>Organisation</th>
                  <th>Plan</th>
                  <th>Messages</th>
                  <th>Usage</th>
                  <th>MRR</th>
                  <th>Est. Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ORG_LIST.map(org => {
                  const pct     = Math.min((org.msgs / org.limit) * 100, 100);
                  const barCol  = pct >= 90 ? "var(--c-danger)" : pct >= 70 ? "var(--c-warn)" : "var(--c-success)";
                  const estCost = Math.round(org.msgs * TOKEN_COST_RWF);
                  const margin  = org.mrr > 0 ? (((org.mrr - estCost) / org.mrr) * 100).toFixed(0) : "—";
                  return (
                    <tr key={org.name}>
                      <td className="ar-table-name">{org.name}</td>
                      <td><span className={`ar-chip ar-chip--${org.plan.toLowerCase()}`}>{org.plan}</span></td>
                      <td>{org.msgs.toLocaleString()} / {org.limit.toLocaleString()}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <div className="ar-mini-bar">
                            <div className="ar-mini-fill" style={{ width:`${pct}%`, background:barCol }}/>
                          </div>
                          <span style={{ fontSize:".66rem" }}>{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight:700, color:"var(--c-text)" }}>
                        {org.mrr === 0 ? "—" : formatRWF(org.mrr)}
                      </td>
                      <td style={{ color:"var(--c-warn)" }}>
                        ~{formatRWF(estCost)}
                        {org.mrr > 0 && <span style={{ color:"var(--c-success)", fontSize:".65rem", marginLeft:4 }}>({margin}% margin)</span>}
                      </td>
                      <td>
                        <div className={`ar-status ar-status--${org.status}`}>
                          <div className="ar-status-dot"/>
                          {org.status}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </>
  );
}