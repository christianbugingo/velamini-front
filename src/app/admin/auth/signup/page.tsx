"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShieldCheck, Eye, EyeOff, Lock, Mail, User,
  KeyRound, AlertCircle, CheckCircle2, Moon, Sun
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ── Animated background ── */
function Background() {
  return (
    <div className="as-bg">
      <motion.div className="as-orb as-orb-1"
        animate={{ scale:[1,1.18,1], opacity:[0.45,0.7,0.45], x:[0,22,0], y:[0,-18,0] }}
        transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }} />
      <motion.div className="as-orb as-orb-2"
        animate={{ scale:[1,1.22,1], opacity:[0.3,0.55,0.3], x:[0,-16,0], y:[0,26,0] }}
        transition={{ duration:13, repeat:Infinity, ease:"easeInOut", delay:1.5 }} />
      <div className="as-grid" />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div key={i} className="as-particle"
          style={{ left:`${10 + i * 11}%`, bottom:`${8 + (i % 3) * 14}%` }}
          animate={{ y:[0,-(50+i*9)], opacity:[0,0.65,0], scale:[0.6,1,0.6] }}
          transition={{ duration:3.5+i*0.4, repeat:Infinity, delay:i*0.7, ease:"easeOut" }} />
      ))}
    </div>
  );
}

/* ── Password strength ── */
function strengthOf(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: "Weak",   color: "var(--c-danger)"  };
  if (s <= 3) return { score: s, label: "Fair",   color: "var(--c-warn)"    };
  return           { score: s, label: "Strong", color: "var(--c-success)"  };
}

export default function AdminSignupPage() {
  const router = useRouter();

  const [form, setForm]             = useState({ name:"", email:"", password:"", confirmPassword:"", inviteSecret:"" });
  const [showPassword,  setSP]      = useState(false);
  const [showConfirm,   setSC]      = useState(false);
  const [error,         setError]   = useState("");
  const [success,       setSuccess] = useState(false);
  const [loading,       setLoading] = useState(false);
  const [isDark,        setIsDark]  = useState(true);
  const [mounted,       setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") || "dark";
      const dark   = stored === "dark";
      setIsDark(dark);
      document.documentElement.setAttribute("data-mode", dark ? "dark" : "light");
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-mode", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const strength = strengthOf(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 8)               { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    const res  = await fetch("/api/admin/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), password: form.password, inviteSecret: form.inviteSecret.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }
    setSuccess(true);
    // Redirect immediately to login — no auto sign-in attempt
    router.push("/admin/auth/login?signup=success");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root,[data-mode="light"]{
          --c-bg:          #EFF7FF;
          --c-surface:     #FFFFFF;
          --c-surface-2:   #E2F0FC;
          --c-border:      #C5DCF2;
          --c-text:        #0B1E2E;
          --c-muted:       #6B90AE;
          --c-accent:      #29A9D4;
          --c-accent-dim:  #1D8BB2;
          --c-accent-soft: #DDF1FA;
          --c-danger:      #EF4444;
          --c-danger-soft: #FEE2E2;
          --c-warn:        #F59E0B;
          --c-success:     #10B981;
          --c-success-soft:#ECFDF5;
          --c-orb1:        rgba(41,169,212,.22);
          --c-orb2:        rgba(125,211,252,.16);
          --c-grid:        rgba(41,169,212,.06);
          --c-particle:    #29A9D4;
          --shadow-lg:     0 24px 64px rgba(10,40,80,.16);
        }
        [data-mode="dark"]{
          --c-bg:          #081420;
          --c-surface:     #0F1E2D;
          --c-surface-2:   #162435;
          --c-border:      #1A3045;
          --c-text:        #C8E8F8;
          --c-muted:       #3D6580;
          --c-accent:      #38AECC;
          --c-accent-dim:  #2690AB;
          --c-accent-soft: #0C2535;
          --c-danger:      #F87171;
          --c-danger-soft: #3B1212;
          --c-warn:        #FCD34D;
          --c-success:     #34D399;
          --c-success-soft:#063320;
          --c-orb1:        rgba(56,174,204,.18);
          --c-orb2:        rgba(41,169,212,.11);
          --c-grid:        rgba(56,174,204,.05);
          --c-particle:    #38AECC;
          --shadow-lg:     0 24px 64px rgba(0,0,0,.55);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{font-family:'DM Sans',system-ui,sans-serif;background:var(--c-bg);color:var(--c-text);transition:background .3s,color .3s}

        /* ── Page ── */
        .as-page{min-height:100dvh;position:relative;overflow:hidden;display:flex;flex-direction:column;background:var(--c-bg);transition:background .3s}

        /* ── Background ── */
        .as-bg{position:fixed;inset:0;pointer-events:none;z-index:0}
        .as-orb{position:absolute;border-radius:50%;filter:blur(80px)}
        .as-orb-1{width:500px;height:500px;background:radial-gradient(circle,var(--c-orb1),transparent 70%);top:-120px;left:-80px}
        .as-orb-2{width:560px;height:560px;background:radial-gradient(circle,var(--c-orb2),transparent 70%);bottom:-100px;right:-100px}
        .as-grid{
          position:absolute;inset:0;
          background-image:linear-gradient(var(--c-grid) 1px,transparent 1px),linear-gradient(90deg,var(--c-grid) 1px,transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 80% 70% at 50% 50%,black 40%,transparent 100%);
        }
        .as-particle{position:absolute;width:5px;height:5px;border-radius:50%;background:var(--c-particle);box-shadow:0 0 6px var(--c-particle)}

        /* ── Navbar ── */
        .as-nav{
          position:relative;z-index:10;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 20px;height:56px;
          background:color-mix(in srgb,var(--c-surface) 80%,transparent);
          border-bottom:1px solid var(--c-border);
          backdrop-filter:blur(12px);
          transition:background .3s,border-color .3s;
          flex-shrink:0;
        }
        .as-nav-brand{display:flex;align-items:center;gap:9px;text-decoration:none}
        .as-nav-logo{width:30px;height:30px;border-radius:8px;overflow:hidden;border:1.5px solid var(--c-border);background:var(--c-accent-soft);flex-shrink:0}
        .as-nav-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .as-nav-name{font-family:'DM Serif Display',serif;font-size:.9rem;font-weight:600;color:var(--c-text)}
        .as-nav-chip{font-size:.56rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--c-danger);padding:2px 7px;border-radius:20px}
        .as-theme-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;border:1px solid var(--c-border);background:var(--c-surface-2);color:var(--c-muted);cursor:pointer;transition:all .14s}
        .as-theme-btn:hover{color:var(--c-accent);border-color:var(--c-accent);background:var(--c-accent-soft)}
        .as-theme-btn svg{width:14px;height:14px}

        /* ── Main ── */
        .as-main{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:28px 16px 40px;position:relative;z-index:1;overflow-y:auto}

        /* ── Card ── */
        .as-card{
          width:100%;max-width:420px;
          background:color-mix(in srgb,var(--c-surface) 92%,transparent);
          border:1px solid var(--c-border);border-radius:22px;
          padding:32px 30px 26px;
          box-shadow:var(--shadow-lg);
          backdrop-filter:blur(20px);
          position:relative;overflow:hidden;
        }
        .as-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,var(--c-danger),#F87171 40%,var(--c-accent) 100%);
          background-size:200% 100%;animation:asshimmer 3.5s linear infinite;
        }
        @keyframes asshimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

        /* ── Card header ── */
        .as-card-head{text-align:center;margin-bottom:22px}
        .as-shield{
          width:52px;height:52px;border-radius:15px;
          background:color-mix(in srgb,var(--c-danger) 12%,transparent);
          border:1.5px solid color-mix(in srgb,var(--c-danger) 30%,transparent);
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 13px;
          box-shadow:0 4px 14px color-mix(in srgb,var(--c-danger) 16%,transparent);
        }
        .as-shield svg{width:22px;height:22px;color:var(--c-danger)}
        .as-card-title{font-family:'DM Serif Display',Georgia,serif;font-size:1.5rem;font-weight:400;letter-spacing:-.02em;color:var(--c-text);margin-bottom:5px}
        .as-card-sub{font-size:.76rem;color:var(--c-muted);line-height:1.5}

        /* ── Restricted notice ── */
        .as-notice{
          display:flex;align-items:center;gap:8px;
          padding:9px 13px;border-radius:10px;
          background:color-mix(in srgb,var(--c-danger) 8%,transparent);
          border:1px solid color-mix(in srgb,var(--c-danger) 18%,transparent);
          font-size:.72rem;color:var(--c-muted);margin-bottom:20px;
        }
        .as-notice svg{width:12px;height:12px;color:var(--c-danger);flex-shrink:0}

        /* ── Form ── */
        .as-form{display:flex;flex-direction:column;gap:14px}
        .as-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:480px){.as-row2{grid-template-columns:1fr}}

        .as-field label{display:block;font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);margin-bottom:6px}
        .as-input-wrap{position:relative}
        .as-input-ic{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--c-muted);pointer-events:none;width:14px;height:14px}
        .as-input{
          width:100%;padding:10px 12px 10px 34px;
          border-radius:11px;border:1.5px solid var(--c-border);
          background:var(--c-surface-2);color:var(--c-text);
          font-size:.84rem;font-family:inherit;outline:none;
          transition:border-color .15s,background .15s;
        }
        .as-input:focus{border-color:var(--c-accent);background:var(--c-surface)}
        .as-input::placeholder{color:var(--c-muted);opacity:.7}
        .as-input--pr{padding-right:38px}

        /* password match indicator */
        .as-input--match{border-color:var(--c-success)!important}
        .as-input--mismatch{border-color:var(--c-danger)!important}

        .as-eye{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--c-muted);display:flex;align-items:center;justify-content:center;transition:color .14s;padding:2px}
        .as-eye:hover{color:var(--c-accent)}
        .as-eye svg{width:14px;height:14px}

        /* ── Password strength bar ── */
        .as-strength{margin-top:6px;display:flex;align-items:center;gap:8px}
        .as-strength-bars{display:flex;gap:3px;flex:1}
        .as-strength-bar{height:3px;flex:1;border-radius:2px;background:var(--c-border);transition:background .25s}
        .as-strength-label{font-size:.66rem;font-weight:700;color:var(--c-muted);flex-shrink:0;transition:color .25s;width:40px;text-align:right}

        /* ── Error ── */
        .as-error{display:flex;align-items:center;gap:8px;padding:10px 13px;border-radius:10px;background:var(--c-danger-soft);border:1px solid color-mix(in srgb,var(--c-danger) 28%,transparent);color:var(--c-danger);font-size:.78rem;font-weight:500}
        .as-error svg{width:13px;height:13px;flex-shrink:0}

        /* ── Submit ── */
        .as-submit{
          display:flex;align-items:center;justify-content:center;gap:8px;
          width:100%;padding:12px 20px;border-radius:12px;
          background:var(--c-accent);color:#fff;
          border:none;font-size:.88rem;font-weight:700;
          font-family:inherit;cursor:pointer;transition:all .16s;
          min-height:46px;margin-top:2px;
        }
        .as-submit:hover:not(:disabled){background:var(--c-accent-dim);transform:translateY(-1px);box-shadow:0 6px 20px color-mix(in srgb,var(--c-accent) 35%,transparent)}
        .as-submit:active:not(:disabled){transform:translateY(0) scale(.98)}
        .as-submit:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .as-submit svg{width:15px;height:15px}
        .as-spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:asspin .75s linear infinite;flex-shrink:0}
        @keyframes asspin{to{transform:rotate(360deg)}}

        /* ── Success state ── */
        .as-success{display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px 0 8px;text-align:center}
        .as-success-ic{width:56px;height:56px;border-radius:16px;background:var(--c-success-soft);border:1.5px solid color-mix(in srgb,var(--c-success) 30%,transparent);display:flex;align-items:center;justify-content:center}
        .as-success-ic svg{width:24px;height:24px;color:var(--c-success)}
        .as-success-title{font-family:'DM Serif Display',serif;font-size:1.3rem;font-weight:400;color:var(--c-text)}
        .as-success-sub{font-size:.78rem;color:var(--c-muted)}
        .as-progress{width:100%;height:3px;background:var(--c-border);border-radius:2px;overflow:hidden;margin-top:4px}
        .as-progress-bar{height:100%;background:var(--c-success);animation:asprog 2.8s linear forwards}
        @keyframes asprog{from{width:0}to{width:100%}}

        /* ── Divider ── */
        .as-divider{display:flex;align-items:center;gap:10px;margin:4px 0}
        .as-divider-line{flex:1;height:1px;background:var(--c-border)}
        .as-divider-text{font-size:.68rem;color:var(--c-muted)}

        /* ── Note ── */
        .as-note{text-align:center;font-size:.72rem;color:var(--c-muted);margin-top:14px;line-height:1.6}
        .as-note a{color:var(--c-accent);text-decoration:none;transition:opacity .14s}
        .as-note a:hover{opacity:.75;text-decoration:underline}

        /* ── Footer ── */
        .as-foot{position:relative;z-index:1;text-align:center;padding:12px 20px 20px;font-size:.7rem;color:var(--c-muted);flex-shrink:0}
        .as-foot a{color:var(--c-muted);text-decoration:none;transition:color .14s}
        .as-foot a:hover{color:var(--c-accent)}
      `}</style>

      <div className="as-page">
        <Background />

        {/* Navbar */}
        <nav className="as-nav">
          <Link href="/" className="as-nav-brand">
            <div className="as-nav-logo"><img src="/logo.png" alt="Velamini" /></div>
            <span className="as-nav-name">Velamini</span>
            <span className="as-nav-chip">Admin</span>
          </Link>
          {mounted && (
            <button className="as-theme-btn" onClick={toggleTheme} title="Toggle theme">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
        </nav>

        {/* Main */}
        <main className="as-main">
          <motion.div style={{ width:"100%", maxWidth:420 }}
            initial={{ opacity:0, y:22, scale:.97 }}
            animate={{ opacity:1, y:0, scale:1 }}
            transition={{ type:"spring", stiffness:260, damping:24 }}>

            <div className="as-card">
              {/* Header */}
              <div className="as-card-head">
                <div className="as-shield"><ShieldCheck size={22} /></div>
                <h1 className="as-card-title">Create Admin Account</h1>
                <p className="as-card-sub">Invite code required — authorised personnel only.</p>
              </div>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div key="success" className="as-success"
                    initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}
                    transition={{ type:"spring", stiffness:260, damping:22 }}>
                    <div className="as-success-ic"><CheckCircle2 size={24} /></div>
                    <div>
                      <div className="as-success-title">Account created!</div>
                      <div className="as-success-sub">Redirecting to login…</div>
                    </div>
                    <div className="as-progress"><div className="as-progress-bar" /></div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }}>
                    {/* Restricted notice */}
                    <div className="as-notice">
                      <AlertCircle size={12} />
                      All account creation attempts are logged and audited.
                    </div>

                    <form className="as-form" onSubmit={handleSubmit}>
                      {/* Name + Email */}
                      <div className="as-row2">
                        <div className="as-field">
                          <label htmlFor="as-name">Full Name</label>
                          <div className="as-input-wrap">
                            <User className="as-input-ic" />
                            <input id="as-name" className="as-input" type="text"
                              placeholder="Jane Admin" value={form.name}
                              onChange={set("name")} required />
                          </div>
                        </div>
                        <div className="as-field">
                          <label htmlFor="as-email">Email</label>
                          <div className="as-input-wrap">
                            <Mail className="as-input-ic" />
                            <input id="as-email" className="as-input" type="email"
                              placeholder="admin@velamini.com" value={form.email}
                              onChange={set("email")} required autoComplete="email" />
                          </div>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="as-field">
                        <label htmlFor="as-pass">Password</label>
                        <div className="as-input-wrap">
                          <Lock className="as-input-ic" />
                          <input id="as-pass" className="as-input as-input--pr"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min 8 characters" value={form.password}
                            onChange={set("password")} required autoComplete="new-password" />
                          <button type="button" className="as-eye" onClick={() => setSP(v => !v)}>
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {/* Strength bar */}
                        {form.password && (
                          <div className="as-strength">
                            <div className="as-strength-bars">
                              {[1,2,3,4,5].map(n => (
                                <div key={n} className="as-strength-bar"
                                  style={{ background: n <= strength.score ? strength.color : undefined }} />
                              ))}
                            </div>
                            <span className="as-strength-label" style={{ color: strength.color }}>
                              {strength.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Confirm password */}
                      <div className="as-field">
                        <label htmlFor="as-confirm">Confirm Password</label>
                        <div className="as-input-wrap">
                          <Lock className="as-input-ic" />
                          <input id="as-confirm"
                            className={`as-input as-input--pr ${
                              form.confirmPassword
                                ? form.confirmPassword === form.password ? "as-input--match" : "as-input--mismatch"
                                : ""
                            }`}
                            type={showConfirm ? "text" : "password"}
                            placeholder="Re-enter password" value={form.confirmPassword}
                            onChange={set("confirmPassword")} required autoComplete="new-password" />
                          <button type="button" className="as-eye" onClick={() => setSC(v => !v)}>
                            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Invite code */}
                      <div className="as-field">
                        <label htmlFor="as-invite">Invite Code</label>
                        <div className="as-input-wrap">
                          <KeyRound className="as-input-ic" />
                          <input id="as-invite" className="as-input" type="password"
                            placeholder="Provided by platform owner"
                            value={form.inviteSecret} onChange={set("inviteSecret")} required />
                        </div>
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {error && (
                          <motion.div className="as-error"
                            initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                            <AlertCircle size={13} /> {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Submit */}
                      <button type="submit" className="as-submit" disabled={loading}>
                        {loading
                          ? <><div className="as-spinner" /> Creating account…</>
                          : <><ShieldCheck size={15} /> Create Admin Account</>
                        }
                      </button>
                    </form>

                    <div className="as-divider" style={{ marginTop:16 }}>
                      <div className="as-divider-line" />
                      <span className="as-divider-text">or</span>
                      <div className="as-divider-line" />
                    </div>

                    <p className="as-note">
                      Already have an account?{" "}
                      <Link href="/admin/auth/login">Sign in</Link>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        <footer className="as-foot">
          © {new Date().getFullYear()} Velamini &nbsp;·&nbsp;{" "}
          <Link href="/terms">Terms</Link>&nbsp;·&nbsp;
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </>
  );
}
