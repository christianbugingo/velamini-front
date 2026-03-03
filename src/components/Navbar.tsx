"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  className?: string;
}

function applyTheme(isDark: boolean) {
  try {
    const doc = document.documentElement;
    if (isDark) {
      doc.classList.add("dark");
      doc.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      doc.classList.remove("dark");
      doc.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  } catch (e) {}
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export default function Navbar({ user, isDarkMode, onThemeToggle, className = "" }: NavbarProps) {
  const [localDark, setLocalDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof isDarkMode === "boolean") {
      applyTheme(isDarkMode);
      setLocalDark(isDarkMode);
    } else {
      applyTheme(localDark);
    }
  }, [isDarkMode, localDark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleToggle = () => {
    if (onThemeToggle) { onThemeToggle(); return; }
    setLocalDark((v) => { const next = !v; applyTheme(next); return next; });
  };

  const dark = typeof isDarkMode === "boolean" ? isDarkMode : localDark;

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 w-full z-50 transition-all duration-300 font-sans",
          scrolled || menuOpen
            ? "bg-base-100/95 backdrop-blur-xl shadow-lg shadow-base-content/5 border-b border-base-content/10"
            : "bg-transparent backdrop-blur-md",
          className,
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden ring-1 ring-base-content/10 group-hover:ring-violet-500/50 transition-all duration-300 shadow-sm">
                <Image src="/logo.png" alt="Velamini Logo" fill className="object-contain" />
              </div>
              <span className="text-lg md:text-xl font-extrabold tracking-wider text-base-content group-hover:text-violet-400 transition-colors duration-300">
                VELAMINI
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-content/5 transition-all duration-200"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={handleToggle}
                aria-label="Toggle theme"
                className="p-2 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-content/8 transition-all duration-200"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Login CTA */}
              <Link
                href="/auth/signin"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                Login
              </Link>

              {/* Hamburger (mobile) */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="md:hidden p-2 rounded-lg text-base-content/70 hover:text-base-content hover:bg-base-content/8 transition-all duration-200"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={[
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="bg-base-100/98 backdrop-blur-xl border-t border-base-content/10 px-4 py-4 space-y-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-base-content/80 hover:text-base-content hover:bg-violet-500/8 transition-all duration-200"
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-base-content/10">
              <Link
                href="/auth/signin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-md shadow-violet-500/20 transition-all duration-300"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* overlay to close mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/20 backdrop-blur-[2px]"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
