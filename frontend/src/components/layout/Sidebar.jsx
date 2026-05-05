import { Link, useLocation } from "react-router-dom";import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Globe2,
  Users,
  Layers,
  FileText,
  Trophy,
  Bot,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Brain,
  Sparkles,
} from "lucide-react";
import { useSocStore } from "../../store/socStore";
import { useAuth } from "../../auth/AuthProvider";
import { Switch } from "../ui/switch";
import SelfLearningPanel from "./SelfLearningEngine";
import ThemeToggle from "../ThemeToggle";

const NAV = [
  { to: "/", label: "Command Center", icon: Globe2 },
  { to: "/sessions", label: "Intruder Sessions", icon: Users },
  { to: "/deception", label: "Deception Fabric", icon: Layers },
  { to: "/reports", label: "Executive Reports", icon: FileText },
  { to: "/ctf", label: "CTF Mode", icon: Trophy },
];

export default function Sidebar() {
  const loc = useLocation();
  const { connected, ctfMode, setCtfMode, aiOpen, setAiOpen, hybridBrainOpen, setHybridBrainOpen, selfLearningOpen, setSelfLearningOpen, sidebarCollapsed, setSidebarCollapsed } = useSocStore();
  const collapsed = sidebarCollapsed;
  const setCollapsed = setSidebarCollapsed;
  const { user, logout } = useAuth();

  const w = collapsed ? "w-[72px]" : "w-[244px]";

  return (
    <aside
      data-testid="sidebar"
      className={`fixed top-0 left-0 bottom-0 z-40 ${w} transition-[width] duration-300 glass-strong border-r border-white/5 flex flex-col`}
    >
      {/* Brand */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <div className="relative w-9 h-9 grid place-items-center bg-[#39ff14]/10 rounded-sm shrink-0">
          <Activity className="w-4.5 h-4.5 text-[#39ff14]" strokeWidth={2.4} />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#39ff14] rounded-full shadow-[0_0_8px_#39ff14] animate-pulse" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="leading-tight overflow-hidden"
            >
              <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-white whitespace-nowrap">Chameleon</div>
              <div className="label-mono text-[8px] -mt-0.5 text-zinc-500 whitespace-nowrap">Adaptive Honeypot</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-3 mb-2">
        <div className="neon-divider opacity-60" />
      </div>

      {/* Live / Paused Toggle */}
      <div className="px-3 mb-2">
        {connected ? (
          <button
            onClick={() => useSocStore.getState().disconnectWS()}
            title="Pause live feed"
            className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2 px-2"} py-1.5 rounded-sm border border-[#39ff14]/30 bg-black/30 hover:border-[#ff003c]/50 hover:bg-[#ff003c]/5 transition-all group`}
          >
            <span className="relative inline-flex w-2 h-2 shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#39ff14] animate-ping opacity-60" />
              <span className="relative inline-block w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]" />
            </span>
            {!collapsed && (
              <>
                <Wifi className="w-3 h-3 text-[#39ff14] group-hover:hidden" />
                <WifiOff className="w-3 h-3 text-[#ff003c] hidden group-hover:block" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#39ff14] group-hover:hidden">Live</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff003c] hidden group-hover:block">Turn Off</span>
              </>
            )}
          </button>
        ) : useSocStore.getState().livePaused ? (
          <button
            onClick={() => useSocStore.getState().goLive()}
            title="Resume live feed"
            className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2 px-2"} py-1.5 rounded-sm border border-[#39ff14]/50 bg-[#39ff14]/5 hover:bg-[#39ff14]/15 transition-all animate-pulse`}
          >
            <Wifi className="w-3 h-3 text-[#39ff14] shrink-0" />
            {!collapsed && (
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#39ff14]">Go Live</span>
            )}
          </button>
        ) : (
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2 px-2"} py-1.5 rounded-sm border border-white/10 bg-black/30`}>
            <WifiOff className="w-3 h-3 text-[#ff9f1c] shrink-0" />
            {!collapsed && (
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff9f1c]">Reconnecting</span>
            )}
          </div>
        )}
      </div>

      {/* HYBRID BRAIN WIDGET */}
      <div className="px-3 mb-3">
        <button 
          onClick={() => setHybridBrainOpen(true)}
          className={`w-full relative rounded-sm border border-[#39ff14]/20 bg-[#39ff14]/5 overflow-hidden flex items-center group hover:border-[#39ff14]/40 hover:bg-[#39ff14]/10 transition-colors cursor-pointer ${collapsed ? "justify-center p-2" : "p-2.5"}`}
        >
          {collapsed ? (
            <Brain className="w-4 h-4 text-[#39ff14] animate-pulse" />
          ) : (
            <>
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-1.5 h-1.5 bg-[#39ff14] rounded-full shadow-[0_0_5px_#39ff14] animate-pulse" />
                  <div className="text-[#39ff14] font-bold text-[10px] tracking-widest uppercase">HYBRID BRAIN</div>
                </div>
                <div className="text-zinc-400 text-[8px] font-mono uppercase tracking-wide">
                  Rule + AI + Graph Intelligence
                </div>
              </div>
              <Brain className="w-6 h-6 text-[#39ff14]/20 absolute right-[-4px] top-1/2 -translate-y-1/2 group-hover:text-[#39ff14]/40 transition-colors" />
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 flex-1 space-y-0.5">
        {NAV.map((n) => {
          const active = n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setSelfLearningOpen(false)}
              data-testid={`nav-${n.to.replace(/\//g, "") || "home"}`}
              title={n.label}
              className={`relative group flex items-center ${collapsed ? "justify-center px-2" : "px-3"} py-2.5 rounded-sm transition-colors ${
                active
                  ? "bg-[#39ff14]/10 text-[#39ff14]"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#39ff14]"
                  style={{ boxShadow: "0 0 10px #39ff14" }}
                />
              )}
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              {!collapsed && (
                <span className="ml-3 text-[12px] uppercase tracking-[0.15em] font-mono whitespace-nowrap">
                  {n.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Analyst + CTF + Profile */}
      <div className="px-3 pb-3 space-y-2">
        {/* AI Analyst */}
        <button
          onClick={() => setAiOpen(!aiOpen)}
          data-testid="ai-assistant-button"
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2"} btn-neon`}
        >
          <Bot className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>AI Analyst</span>}
        </button>

        {/* CTF Mode */}
        {!collapsed && (
          <div className="flex items-center justify-between px-2 py-1.5 rounded-sm border border-white/5" data-testid="ctf-toggle">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#ff9f1c]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">CTF Mode</span>
            </div>
            <Switch
              checked={ctfMode}
              onCheckedChange={setCtfMode}
              data-testid="ctf-switch"
              className="data-[state=checked]:bg-[#ff9f1c]"
            />
          </div>
        )}

        {/* Theme Toggle */}
        {!collapsed && (
          <div className="flex items-center justify-between px-2 py-1.5 rounded-sm border border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">Theme</span>
            <ThemeToggle />
          </div>
        )}

        {/* Self-Learning Engine — between CTF and User Profile */}
        <button
          onClick={() => setSelfLearningOpen(true)}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-2"} py-2 px-3 rounded-sm border border-[#00f0ff]/30 bg-[#00f0ff]/5 hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/50 transition-all`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00f0ff] shrink-0 animate-pulse" />
          {!collapsed && <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#00f0ff]">Self-Learning</span>}
        </button>


        {user && (
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-2 py-2 rounded-sm border border-white/5 bg-black/30`}>
            {user.picture ? (
              <img src={user.picture} alt="" className="w-7 h-7 rounded-full border border-[#39ff14]/30" />
            ) : (
              <div className="w-7 h-7 rounded-full grid place-items-center bg-[#39ff14]/15 text-[#39ff14] font-mono text-xs font-bold">
                {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="text-[11px] text-white font-mono truncate">{user.name || user.email}</div>
                  <div className="text-[9px] text-zinc-500 truncate">{user.email}</div>
                </div>
                <button onClick={logout} title="Sign out" data-testid="logout-btn" className="p-1 text-zinc-500 hover:text-[#ff003c] transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          data-testid="sidebar-toggle"
          className="w-full flex items-center justify-center py-1.5 rounded-sm border border-white/10 hover:border-[#39ff14]/40 text-zinc-500 hover:text-[#39ff14] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
}
