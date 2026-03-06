"use client";

import {
  Moon, Sun, LogOut, Share2, Copy, Check, ChevronDown,
  Link, X, Menu, LayoutDashboard, Brain, MessageSquare,
  User, Settings, FileText,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

export type DashboardViewType = "dashboard" | "training" | "chat" | "profile" | "settings" | "resume";

interface NavbarProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  activeView?: DashboardViewType;
  onViewChange?: (view: DashboardViewType) => void;
  swagList?: { id: string; content: string }[];
  slug?: string;
}

const viewLabels: Record<DashboardViewType, string> = {
  dashboard: "Dashboard", training: "Training", chat: "Chat",
  profile: "Profile", settings: "Settings", resume: "Resume",
};

const navItems: { view: DashboardViewType; label: string; Icon: any }[] = [
  { view: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { view: "training",  label: "Training",  Icon: Brain            },
  { view: "chat",      label: "Chat",      Icon: MessageSquare    },
  { view: "profile",   label: "Profile",   Icon: User             },
  { view: "resume",    label: "Resume",    Icon: FileText         },
  { view: "settings",  label: "Settings",  Icon: Settings         },
];

export default function DashboardNavbar({
  user, isDarkMode, onThemeToggle, activeView = "dashboard",
  onViewChange, swagList = [], slug,
}: NavbarProps) {
  const [shareOpen,   setShareOpen]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [mobileShare, setMobileShare] = useState(false);
  const [copiedId,    setCopiedId]    = useState<string | null>(null);
  const shareRef  = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://velamini.com";
  const getSwagUrl = (c: string) =>
    `${origin}/chat/${encodeURIComponent(c.replace(/\s+/g, "-").toLowerCase())}`;
  const getSlugUrl = () =>
    slug ? `${origin}/chat/${encodeURIComponent(slug)}` : `${origin}/chat`;

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id); setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (shareRef.current  && !shareRef.current.contains(e.target as Node))  setShareOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleViewChange = (view: DashboardViewType) => {
    onViewChange?.(view);
    setMobileOpen(false);
    setMobileShare(false);
  };

  const ShareItems = () => (
    <>
      {slug && (
        <>
          <div className="dnb-drop-label">Profile link</div>
          <div className="dnb-drop-item">
            <div className="dnb-drop-item-name"><Link size={13}/><span>{getSlugUrl()}</span></div>
            <button className={`dnb-copy-pill ${copiedId==="__slug__"?"dnb-copy-pill--done":"dnb-copy-pill--idle"}`}
              onClick={() => handleCopy(getSlugUrl(), "__slug__")}>
              {copiedId==="__slug__" ? <><Check size={10}/> Copied</> : <><Copy size={10}/> Copy</>}
            </button>
          </div>
        </>
      )}
      {swagList.length > 0 && (
        <>
          {slug && <div className="dnb-drop-divider"/>}
          <div className="dnb-drop-label">Swag links</div>
          {swagList.map(swag => (
            <div className="dnb-drop-item" key={swag.id}>
              <div className="dnb-drop-item-name"><Link size={13}/><span>{swag.content}</span></div>
              <button className={`dnb-copy-pill ${copiedId===swag.id?"dnb-copy-pill--done":"dnb-copy-pill--idle"}`}
                onClick={() => handleCopy(getSwagUrl(swag.content), swag.id)}>
                {copiedId===swag.id ? <><Check size={10}/> Copied</> : <><Copy size={10}/> Copy</>}
              </button>
            </div>
          ))}
        </>
      )}
      {!slug && swagList.length === 0 && (
        <div className="dnb-drop-empty">No share links yet — add one in Settings.</div>
      )}
    </>
  );

  return (
    <>
      <style>{`
        /*
         * KEY LAYOUT RULE:
         * On desktop (lg+): sidebar is 224px wide on the LEFT.
         * The navbar must only cover the main content area — so left = 224px.
         * On mobile: sidebar is hidden, so navbar spans full width (left = 0).
         */
        .dnb {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 14px; height: 52px;
          position: fixed; top: 0;
          left: 0;          /* mobile: full width */
          right: 0;
          z-index: 40;      /* BELOW sidebar (sidebar should be z-index: 50+) */
          background: var(--c-surface, #fff);
          border-bottom: 1px solid var(--c-border, #C5DCF2);
          transition: background .3s, border-color .3s;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        /* On desktop, start after the 224px sidebar */
        @media(min-width:1024px){
          .dnb {
            left: 224px;    /* matches sidebar width in Sidebar.tsx */
            padding: 0 24px;
            height: 56px;
          }
        }

        /* breadcrumb */
        .dnb-breadcrumb { display:flex; align-items:center; gap:6px; font-size:.78rem; color:var(--c-muted,#7399BA); }
        .dnb-sep   { opacity:.4; }
        .dnb-active{ font-weight:600; color:var(--c-text,#0B1E2E); }

        /* left cluster */
        .dnb-left { display:flex; align-items:center; gap:8px; }
        /* logo only on mobile (sidebar already shows it on desktop) */
        .dnb-logo {
          width:26px; height:26px; border-radius:7px; overflow:hidden;
          border:1.5px solid var(--c-border,#C5DCF2); flex-shrink:0;
        }
        .dnb-logo img { width:100%; height:100%; object-fit:cover; display:block; }
        .dnb-logo { display:flex; }
        @media(min-width:1024px){ .dnb-logo { display:none; } }

        /* right cluster */
        .dnb-right { display:flex; align-items:center; gap:6px; }
        .dnb-divider{ width:1px; height:18px; background:var(--c-border,#C5DCF2); }

        /* visibility helpers */
        .dnb-desk { display:none !important; }
        @media(min-width:1024px){ .dnb-desk { display:flex !important; } }
        .dnb-mob  { display:flex !important; }
        @media(min-width:1024px){ .dnb-mob  { display:none  !important; } }

        /* icon btn */
        .dnb-icon-btn {
          display:flex; align-items:center; justify-content:center;
          width:32px; height:32px; border-radius:8px;
          border:1px solid var(--c-border,#C5DCF2);
          background:var(--c-surface-2,#E2F0FC);
          color:var(--c-muted,#7399BA); cursor:pointer; transition:all .14s;
        }
        .dnb-icon-btn:hover { color:var(--c-accent,#29A9D4); border-color:var(--c-accent,#29A9D4); background:var(--c-accent-soft,#DDF1FA); }
        .dnb-icon-btn svg { width:14px; height:14px; }

        /* share btn */
        .dnb-share-btn {
          display:flex; align-items:center; gap:5px; padding:0 11px; height:32px;
          border-radius:8px; border:1.5px solid var(--c-accent,#29A9D4);
          background:var(--c-accent-soft,#DDF1FA); color:var(--c-accent,#29A9D4);
          font-size:.74rem; font-weight:700; cursor:pointer; font-family:inherit;
          transition:all .14s; white-space:nowrap;
        }
        .dnb-share-btn:hover { background:var(--c-accent,#29A9D4); color:#fff; }
        .dnb-share-btn svg { width:13px; height:13px; }

        /* name chip */
        .dnb-name-chip {
          display:flex; align-items:center; padding:0 10px; height:32px; border-radius:8px;
          border:1px solid var(--c-border,#C5DCF2); background:var(--c-surface-2,#E2F0FC);
          font-size:.76rem; font-weight:600; color:var(--c-text,#0B1E2E);
          white-space:nowrap; max-width:130px; overflow:hidden; text-overflow:ellipsis;
        }

        /* logout */
        .dnb-logout {
          display:flex; align-items:center; gap:5px; padding:0 11px; height:32px;
          border-radius:8px; border:1px solid var(--c-border,#C5DCF2);
          background:var(--c-surface-2,#E2F0FC); color:var(--c-muted,#7399BA);
          font-size:.74rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .14s;
        }
        .dnb-logout:hover { background:#FEE2E2; border-color:#FCA5A5; color:#DC2626; }
        .dnb-logout svg { width:12px; height:12px; }

        /* ── Desktop share dropdown ── */
        .dnb-drop-wrap { position:relative; }
        .dnb-dropdown {
          position:absolute; top:calc(100% + 8px); right:0; min-width:272px;
          background:var(--c-surface,#fff); border:1px solid var(--c-border,#C5DCF2);
          border-radius:14px; box-shadow:0 12px 36px rgba(8,20,32,.14);
          z-index:200; overflow:hidden; animation:dnbDrop .15s ease;
        }
        @keyframes dnbDrop {
          from{opacity:0;transform:translateY(-6px) scale(.97);}
          to{opacity:1;transform:translateY(0) scale(1);}
        }
        .dnb-drop-head {
          padding:10px 14px 8px; font-size:.68rem; font-weight:700; letter-spacing:.07em;
          text-transform:uppercase; color:var(--c-muted,#7399BA);
          border-bottom:1px solid var(--c-border,#C5DCF2);
        }
        .dnb-drop-section { padding:8px; display:flex; flex-direction:column; gap:2px; }
        .dnb-drop-label {
          padding:4px 8px 2px; font-size:.65rem; font-weight:700; letter-spacing:.06em;
          text-transform:uppercase; color:var(--c-muted,#7399BA);
        }
        .dnb-drop-item {
          display:flex; align-items:center; justify-content:space-between;
          gap:10px; padding:9px 10px; border-radius:9px; cursor:pointer;
          transition:background .12s; min-height:42px;
        }
        .dnb-drop-item:hover { background:var(--c-surface-2,#E2F0FC); }
        .dnb-drop-item-name {
          display:flex; align-items:center; gap:7px; font-size:.8rem; font-weight:600;
          color:var(--c-text,#0B1E2E); overflow:hidden; min-width:0; flex:1;
        }
        .dnb-drop-item-name svg { color:var(--c-accent,#29A9D4); flex-shrink:0; }
        .dnb-drop-item-name span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .dnb-copy-pill {
          display:flex; align-items:center; gap:4px; padding:4px 9px; border-radius:6px;
          font-size:.68rem; font-weight:700; border:none; cursor:pointer; font-family:inherit;
          transition:all .14s; flex-shrink:0; white-space:nowrap; min-height:30px;
        }
        .dnb-copy-pill--idle { background:var(--c-accent-soft,#DDF1FA); color:var(--c-accent,#29A9D4); border:1px solid var(--c-accent,#29A9D4); }
        .dnb-copy-pill--idle:hover { background:var(--c-accent,#29A9D4); color:#fff; }
        .dnb-copy-pill--done { background:color-mix(in srgb,#22c55e 14%,transparent); color:#166534; border:1px solid color-mix(in srgb,#22c55e 35%,transparent); }
        [data-mode="dark"] .dnb-copy-pill--done { color:#86efac; }
        .dnb-drop-empty { padding:14px; font-size:.78rem; color:var(--c-muted,#7399BA); text-align:center; }
        .dnb-drop-divider { height:1px; background:var(--c-border,#C5DCF2); margin:4px 8px; }

        /* ── Mobile dropdown menu ── */
        .dnb-mob-wrap { position:relative; }
        .dnb-mob-menu {
          position:fixed; top:52px; left:0; right:0; z-index:39;
          background:var(--c-surface,#fff); border-bottom:1px solid var(--c-border,#C5DCF2);
          box-shadow:0 8px 32px rgba(8,20,32,.13);
          animation:dnbMenuDown .18s ease;
          max-height:calc(100vh - 52px); overflow-y:auto;
          padding:10px 12px 16px; display:flex; flex-direction:column; gap:10px;
        }
        @keyframes dnbMenuDown {
          from{opacity:0;transform:translateY(-10px);}
          to{opacity:1;transform:translateY(0);}
        }

        /* user row */
        .dnb-mu-user {
          display:flex; align-items:center; gap:10px; padding:10px 12px;
          border-radius:11px; background:var(--c-surface-2,#E2F0FC);
          border:1px solid var(--c-border,#C5DCF2);
        }
        .dnb-mu-avatar {
          width:34px; height:34px; border-radius:9px; flex-shrink:0;
          background:var(--c-accent,#29A9D4);
          display:flex; align-items:center; justify-content:center;
          font-size:.9rem; font-weight:700; color:#fff;
        }
        .dnb-mu-name  { font-size:.84rem; font-weight:700; color:var(--c-text,#0B1E2E); }
        .dnb-mu-email { font-size:.7rem;  color:var(--c-muted,#7399BA); }

        /* nav grid */
        .dnb-mu-sec-lbl {
          font-size:.62rem; font-weight:700; letter-spacing:.09em; text-transform:uppercase;
          color:var(--c-muted,#7399BA); padding:0 2px;
        }
        .dnb-mu-nav { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
        .dnb-mu-nav-btn {
          display:flex; align-items:center; gap:8px; padding:10px 12px;
          border-radius:10px; min-height:44px; border:1px solid var(--c-border,#C5DCF2);
          background:var(--c-surface-2,#E2F0FC); cursor:pointer;
          transition:all .14s; font-family:inherit; text-align:left;
        }
        .dnb-mu-nav-btn:hover { border-color:var(--c-accent,#29A9D4); background:var(--c-accent-soft,#DDF1FA); }
        .dnb-mu-nav-btn--on { border-color:var(--c-accent,#29A9D4)!important; background:var(--c-accent-soft,#DDF1FA)!important; }
        .dnb-mu-nav-ic {
          width:26px; height:26px; border-radius:7px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          background:var(--c-surface,#fff); color:var(--c-muted,#7399BA); transition:all .14s;
        }
        .dnb-mu-nav-ic svg { width:13px; height:13px; }
        .dnb-mu-nav-btn--on .dnb-mu-nav-ic { background:var(--c-accent,#29A9D4); color:#fff; }
        .dnb-mu-nav-btn:hover:not(.dnb-mu-nav-btn--on) .dnb-mu-nav-ic { color:var(--c-accent,#29A9D4); }
        .dnb-mu-nav-txt { font-size:.78rem; font-weight:600; color:var(--c-muted,#7399BA); }
        .dnb-mu-nav-btn--on .dnb-mu-nav-txt { color:var(--c-accent,#29A9D4); }
        .dnb-mu-nav-btn:hover:not(.dnb-mu-nav-btn--on) .dnb-mu-nav-txt { color:var(--c-text,#0B1E2E); }

        /* share toggle */
        .dnb-mu-share-row { display:flex; align-items:center; justify-content:space-between; padding:0 2px; }
        .dnb-mu-share-toggle {
          display:flex; align-items:center; gap:4px; padding:3px 9px; border-radius:6px;
          font-size:.7rem; font-weight:700; font-family:inherit; cursor:pointer;
          border:1.5px solid var(--c-accent,#29A9D4);
          background:var(--c-accent-soft,#DDF1FA); color:var(--c-accent,#29A9D4);
          transition:all .14s;
        }
        .dnb-mu-share-toggle:hover { background:var(--c-accent,#29A9D4); color:#fff; }
        .dnb-mu-share-toggle svg { width:12px; height:12px; }
        .dnb-mu-share-box {
          background:var(--c-surface-2,#E2F0FC); border:1px solid var(--c-border,#C5DCF2);
          border-radius:12px; overflow:hidden; animation:dnbFadeIn .15s ease;
        }
        @keyframes dnbFadeIn{from{opacity:0;}to{opacity:1;}}
        .dnb-mu-share-hd {
          padding:8px 12px 6px; font-size:.66rem; font-weight:700; letter-spacing:.07em;
          text-transform:uppercase; color:var(--c-muted,#7399BA);
          border-bottom:1px solid var(--c-border,#C5DCF2); background:var(--c-surface,#fff);
        }
        .dnb-mu-share-bd { padding:6px; }

        /* actions */
        .dnb-mu-actions { display:flex; gap:8px; }
        .dnb-mu-action {
          flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
          height:40px; border-radius:9px; border:1px solid var(--c-border,#C5DCF2);
          background:var(--c-surface-2,#E2F0FC); color:var(--c-muted,#7399BA);
          font-size:.76rem; font-weight:700; cursor:pointer; font-family:inherit;
          transition:all .14s; white-space:nowrap;
        }
        .dnb-mu-action:hover { color:var(--c-accent,#29A9D4); border-color:var(--c-accent,#29A9D4); background:var(--c-accent-soft,#DDF1FA); }
        .dnb-mu-action--danger { border-color:#FCA5A5; background:#FEF2F2; color:#DC2626; }
        .dnb-mu-action--danger:hover { background:#FEE2E2; }
        .dnb-mu-action svg { width:14px; height:14px; }
      `}</style>

      <header className="dnb">
        {/* Left: logo (mobile only) + breadcrumb */}
        <div className="dnb-left">
          <div className="dnb-logo"><img src="/logo.png" alt="Velamini"/></div>
          <nav className="dnb-breadcrumb">
            <span>Velamini</span>
            <span className="dnb-sep">/</span>
            <span className="dnb-active">{viewLabels[activeView]}</span>
          </nav>
        </div>

        <div className="dnb-right">
          {/* ── Desktop ── */}
          <button className="dnb-icon-btn dnb-desk" onClick={onThemeToggle} title="Toggle theme">
            {isDarkMode ? <Sun size={13}/> : <Moon size={13}/>}
          </button>

          <div className="dnb-drop-wrap dnb-desk" ref={shareRef}>
            <button className="dnb-share-btn" onClick={() => setShareOpen(v => !v)}>
              <Share2 size={13}/> Share
              <ChevronDown size={12} style={{opacity:.7,transform:shareOpen?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}/>
            </button>
            {shareOpen && (
              <div className="dnb-dropdown">
                <div className="dnb-drop-head">Share your virtual self</div>
                <div className="dnb-drop-section"><ShareItems/></div>
              </div>
            )}
          </div>


          <button className="dnb-logout dnb-desk" onClick={() => signOut({ callbackUrl:"/signin" })}>
            <LogOut size={12}/> Sign out
          </button>

          {/* ── Mobile hamburger ── */}
          <div className="dnb-mob-wrap dnb-mob" ref={mobileRef}>
            <button className="dnb-icon-btn" onClick={() => setMobileOpen(v => !v)} title="Menu">
              {mobileOpen ? <X size={14}/> : <Menu size={14}/>}
            </button>

            {mobileOpen && (
              <div className="dnb-mob-menu">

                {/* User */}
                <div className="dnb-mu-user">
                  <div className="dnb-mu-avatar">{user?.name?.charAt(0).toUpperCase() ?? "U"}</div>
                  <div>
                    <div className="dnb-mu-name">{user?.name ?? "User"}</div>
                    {user?.email && <div className="dnb-mu-email">{user.email}</div>}
                  </div>
                </div>

                {/* Nav grid */}
                <div className="dnb-mu-sec-lbl">Navigation</div>
                <div className="dnb-mu-nav">
                  {navItems.map(({ view, label, Icon }) => (
                    <button key={view}
                      className={`dnb-mu-nav-btn ${activeView === view ? "dnb-mu-nav-btn--on" : ""}`}
                      onClick={() => handleViewChange(view)}
                    >
                      <div className="dnb-mu-nav-ic"><Icon size={13}/></div>
                      <span className="dnb-mu-nav-txt">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Share */}
                <div className="dnb-mu-share-row">
                  <span className="dnb-mu-sec-lbl">Share</span>
                  <button className="dnb-mu-share-toggle" onClick={() => setMobileShare(v => !v)}>
                    <Share2 size={12}/> {mobileShare ? "Hide" : "Show links"}
                    <ChevronDown size={11} style={{transform:mobileShare?"rotate(180deg)":"rotate(0)",transition:"transform .2s"}}/>
                  </button>
                </div>
                {mobileShare && (
                  <div className="dnb-mu-share-box">
                    <div className="dnb-mu-share-hd">Share your virtual self</div>
                    <div className="dnb-mu-share-bd"><ShareItems/></div>
                  </div>
                )}

                {/* Actions */}
                <div className="dnb-mu-actions">
                  <button className="dnb-mu-action" onClick={onThemeToggle}>
                    {isDarkMode ? <Sun size={14}/> : <Moon size={14}/>}
                    {isDarkMode ? "Light" : "Dark"}
                  </button>
                  <button className="dnb-mu-action dnb-mu-action--danger" onClick={() => signOut({ callbackUrl:"/signin" })}>
                    <LogOut size={14}/> Sign out
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}