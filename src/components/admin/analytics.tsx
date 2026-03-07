"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, MessageSquare, Brain } from "lucide-react";

interface AnalyticsData {
  monthlySignups:  { month: string; users: number }[];
  dailyMessages:   { day: string; messages: number }[];
  monthlyMessages: { month: string; messages: number }[];
  metrics: {
    userGrowth:   string;
    avgMsgPerDay: string;
    retentionRate: string;
    totalUsers:   number;
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '8px 12px', fontSize: '.78rem', color: 'var(--c-text)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontWeight: 700, marginBottom: 3 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value.toLocaleString()}</strong></div>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(d => { if (d.ok) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const metrics = data ? [
    { label: "User Growth",      value: data.metrics.userGrowth,                  sub: "vs last month",  Icon: Users,         accent: "#29A9D4" },
    { label: "Total Users",      value: String(data.metrics.totalUsers),           sub: "all time",       Icon: Brain,         accent: "#6366F1" },
    { label: "Messages / Day",   value: Number(data.metrics.avgMsgPerDay).toLocaleString(), sub: "7-day avg", Icon: MessageSquare, accent: "#10B981" },
    { label: "Retention Rate",   value: data.metrics.retentionRate,               sub: "users with chats", Icon: TrendingUp,  accent: "#F59E0B" },
  ] : [
    { label: "User Growth",      value: "—", sub: "vs last month",    Icon: Users,         accent: "#29A9D4" },
    { label: "Total Users",      value: "—", sub: "all time",         Icon: Brain,         accent: "#6366F1" },
    { label: "Messages / Day",   value: "—", sub: "7-day avg",        Icon: MessageSquare, accent: "#10B981" },
    { label: "Retention Rate",   value: "—", sub: "users with chats", Icon: TrendingUp,    accent: "#F59E0B" },
  ];

  const signupData   = data?.monthlySignups  ?? [];
  const msgData      = data?.monthlyMessages ?? [];
  const dailyMsgData = data?.dailyMessages   ?? [];

  return (
    <>
      <style>{`
        .an{padding:18px 14px 48px;background:var(--c-bg);min-height:100%;transition:background .3s}
        @media(min-width:600px){.an{padding:26px 24px 56px}}
        @media(min-width:1024px){.an{padding:32px 36px 64px}}
        .an-inner{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:22px}

        .an-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.5rem,4vw,2rem);font-weight:400;letter-spacing:-.022em;color:var(--c-text);margin-bottom:4px}
        .an-sub{font-size:.8rem;color:var(--c-muted)}

        .an-metrics{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)}
        @media(min-width:900px){.an-metrics{grid-template-columns:repeat(4,1fr)}}
        .an-metric{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;padding:16px;box-shadow:var(--shadow-sm);transition:background .3s,border-color .3s;position:relative;overflow:hidden}
        .an-metric::after{content:'';position:absolute;top:0;left:0;right:0;height:2.5px;background:var(--mi-accent);opacity:.8}
        .an-metric:hover{border-color:var(--mi-accent);box-shadow:var(--shadow-md)}
        .an-mic{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--mi-accent) 14%,transparent);color:var(--mi-accent);margin-bottom:12px}
        .an-mic svg{width:14px;height:14px}
        .an-mval{font-family:'DM Serif Display',serif;font-size:1.75rem;font-weight:400;color:var(--c-text);letter-spacing:-.02em;line-height:1}
        .an-mlbl{font-size:.7rem;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:.05em;margin-top:3px}
        .an-msub{font-size:.68rem;color:var(--c-muted);margin-top:2px;opacity:.7}

        .an-charts{display:grid;gap:14px}
        @media(min-width:768px){.an-charts{grid-template-columns:1fr 1fr}}

        .an-chart-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;padding:18px 18px 12px;box-shadow:var(--shadow-sm);transition:background .3s,border-color .3s}
        .an-chart-title{font-family:'DM Serif Display',serif;font-size:.92rem;color:var(--c-text);margin-bottom:4px}
        .an-chart-sub{font-size:.68rem;color:var(--c-muted);margin-bottom:16px}
        .an-chart-full{grid-column:1/-1}
      `}</style>

      <div className="an">
        <div className="an-inner">
          <div>
            <h1 className="an-title">Analytics</h1>
            <p className="an-sub">Platform growth and usage metrics.</p>
          </div>

          {/* Metric cards */}
          <div className="an-metrics">
            {metrics.map(({ label, value, sub, Icon, accent }) => (
              <div key={label} className="an-metric" style={{ '--mi-accent': accent } as any}>
                <div className="an-mic"><Icon /></div>
                <div className="an-mval">{loading ? <span style={{opacity:.4}}>…</span> : value}</div>
                <div className="an-mlbl">{label}</div>
                <div className="an-msub">{sub}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="an-charts">
            {/* User growth area chart */}
            <div className="an-chart-card an-chart-full">
              <div className="an-chart-title">User Growth</div>
              <div className="an-chart-sub">Monthly new signups over the past 7 months</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={signupData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#29A9D4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#29A9D4" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--c-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--c-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="users" name="Users" stroke="#29A9D4" strokeWidth={2} fill="url(#ug)" dot={{ r: 3, fill: '#29A9D4' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Daily messages bar chart */}
            <div className="an-chart-card">
              <div className="an-chart-title">Daily Messages</div>
              <div className="an-chart-sub">Messages sent this week</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dailyMsgData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--c-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--c-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="messages" name="Messages" fill="#6366F1" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly messages area chart */}
            <div className="an-chart-card">
              <div className="an-chart-title">Monthly Messages</div>
              <div className="an-chart-sub">Messages sent per month</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={msgData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--c-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--c-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="messages" name="Messages" stroke="#10B981" strokeWidth={2} fill="url(#mg)" dot={{ r: 3, fill: '#10B981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}