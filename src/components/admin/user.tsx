"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MoreHorizontal, UserX, ShieldCheck, Eye, ChevronLeft, ChevronRight } from "lucide-react";

type Status = "active" | "pending" | "banned" | "flagged";

interface User {
  id: string; name: string | null; email: string | null;
  createdAt: string; status: Status; role: string;
  _count: { virtualSelfChats: number };
}

const PAGE_SIZE = 7;

export default function AdminUsers() {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<Status | "all">("all");
  const [page, setPage]       = useState(1);
  const [users, setUsers]     = useState<User[]>([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu]       = useState<string | null>(null);

  const fetchUsers = useCallback((s: string, f: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ search: s, status: f, page: String(p), pageSize: String(PAGE_SIZE) });
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) {
          setUsers(d.users);
          setTotal(d.total);
          setPages(d.pages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchUsers(search, filter, page), 300);
    return () => clearTimeout(id);
  }, [search, filter, page, fetchUsers]);

  const updateStatus = (id: string, status: Status) => {
    fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok) setUsers(p => p.map(u => u.id === id ? { ...u, status } : u));
      })
      .catch(() => {});
    setMenu(null);
  };

  const statusColor: Record<Status, string> = {
    active:  "au-s--active",
    pending: "au-s--pending",
    flagged: "au-s--flagged",
    banned:  "au-s--banned",
  };

  return (
    <>
      <style>{`
        .au{padding:18px 14px 48px;background:var(--c-bg);min-height:100%;transition:background .3s}
        @media(min-width:600px){.au{padding:26px 24px 56px}}
        @media(min-width:1024px){.au{padding:32px 36px 64px}}
        .au-inner{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:20px}

        .au-title{font-family:'DM Serif Display',Georgia,serif;font-size:clamp(1.5rem,4vw,2rem);font-weight:400;letter-spacing:-.022em;color:var(--c-text);margin-bottom:4px}
        .au-sub{font-size:.8rem;color:var(--c-muted)}

        /* Toolbar */
        .au-toolbar{display:flex;flex-wrap:wrap;gap:9px;align-items:center}
        .au-search-wrap{flex:1;min-width:200px;position:relative}
        .au-search-ic{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--c-muted);width:14px;height:14px;pointer-events:none}
        .au-search{width:100%;padding:9px 12px 9px 33px;border-radius:10px;border:1px solid var(--c-border);background:var(--c-surface);color:var(--c-text);font-size:.84rem;font-family:inherit;outline:none;transition:border-color .14s}
        .au-search:focus{border-color:var(--c-accent)}
        .au-search::placeholder{color:var(--c-muted)}
        .au-filters{display:flex;gap:5px;flex-wrap:wrap}
        .au-filter{padding:6px 12px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);font-size:.74rem;font-weight:600;cursor:pointer;transition:all .13s;font-family:inherit}
        .au-filter:hover{border-color:var(--c-accent);color:var(--c-accent)}
        .au-filter--on{background:var(--c-accent-soft);border-color:var(--c-accent);color:var(--c-accent)}

        /* Table card */
        .au-card{background:var(--c-surface);border:1px solid var(--c-border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-sm);transition:background .3s,border-color .3s}
        .au-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
        table.au-t{width:100%;border-collapse:collapse;min-width:580px}
        .au-t th{padding:10px 16px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--c-muted);background:var(--c-surface-2);border-bottom:1px solid var(--c-border);text-align:left;white-space:nowrap}
        .au-t td{padding:11px 16px;border-bottom:1px solid var(--c-border);vertical-align:middle}
        .au-t tr:last-child td{border-bottom:none}
        .au-t tr:hover td{background:var(--c-surface-2)}

        .au-user-cell{display:flex;align-items:center;gap:10px}
        .au-uav{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,var(--c-accent),#7DD3FC);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.78rem;font-weight:700;flex-shrink:0}
        .au-uname{font-size:.82rem;font-weight:600;color:var(--c-text)}
        .au-uemail{font-size:.68rem;color:var(--c-muted)}
        .au-td-sm{font-size:.8rem;color:var(--c-muted)}

        .au-s{display:inline-block;padding:2px 9px;border-radius:20px;font-size:.64rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
        .au-s--active{background:var(--c-success-soft);color:var(--c-success)}
        .au-s--pending{background:var(--c-warn-soft);color:var(--c-warn)}
        .au-s--flagged{background:var(--c-danger-soft);color:var(--c-danger)}
        .au-s--banned{background:color-mix(in srgb,#6B7280 15%,transparent);color:#6B7280}

        /* Action menu */
        .au-menu-wrap{position:relative;display:inline-flex}
        .au-menu-btn{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);cursor:pointer;transition:all .13s}
        .au-menu-btn:hover{color:var(--c-accent);border-color:var(--c-accent)}
        .au-menu-btn svg{width:13px;height:13px}
        .au-menu{position:absolute;right:0;top:34px;z-index:50;background:var(--c-surface);border:1px solid var(--c-border);border-radius:11px;box-shadow:var(--shadow-md);padding:5px;min-width:160px;display:flex;flex-direction:column;gap:2px}
        .au-menu-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;font-size:.78rem;font-weight:500;color:var(--c-text);cursor:pointer;transition:background .12s;border:none;background:none;font-family:inherit;width:100%;text-align:left}
        .au-menu-item:hover{background:var(--c-surface-2)}
        .au-menu-item--danger{color:var(--c-danger)}
        .au-menu-item--danger:hover{background:var(--c-danger-soft)}
        .au-menu-item svg{width:13px;height:13px}

        /* Empty */
        .au-empty{padding:40px 20px;text-align:center;color:var(--c-muted);font-size:.82rem}

        /* Pagination */
        .au-page{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid var(--c-border);gap:10px;flex-wrap:wrap}
        .au-page-info{font-size:.74rem;color:var(--c-muted)}
        .au-page-btns{display:flex;gap:5px}
        .au-page-btn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);cursor:pointer;font-size:.78rem;font-weight:600;transition:all .13s;font-family:inherit}
        .au-page-btn:hover:not(:disabled){border-color:var(--c-accent);color:var(--c-accent);background:var(--c-accent-soft)}
        .au-page-btn:disabled{opacity:.4;cursor:not-allowed}
        .au-page-btn--on{background:var(--c-accent);color:#fff;border-color:var(--c-accent)}
        .au-page-btn--on:hover{background:var(--c-accent)!important;color:#fff!important}
      `}</style>

      <div className="au">
        <div className="au-inner">
          <div>
            <h1 className="au-title">User Management</h1>
            <p className="au-sub">View, search, and manage all Velamini users.</p>
          </div>

          {/* Toolbar */}
          <div className="au-toolbar">
            <div className="au-search-wrap">
              <Search className="au-search-ic" />
              <input className="au-search" placeholder="Search by name or email…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="au-filters">
              {(["all","active","pending","flagged","banned"] as const).map(f => (
                <button key={f} className={`au-filter ${filter === f ? "au-filter--on" : ""}`}
                  onClick={() => { setFilter(f); setPage(1); }}>
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="au-card">
            <div className="au-table-wrap">
              <table className="au-t">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Joined</th>
                    <th>Chats</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="au-empty">Loading…</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={5} className="au-empty">No users found.</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="au-user-cell">
                          <div className="au-uav">{(u.name ?? u.email ?? "?")[0].toUpperCase()}</div>
                          <div>
                            <div className="au-uname">{u.name ?? "(no name)"}</div>
                            <div className="au-uemail">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="au-td-sm">{new Date(u.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</span></td>
                      <td><span className="au-td-sm">{u._count.virtualSelfChats}</span></td>
                      <td><span className={`au-s ${statusColor[u.status]}`}>{u.status}</span></td>
                      <td>
                        <div className="au-menu-wrap">
                          <button className="au-menu-btn" onClick={() => setMenu(menu === u.id ? null : u.id)}>
                            <MoreHorizontal />
                          </button>
                          {menu === u.id && (
                            <div className="au-menu">
                              <button className="au-menu-item" onClick={() => setMenu(null)}>
                                <Eye size={13} /> View Profile
                              </button>
                              {u.status !== "active" && (
                                <button className="au-menu-item" onClick={() => updateStatus(u.id, "active")}>
                                  <ShieldCheck size={13} /> Mark Active
                                </button>
                              )}
                              {u.status !== "flagged" && (
                                <button className="au-menu-item au-menu-item--danger" onClick={() => updateStatus(u.id, "flagged")}>
                                  <UserX size={13} /> Flag User
                                </button>
                              )}
                              {u.status !== "banned" && (
                                <button className="au-menu-item au-menu-item--danger" onClick={() => updateStatus(u.id, "banned")}>
                                  <UserX size={13} /> Ban User
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="au-page">
              <span className="au-page-info">
                {total === 0 ? "0 users" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} users`}
              </span>
              <div className="au-page-btns">
                <button className="au-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`au-page-btn ${page === p ? "au-page-btn--on" : ""}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}
                <button className="au-page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}