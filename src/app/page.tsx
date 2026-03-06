"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Brain, Share2, Sparkles, MessageSquare, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-600/20 to-purple-600/10 blur-[120px] animate-pulse-slow" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-400/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-[80px]" />
    </div>
  );
}

const features = [
  {
    icon: Brain,
    title: "AI-Powered Clone",
    desc: "Train an AI on your knowledge, personality and communication style so it genuinely sounds like you.",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
  {
    icon: MessageSquare,
    title: "24/7 Conversations",
    desc: "Your virtual self answers questions, handles requests and chats with people even while you sleep.",
    gradient: "from-cyan-500 to-teal-500",
    glow: "shadow-cyan-500/20",
  },
  {
    icon: Share2,
    title: "Share Your Link",
    desc: "Get a unique link and share it anywhere — social profiles, email signatures, business cards.",
    gradient: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    desc: "You control what the AI knows and says. Your data is encrypted and never shared with third parties.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: Zap,
    title: "Instant Training",
    desc: "Go live in minutes. Just fill in your profile and Q&A pairs — no technical skills needed.",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/20",
  },
  {
    icon: Sparkles,
    title: "Always Improving",
    desc: "The more you train, the smarter your AI becomes. Continuous improvements powered by feedback.",
    gradient: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/20",
  },
];

const steps = [
  { num: "01", title: "Create Your Profile", desc: "Add your bio, expertise, skills and personality traits to get started." },
  { num: "02", title: "Train Your AI", desc: "Add Q&A pairs, upload documents and teach your AI how you communicate." },
  { num: "03", title: "Share Your Link", desc: "Copy your unique Velamini link and share it anywhere for people to talk to your AI." },
];

const stats = [
  { value: "10k+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "5min", label: "Setup Time" },
  { value: "24/7", label: "AI Availability" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      delay: i * 0.1, 
      ease: [0.25, 0.1, 0.25, 1] as const
    } 
  }),
};

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const useDark = theme === "dark" || (!theme && prefersDark);
    if (useDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      setIsDarkMode(false);
    }
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full bg-base-100 font-sans text-base-content overflow-x-hidden">
      <Navbar isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-screen w-full flex items-center pt-20">
        <FloatingOrbs />
        {/* grid overlay */}
        <div className="absolute inset-0 landing-grid opacity-40 pointer-events-none" aria-hidden />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                Now in Beta
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight"
              >
                Your AI
                <span className="block bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Digital Twin
                </span>
                is waiting.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-lg sm:text-xl text-base-content/70 max-w-xl mx-auto lg:mx-0"
              >
                Create a virtual version of yourself with Velamini. Train it on your knowledge, personality and
                expertise — then let it represent you 24/7.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link
                  href="/auth/signin"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-base shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-base-content/20 hover:border-base-content/40 text-base-content/80 hover:text-base-content font-semibold text-base transition-all duration-300 bg-base-100/50 backdrop-blur-sm hover:-translate-y-0.5"
                >
                  See How It Works
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 flex items-center gap-6 text-sm text-base-content/50 justify-center lg:justify-start"
              >
                {["Free to start", "No credit card", "Live in 5 min"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-shrink-0 flex items-center justify-center"
            >
              <div className="relative">
                {/* glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 blur-3xl scale-110" />
                <Image
                  src="/velamini.png"
                  alt="Velamini"
                  width={380}
                  height={380}
                  className="relative z-10 animate-float drop-shadow-2xl w-[240px] sm:w-[300px] md:w-[360px] lg:w-[380px]"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section className="relative w-full py-12 border-y border-base-content/10 bg-base-200/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-base-content/60 font-medium uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="relative w-full py-24 px-4 sm:px-6 lg:px-8">
        <FloatingOrbs />
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400 mb-3">Features</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Everything you need to build your{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                digital presence
              </span>
            </h2>
            <p className="mt-4 text-lg text-base-content/60 max-w-2xl mx-auto">
              Velamini gives you all the tools to create, train, and share an AI that truly represents you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`group relative p-6 rounded-2xl border border-base-content/10 bg-base-100/60 backdrop-blur-sm hover:border-base-content/20 hover:shadow-xl hover:${f.glow} transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg mb-4`}>
                  <f.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-base-content/60 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-base-200/40">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400 mb-3">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Live in{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-base-content/20 to-transparent" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-base-content/10 bg-base-100/70 backdrop-blur-sm hover:border-violet-500/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center mb-5">
                  <span className="text-2xl font-black bg-gradient-to-br from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-base-content/60 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-cyan-600/20 pointer-events-none" />
        <div className="absolute inset-0 landing-grid opacity-30 pointer-events-none" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Start building your Digital Twin
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Ready to create
            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              your virtual self?
            </span>
          </h2>
          <p className="mt-6 text-lg text-base-content/60 max-w-xl mx-auto">
            Join thousands of creators, professionals and teams who use Velamini to scale their presence and automate
            interactions.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-base shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="w-full border-t border-base-content/10 bg-base-200/30 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Velamini" width={36} height={36} className="rounded-lg" />
              <span className="font-bold text-lg tracking-wide">VELAMINI</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-base-content/60">
              <Link href="/" className="hover:text-base-content transition-colors">Home</Link>
              <Link href="/auth/signin" className="hover:text-base-content transition-colors">Sign In</Link>
              <Link href="/terms" className="hover:text-base-content transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-base-content transition-colors">Privacy</Link>
            </nav>
            <p className="text-xs text-base-content/40 text-center md:text-right">
              © {new Date().getFullYear()} Velamini. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
