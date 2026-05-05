import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Globe2, Users, Layers, FileText, Trophy, Bot, Wifi, WifiOff } from "lucide-react";
import { useSocStore } from "../../store/socStore";
import { Switch } from "../ui/switch";

const NAV = [
  { to: "/", label: "Command Center", icon: Globe2 },
  { to: "/sessions", label: "Intruder Sessions", icon: Users },
  { to: "/deception", label: "Deception Fabric", icon: Layers },
  { to: "/reports", label: "Executive Reports", icon: FileText },
  { to: "/ctf", label: "CTF Mode", icon: Trophy },
];

export default function TopNav() {
  const loc = useLocation();
  const { connected, ctfMode, setCtfMode, aiOpen, setAiOpen } = useSocStore();

  return (
    <header
      data-testid="top-nav"
      className="sticky top-0 z-40 glass-strong border-b border-white/5"
    >
      <div className="flex items-center gap-6 px-5 h-14">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="brand-link">
          <div className="relative w-7 h-7 grid place-items-center">
            <div className="absolute inset-0 rounded-sm bg-[#39ff14]/15 group-hover:bg-[#39ff14]/25 transition-colors" />
            <Activity className="w-4 h-4 text-[#39ff14] relative" strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-bold tracking-[0.15em] uppercase text-white">
              Chameleon
            </div>
            <div className="label-mono text-[8px] -mt-0.5 text-zinc-500">
              Adaptive Honeypot · v1.0
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV.map((n) => {
            const active = loc.pathname === n.to || (n.to !== "/" && loc.pathname.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                data-testid={`nav-${n.to.replace(/\//g, "") || "home"}`}
                className={`relative px-3 py-1.5 text-xs uppercase tracking-[0.18em] font-mono transition-colors ${
                  active ? "text-[#39ff14]" : "text-zinc-400 hover:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  {n.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-2 right-2 -bottom-[1px] h-[2px] bg-[#39ff14]"
                    style={{ boxShadow: "0 0 10px #39ff14" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-sm border border-white/10 bg-black/30">
            {connected ? (
              <>
                <span className="relative inline-flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-[#39ff14] animate-ping opacity-60" />
                  <span className="relative inline-block w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]" />
                </span>
                <Wifi className="w-3 h-3 text-[#39ff14]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#39ff14]">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-[#ff9f1c]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff9f1c]">Reconnecting</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2" data-testid="ctf-toggle">
            <Trophy className="w-3.5 h-3.5 text-[#ff9f1c]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">CTF</span>
            <Switch
              checked={ctfMode}
              onCheckedChange={setCtfMode}
              data-testid="ctf-switch"
              className="data-[state=checked]:bg-[#ff9f1c]"
            />
          </div>

          <button
            onClick={() => setAiOpen(!aiOpen)}
            data-testid="ai-assistant-button"
            className="btn-neon flex items-center gap-2"
          >
            <Bot className="w-3.5 h-3.5" />
            AI Analyst
          </button>
        </div>
      </div>
    </header>
  );
}
