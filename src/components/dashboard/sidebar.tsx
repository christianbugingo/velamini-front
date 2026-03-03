"use client";

import { useState } from "react";
import {
  LayoutGrid,
  GraduationCap,
  MessageSquare,
  UserRound,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  FileText,
} from "lucide-react";

type DashboardViewType = "dashboard" | "training" | "chat" | "profile" | "settings" | "resume";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  activeView?: DashboardViewType;
  onViewChange?: (view: DashboardViewType) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

export default function Sidebar({
  activeView = "dashboard",
  onViewChange,
  isDarkMode = false,
  onThemeToggle,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: LayoutGrid, view: "dashboard" as DashboardViewType },
    { label: "Training", icon: GraduationCap, view: "training" as DashboardViewType },
    { label: "Chat", icon: MessageSquare, view: "chat" as DashboardViewType },
    { label: "Profile", icon: UserRound, view: "profile" as DashboardViewType },
    { label: "Resume", icon: FileText, view: "resume" as DashboardViewType },
    { label: "Settings", icon: Settings, view: "settings" as DashboardViewType },
  ];

  return (
    <aside
      className={`h-screen flex-shrink-0 flex-col bg-base-100 border-r border-base-content/10 transition-all duration-300 hidden lg:flex ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-base-content/10 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <p className="font-bold text-base-content">Velamini</p>
              <p className="text-xs text-base-content/60">Dashboard</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-content/10 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, view }) => (
          <button
            key={view}
            onClick={() => onViewChange?.(view)}
            className={`flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl transition-all duration-200 ${
              activeView === view
                ? "bg-violet-600 text-white shadow-lg"
                : "text-base-content/80 hover:bg-violet-500/10 hover:text-base-content"
            }`}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-base-content/10">
        <button
          onClick={onThemeToggle}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl text-base-content/80 hover:bg-base-content/10 transition-colors"
          title={collapsed ? (isDarkMode ? "Dark mode" : "Light mode") : undefined}
        >
          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          {!collapsed && <span className="font-medium">{isDarkMode ? "Dark Mode" : "Light Mode"}</span>}
        </button>
      </div>
    </aside>
  );
}
