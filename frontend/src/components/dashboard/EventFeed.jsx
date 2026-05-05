import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocStore } from "../../store/socStore";

const SEV_CONFIG = {
  crit: { color: "#ff003c", label: "CRIT", bg: "rgba(255,0,60,0.07)", border: "rgba(255,0,60,0.25)" },
  warn: { color: "#ff9f1c", label: "WARN", bg: "rgba(255,159,28,0.06)", border: "rgba(255,159,28,0.2)" },
  info: { color: "#39ff14", label: "INFO", bg: "transparent",           border: "transparent" },
};

function EventRow({ e }) {
  const cfg = SEV_CONFIG[e.severity] || SEV_CONFIG.info;
  const time = new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-start gap-3 px-3 py-1.5 rounded-sm transition-colors hover:bg-white/3"
      style={{ background: cfg.bg, borderLeft: `2px solid ${cfg.border}` }}
    >
      {/* Severity badge */}
      <span
        className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm shrink-0 mt-0.5"
        style={{ color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}40` }}
      >
        {cfg.label}
      </span>
      {/* Timestamp */}
      <span className="text-[10px] font-mono text-zinc-600 shrink-0 mt-0.5">{time}</span>
      {/* Message */}
      <span
        className="font-mono text-[11px] leading-snug flex-1"
        style={{ color: cfg.color }}
      >
        {e.message}
      </span>
    </motion.div>
  );
}

export default function EventFeed() {
  const { events } = useSocStore();
  const ref = useRef(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [events.length]);

  const filtered = events
    .filter(e => filter === "all" || e.severity === filter)
    .slice(0, 80);

  const critCount = events.filter(e => e.severity === "crit").length;
  const warnCount = events.filter(e => e.severity === "warn").length;

  return (
    <div className="glass scanlines rounded-md h-full flex flex-col overflow-hidden" data-testid="event-feed">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-[#39ff14] animate-ping opacity-50" />
            <span className="relative w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]" />
          </span>
          <span className="label-mono">Live Event Feed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-zinc-500">{events.length} events</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm border border-[#ff003c]/30 text-[#ff003c]">{critCount} crit</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm border border-[#ff9f1c]/30 text-[#ff9f1c]">{warnCount} warn</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0 px-4 py-2 border-b border-white/5 shrink-0">
        {["all", "crit", "warn", "info"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors rounded-sm mr-1 ${
              filter === f
                ? f === "crit" ? "bg-[#ff003c]/15 text-[#ff003c] border border-[#ff003c]/30"
                : f === "warn" ? "bg-[#ff9f1c]/15 text-[#ff9f1c] border border-[#ff9f1c]/30"
                : "bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/30"
                : "text-zinc-500 hover:text-white border border-transparent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div ref={ref} className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 terminal">
        <AnimatePresence initial={false}>
          {filtered.map(e => <EventRow key={e.id} e={e} />)}
        </AnimatePresence>
        {events.length === 0 && (
          <div className="px-3 py-2 text-zinc-600 font-mono text-[11px]">awaiting telemetry<span className="cursor-blink" /></div>
        )}
        {filtered.length === 0 && events.length > 0 && (
          <div className="px-3 py-2 text-zinc-600 font-mono text-[11px]">no {filter} events recorded yet</div>
        )}
      </div>
    </div>
  );
}
