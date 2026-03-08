"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, ShieldCheck, UserPlus, Trash2, RefreshCw, X,
  ChevronLeft, ChevronRight, Users, Crown, AlertTriangle,
  Check, MoreHorizontal,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */
interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  status: string;
  role: string;
}

/* ── Constants ──────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

/* ── Helpers ────────────────────────────────────────────────────── */
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-RW", { year: "numeric", month: "short", day: "numeric" });

function Avatar({ name, image, size = 34 }: { name: string | null; image: string | null; size?: number }) {
  const initials = (name ?? "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (image) return <img src={image} alt={name ?? ""} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--c-accent)", color: "#fff", fontSize: size * .36, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────── */
export default function AdminAdmins() {
  const [admins,  setAdmins]  = useState<AdminUser[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);

  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);

  const [menu,      setMenu]      = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  // Promote modal
  const [promoteOpen,  setPromoteOpen]  = useState(false);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoting,    setPromoting]    = useState(false);
  const [promoteErr,   setPromoteErr]   = useState<string | null>(null);
  const [promoteOk,    setPromoteOk]    = useState(false);

  // Confirm demote
  const [demoteTarget, setDemoteTarget] = useState<AdminUser | null>(null);
  const [demoting,     setDemoting]     = useState(false);

  /* ── Fetch ──────────────────────────────────────────────────── */
  const fetchAdmins = useCallback((s: string, p: number) => {
    setLoading(true);
    const q = new URLSearchParams({ search: s, page: String(p), pageSize: String(PAGE_SIZE) });
    fetch(`/api/admin/admins?${q}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) { setAdmins(d.admins); setTotal(d.total); setPages(d.pages); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchAdmins(search, page), 300);
    return () => clearTimeout(id);
  }, [search, page, fetchAdmins]);

  useEffect(() => {
    const fn = () => setMenu(null);
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* ── Promote by email ─────────────────────────────────────────── */
  const handlePromote = async () => {
    const emailTrimmed = promoteEmail.trim();
    if (!emailTrimmed) return;
    setPromoting(true);
    setPromoteErr(null);

    // First look up the user by email
    const lookup = await fetch(`/api/admin/users?search=${encodeURIComponent(emailTrimmed)}&pageSize=5`)
      .then(r => r.json()).catch(() => ({ ok: false }));

    const match = lookup.ok ? (lookup.users as AdminUser[]).find(u => u.email?.toLowerCase() === emailTrimmed.toLowerCase()) : null;
    if (!match) {
      setPromoteErr("No regular user found with that email address.");
      setPromoting(false);
      return;
    }

    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: match.id }),
    }).then(r => r.json()).catch(() => ({ ok: false }));

    if (res.ok) {
      setPromoteOk(true);
      setPromoteEmail("");
      fetchAdmins(search, page);
      setTimeout(() => { setPromoteOk(false); setPromoteOpen(false); }, 1800);
    } else {
      setPromoteErr(res.error ?? "Failed to promote user.");
    }
    setPromoting(false);
  };

  /* ── Demote admin ─────────────────────────────────────────────── */
  const handleDemote = async () => {
    if (!demoteTarget) return;
    setDemoting(true);
    const res = await fetch(`/api/admin/admins/${demoteTarget.id}`, { method: "DELETE" })
      .then(r => r.json()).catch(() => ({ ok: false }));
    if (res.ok) { fetchAdmins(search, page); setDemoteTarget(null); }
    setDemoting(false);
  };

  /* ── JSX ─────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        .aa-root *, .aa-root *::before, .aa-root *::after { box-sizing: border-box; }
        .aa-root {
          display: flex; flex-direction: column; gap: 20px;
          font-family: 'DM Sans', system-ui, sans-serif;
          padding-top: 28px;
        }
        @keyframes aa-fade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes aa-scale { from { opacity:0; transform:scale(.95) translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes aa-spin  { to { transform:rotate(360deg); } }
        .aa-spin { animation: aa-spin .7s linear infinite; }

        /* Header row */
        .aa-header {
          display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
        }
        .aa-header-left { display:flex; flex-direction:column; gap:3px; }
        .aa-header-title { font-size:1.05rem; font-weight:800; color:var(--c-text); }
        .aa-header-sub   { font-size:.75rem; color:var(--c-muted); }

        /* Toolbar */
        .aa-toolbar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .aa-search {
          flex:1; min-width:180px; display:flex; align-items:center; gap:8px;
          padding:0 12px; height:38px; border-radius:10px;
          border:1.5px solid var(--c-border); background:var(--c-surface);
          transition:border-color .15s, box-shadow .15s;
        }
        .aa-search:focus-within {
          border-color:var(--c-accent);
          box-shadow:0 0 0 3px color-mix(in srgb,var(--c-accent) 14%,transparent);
        }
        .aa-search svg { color:var(--c-muted); flex-shrink:0; }
        .aa-search input {
          flex:1; border:none; outline:none; background:transparent;
          color:var(--c-text); font-size:.82rem; font-family:inherit;
        }
        .aa-search input::placeholder { color:var(--c-muted); }
        .aa-icon-btn {
          display:flex; align-items:center; justify-content:center;
          width:38px; height:38px; border-radius:10px; flex-shrink:0;
          border:1.5px solid var(--c-border); background:var(--c-surface);
          color:var(--c-muted); cursor:pointer; transition:all .15s;
        }
        .aa-icon-btn:hover { border-color:var(--c-accent); color:var(--c-accent); background:color-mix(in srgb,var(--c-accent) 8%,transparent); }
        .aa-add-btn {
          display:flex; align-items:center; gap:7px; padding:0 16px; height:38px;
          border-radius:10px; background:var(--c-accent); color:#fff;
          font-size:.8rem; font-weight:700; font-family:inherit; border:none;
          cursor:pointer; transition:opacity .14s, transform .14s; white-space:nowrap; flex-shrink:0;
        }
        .aa-add-btn:hover { opacity:.88; transform:translateY(-1px); }
        .aa-add-btn svg { width:14px; height:14px; }

        /* Card */
        .aa-card {
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:16px; overflow:hidden; animation:aa-fade .4s ease both .05s;
        }
        .aa-card-head {
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:8px; padding:14px 18px 13px;
          border-bottom:1px solid var(--c-border); background:var(--c-surface-2);
        }
        .aa-card-title { font-size:.85rem; font-weight:800; color:var(--c-text); }
        .aa-card-count {
          font-size:.72rem; font-weight:600; color:var(--c-muted);
          background:var(--c-surface); border:1px solid var(--c-border);
          padding:2px 9px; border-radius:20px;
        }
        .aa-tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        table.aa-tbl { width:100%; border-collapse:collapse; font-size:.8rem; min-width:500px; }
        table.aa-tbl th {
          text-align:left; font-size:.62rem; font-weight:800; letter-spacing:.09em;
          text-transform:uppercase; color:var(--c-muted); padding:10px 16px;
          border-bottom:1px solid var(--c-border); white-space:nowrap;
          background:color-mix(in srgb,var(--c-surface-2) 80%,transparent);
        }
        table.aa-tbl td {
          padding:13px 16px; border-bottom:1px solid var(--c-border);
          color:var(--c-muted); vertical-align:middle;
        }
        table.aa-tbl tr:last-child td { border-bottom:none; }
        table.aa-tbl tbody tr:hover td { background:color-mix(in srgb,var(--c-accent) 4%,var(--c-surface)); }

        /* Row */
        .aa-user-cell { display:flex; align-items:center; gap:10px; }
        .aa-user-info { display:flex; flex-direction:column; gap:1px; }
        .aa-user-name { font-size:.83rem; font-weight:700; color:var(--c-text); }
        .aa-user-email { font-size:.69rem; color:var(--c-muted); }
        .aa-role-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:3px 10px; border-radius:20px; font-size:.69rem; font-weight:800;
          background:rgba(56,174,204,.12); color:#38AECC; border:1px solid rgba(56,174,204,.2);
        }
        .aa-role-badge svg { width:10px; height:10px; }
        .aa-status-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:3px 9px; border-radius:7px; font-size:.68rem; font-weight:800;
        }

        /* Context menu */
        .aa-mw { position:relative; }
        .aa-mbtn {
          display:flex; align-items:center; justify-content:center;
          width:30px; height:30px; border-radius:8px;
          border:1px solid transparent; background:none;
          color:var(--c-muted); cursor:pointer; transition:all .12s;
        }
        .aa-mbtn:hover { background:var(--c-surface-2); border-color:var(--c-border); color:var(--c-text); }
        .aa-menu {
          position:absolute; right:0; top:calc(100% + 5px); z-index:200;
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,.2);
          padding:5px; min-width:185px;
        }
        .aa-mi {
          display:flex; align-items:center; gap:9px; padding:8px 11px;
          border-radius:8px; font-size:.79rem; font-weight:600; cursor:pointer;
          color:var(--c-muted); background:none; border:none;
          width:100%; text-align:left; font-family:inherit; transition:all .1s;
        }
        .aa-mi:hover { background:var(--c-surface-2); color:var(--c-text); }
        .aa-mi.danger:hover { background:var(--c-danger-soft); color:var(--c-danger); }
        .aa-mi svg { width:13px; height:13px; flex-shrink:0; }

        /* Pagination */
        .aa-pager {
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:8px; padding:12px 18px;
          border-top:1px solid var(--c-border);
        }
        .aa-pager-info { font-size:.73rem; color:var(--c-muted); }
        .aa-pager-btns { display:flex; align-items:center; gap:6px; }
        .aa-pbtn {
          display:flex; align-items:center; justify-content:center; gap:5px;
          padding:0 14px; height:32px; border-radius:8px;
          border:1px solid var(--c-border); background:var(--c-surface);
          color:var(--c-muted); cursor:pointer; transition:all .13s;
          font-size:.78rem; font-weight:600; font-family:inherit; white-space:nowrap;
        }
        .aa-pbtn:hover:not(:disabled) { border-color:var(--c-accent); color:var(--c-accent); background:color-mix(in srgb,var(--c-accent) 8%,transparent); }
        .aa-pbtn:disabled { opacity:.35; cursor:not-allowed; }
        .aa-pbtn svg { width:13px; height:13px; }
        .aa-pnum-page {
          display:flex; align-items:center; justify-content:center;
          min-width:32px; height:32px; border-radius:8px; padding:0 4px;
          border:1px solid var(--c-border); background:var(--c-surface);
          color:var(--c-muted); cursor:pointer; font-size:.78rem; font-weight:600; transition:all .13s;
        }
        .aa-pnum-page:hover { border-color:var(--c-accent); color:var(--c-accent); background:color-mix(in srgb,var(--c-accent) 8%,transparent); }
        .aa-pnum-page.active { background:var(--c-text); color:var(--c-surface); border-color:var(--c-text); cursor:default; }
        .aa-pnum-ellipsis { font-size:.78rem; color:var(--c-muted); padding:0 2px; line-height:32px; }

        /* Empty / loading */
        .aa-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:50px 20px; color:var(--c-muted); font-size:.82rem; }
        .aa-empty svg { width:36px; height:36px; opacity:.25; }

        /* Modal overlay */
        .aa-ov {
          position:fixed; inset:0; z-index:400;
          background:rgba(6,14,24,.65); backdrop-filter:blur(6px);
          display:flex; align-items:center; justify-content:center; padding:20px;
          animation:aa-fade .16s ease;
        }
        .aa-modal {
          background:var(--c-surface); border:1px solid var(--c-border);
          border-radius:20px; padding:26px; width:100%; max-width:400px;
          box-shadow:0 24px 80px rgba(0,0,0,.35);
          animation:aa-scale .18s ease;
        }
        .aa-modal-hd {
          display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:18px;
        }
        .aa-modal-title { font-size:1rem; font-weight:800; color:var(--c-text); }
        .aa-modal-sub   { font-size:.75rem; color:var(--c-muted); margin-top:3px; line-height:1.4; }
        .aa-modal-close {
          display:flex; align-items:center; justify-content:center;
          width:30px; height:30px; border-radius:8px;
          border:1px solid var(--c-border); background:var(--c-surface-2);
          color:var(--c-muted); cursor:pointer; transition:all .13s; flex-shrink:0;
        }
        .aa-modal-close:hover { border-color:var(--c-danger); color:var(--c-danger); background:var(--c-danger-soft); }
        .aa-modal-close svg { width:13px; height:13px; }
        .aa-input-label { font-size:.72rem; font-weight:700; color:var(--c-muted); margin-bottom:6px; display:block; }
        .aa-input {
          width:100%; height:42px; border-radius:10px;
          border:1.5px solid var(--c-border); background:var(--c-surface-2);
          color:var(--c-text); font-size:.84rem; font-family:inherit;
          padding:0 13px; outline:none; transition:border-color .14s, box-shadow .14s;
        }
        .aa-input:focus {
          border-color:var(--c-accent);
          box-shadow:0 0 0 3px color-mix(in srgb,var(--c-accent) 14%,transparent);
        }
        .aa-err { font-size:.74rem; color:var(--c-danger); margin-top:8px; }
        .aa-ok  { font-size:.74rem; color:var(--c-success); margin-top:8px; display:flex; align-items:center; gap:5px; }
        .aa-ok svg { width:13px; height:13px; }
        .aa-modal-actions { display:flex; gap:8px; margin-top:20px; }
        .aa-btn {
          flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
          height:42px; border-radius:11px; font-size:.83rem; font-weight:800;
          font-family:inherit; border:none; cursor:pointer; transition:opacity .14s, transform .14s;
        }
        .aa-btn:disabled { opacity:.5; cursor:not-allowed; }
        .aa-btn.primary  { background:var(--c-accent); color:#fff; box-shadow:0 4px 18px color-mix(in srgb,var(--c-accent) 38%,transparent); }
        .aa-btn.primary:hover:not(:disabled)  { opacity:.88; transform:translateY(-1px); }
        .aa-btn.ghost    { background:var(--c-surface-2); color:var(--c-muted); border:1px solid var(--c-border); }
        .aa-btn.ghost:hover:not(:disabled)    { color:var(--c-text); border-color:var(--c-text); }
        .aa-btn.danger   { background:var(--c-danger); color:#fff; }
        .aa-btn.danger:hover:not(:disabled)   { opacity:.88; transform:translateY(-1px); }
        .aa-btn svg { width:14px; height:14px; }
        /* Warn box */
        .aa-warn {
          display:flex; align-items:flex-start; gap:10px; padding:12px 14px;
          background:var(--c-warn-soft); border:1px solid color-mix(in srgb,var(--c-warn) 30%,transparent);
          border-radius:10px; margin-bottom:6px;
        }
        .aa-warn svg { width:15px; height:15px; color:var(--c-warn); flex-shrink:0; margin-top:1px; }
        .aa-warn-text { font-size:.78rem; color:var(--c-warn); line-height:1.5; }
        .aa-warn-name { font-weight:800; }
      `}</style>

      <div className="aa-root">

        {/* ── Header ── */}
        <div className="aa-header">
          <div className="aa-header-left">
            <span className="aa-header-title">Admin Management</span>
            <span className="aa-header-sub">{total} admin account{total !== 1 ? "s" : ""} · full platform access</span>
          </div>
          <button className="aa-add-btn" onClick={() => { setPromoteOpen(true); setPromoteEmail(""); setPromoteErr(null); setPromoteOk(false); }}>
            <UserPlus size={14}/> Promote User to Admin
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="aa-toolbar">
          <div className="aa-search">
            <Search size={13}/>
            <input
              placeholder="Search name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            {search && (
              <button style={{ background:"none", border:"none", cursor:"pointer", color:"var(--c-muted)", display:"flex", padding:0 }}
                onClick={() => { setSearch(""); setPage(1); }}>
                <X size={12}/>
              </button>
            )}
          </div>
          <button className="aa-icon-btn" title="Refresh" onClick={() => fetchAdmins(search, page)}>
            <RefreshCw size={14} className={loading ? "aa-spin" : ""}/>
          </button>
        </div>

        {/* ── Table ── */}
        <div className="aa-card">
          <div className="aa-card-head">
            <span className="aa-card-title">Administrators</span>
            <span className="aa-card-count">{total.toLocaleString()} total</span>
          </div>

          <div className="aa-tbl-wrap">
            {loading ? (
              <div className="aa-empty">
                <RefreshCw className="aa-spin" style={{ width: 28, height: 28 }}/>
                <span>Loading admins…</span>
              </div>
            ) : admins.length === 0 ? (
              <div className="aa-empty">
                <ShieldCheck/>
                <span>No admin accounts found</span>
              </div>
            ) : (
              <table className="aa-tbl">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Added</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a, idx) => {
                    const statusColor = a.status === "active" ? { color: "#10B981", bg: "rgba(16,185,129,.12)" }
                      : a.status === "banned"  ? { color: "#EF4444", bg: "rgba(239,68,68,.12)" }
                      : { color: "#F59E0B", bg: "rgba(245,158,11,.12)" };
                    return (
                      <tr key={a.id} style={{ animationDelay: `${idx * .02}s` }}>
                        <td>
                          <div className="aa-user-cell">
                            <Avatar name={a.name} image={a.image}/>
                            <div className="aa-user-info">
                              <span className="aa-user-name">{a.name ?? "—"}</span>
                              <span className="aa-user-email">{a.email ?? "—"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="aa-role-badge">
                            <ShieldCheck size={10}/>
                            Admin
                          </span>
                        </td>
                        <td>
                          <span className="aa-status-badge" style={{ background: statusColor.bg, color: statusColor.color }}>
                            {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ whiteSpace: "nowrap", fontSize: ".77rem" }}>{fmtDate(a.createdAt)}</td>
                        <td>
                          <div className="aa-mw" onClick={e => e.stopPropagation()}>
                            <button className="aa-mbtn"
                              disabled={actioning === a.id}
                              onClick={() => setMenu(m => m === a.id ? null : a.id)}>
                              {actioning === a.id
                                ? <RefreshCw size={12} className="aa-spin"/>
                                : <MoreHorizontal size={14}/>}
                            </button>
                            {menu === a.id && (
                              <div className="aa-menu">
                                <button className="aa-mi danger" onClick={() => { setMenu(null); setDemoteTarget(a); }}>
                                  <Trash2 size={13}/> Remove Admin
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {admins.length > 0 && (
            <div className="aa-pager">
              <span className="aa-pager-info">
                Showing {Math.min((page-1)*PAGE_SIZE+1, total)}–{Math.min(page*PAGE_SIZE, total)} of {total.toLocaleString()}
              </span>
              <div className="aa-pager-btns">
                <button className="aa-pbtn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={13}/> Back
                </button>
                {(() => {
                  const range: (number | "…")[] = [];
                  range.push(1);
                  if (page - 1 > 2) range.push("…");
                  for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) range.push(i);
                  if (page + 1 < pages - 1) range.push("…");
                  if (pages > 1) range.push(pages);
                  return range.map((item, i) =>
                    item === "…"
                      ? <span key={`e${i}`} className="aa-pnum-ellipsis">…</span>
                      : <button key={item} className={`aa-pnum-page${page === item ? " active" : ""}`}
                          onClick={() => page !== item && setPage(item as number)}>
                          {item}
                        </button>
                  );
                })()}
                <button className="aa-pbtn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight size={13}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Promote Modal ── */}
      {promoteOpen && (
        <div className="aa-ov" onClick={() => !promoting && setPromoteOpen(false)}>
          <div className="aa-modal" onClick={e => e.stopPropagation()}>
            <div className="aa-modal-hd">
              <div>
                <div className="aa-modal-title">Promote User to Admin</div>
                <div className="aa-modal-sub">Enter the email of an existing regular user</div>
              </div>
              <button className="aa-modal-close" onClick={() => setPromoteOpen(false)} disabled={promoting}>
                <X size={13}/>
              </button>
            </div>
            <label className="aa-input-label">User Email</label>
            <input
              className="aa-input"
              type="email"
              placeholder="user@example.com"
              value={promoteEmail}
              onChange={e => { setPromoteEmail(e.target.value); setPromoteErr(null); }}
              onKeyDown={e => e.key === "Enter" && handlePromote()}
              disabled={promoting || promoteOk}
            />
            {promoteErr && <div className="aa-err">{promoteErr}</div>}
            {promoteOk  && <div className="aa-ok"><Check size={13}/> Admin promoted successfully!</div>}
            <div className="aa-modal-actions">
              <button className="aa-btn ghost" onClick={() => setPromoteOpen(false)} disabled={promoting}>Cancel</button>
              <button className="aa-btn primary" onClick={handlePromote} disabled={promoting || !promoteEmail.trim() || promoteOk}>
                {promoting ? <><RefreshCw size={14} className="aa-spin"/> Promoting…</> : <><UserPlus size={14}/> Promote</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Demote Confirm ── */}
      {demoteTarget && (
        <div className="aa-ov" onClick={() => !demoting && setDemoteTarget(null)}>
          <div className="aa-modal" onClick={e => e.stopPropagation()}>
            <div className="aa-modal-hd">
              <div>
                <div className="aa-modal-title">Remove Admin</div>
                <div className="aa-modal-sub">This will demote the user to a regular account</div>
              </div>
              <button className="aa-modal-close" onClick={() => setDemoteTarget(null)} disabled={demoting}>
                <X size={13}/>
              </button>
            </div>
            <div className="aa-warn">
              <AlertTriangle size={15}/>
              <div className="aa-warn-text">
                <span className="aa-warn-name">{demoteTarget.name ?? demoteTarget.email}</span> will lose all admin privileges immediately.
                They will be moved back to a regular user account.
              </div>
            </div>
            <div className="aa-modal-actions">
              <button className="aa-btn ghost" onClick={() => setDemoteTarget(null)} disabled={demoting}>Cancel</button>
              <button className="aa-btn danger" onClick={handleDemote} disabled={demoting}>
                {demoting ? <><RefreshCw size={14} className="aa-spin"/> Removing…</> : <><Trash2 size={14}/> Remove Admin</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
