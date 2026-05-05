import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull, Activity, AlertTriangle, Dna, Globe2, Map, Hexagon, X, ChevronRight } from "lucide-react";
import WorldMap from "../components/dashboard/WorldMap";
import Globe3D from "../components/dashboard/Globe3D";
import EventFeed from "../components/dashboard/EventFeed";
import MitreHeatmap from "../components/dashboard/MitreHeatmap";
import AttackerPanel from "../components/dashboard/AttackerPanel";
import { NumberTicker } from "../components/common/NumberTicker";
import { useSocStore } from "../store/socStore";

const MITRE_FULL = {
  T1110: { tactic: "Credential Access", desc: "Adversaries are brute-forcing SSH and web login panels across multiple honeypots." },
  T1059: { tactic: "Execution",          desc: "Malicious shell commands detected: reverse shells, miners, and dropper scripts." },
  T1046: { tactic: "Discovery",          desc: "Network service scanning observed — attackers mapping exposed services." },
  T1078: { tactic: "Persistence",        desc: "Attackers attempting to use valid/default credentials to maintain foothold." },
  T1505: { tactic: "Persistence",        desc: "Web shells and server-side backdoors deployed on HTTP honeypots." },
  T1190: { tactic: "Initial Access",     desc: "Exploitation of public-facing fake services and simulated CVEs." },
  T1003: { tactic: "Credential Access",  desc: "Credential dumping via /etc/shadow reads and memory scraping commands." },
  T1486: { tactic: "Impact",             desc: "Ransomware-style encryption attempts detected on SMB decoy shares." },
};

function StatDetailModal({ stat, sessions, events, onClose }) {
  if (!stat) return null;
  const active = sessions.filter(s => s.status === "active");
  const critical = sessions.filter(s => s.risk_score >= 80);

  const details = {
    intruders: {
      title: "Active Intruders — Deep Dive",
      rows: active.slice(0, 10).map(s => ({
        label: s.ip,
        sub: `${s.flag} ${s.country_name} → ${s.honeypot_name}`,
        value: `Risk ${s.risk_score}`,
        color: s.risk_score >= 80 ? "#ff003c" : s.risk_score >= 60 ? "#ff9f1c" : "#39ff14",
        tag: s.stage,
      })),
      empty: "No active intruders right now.",
    },
    sessions: {
      title: "Total Session History",
      rows: sessions.slice(0, 10).map(s => ({
        label: s.ip,
        sub: `${s.flag} ${s.country_name} → ${s.honeypot_name}`,
        value: s.status === "active" ? "ACTIVE" : "closed",
        color: s.status === "active" ? "#39ff14" : "#52525b",
        tag: s.stage,
      })),
      empty: "No sessions recorded yet.",
    },
    alerts: {
      title: "Critical Alerts — Risk ≥ 80",
      rows: critical.slice(0, 10).map(s => ({
        label: s.ip,
        sub: `${s.flag} ${s.country_name} → ${s.honeypot_name}`,
        value: `Risk ${s.risk_score}`,
        color: "#ff003c",
        tag: s.stage,
      })),
      empty: "No critical alerts at this time.",
    },
    mutation: {
      title: "Recent Mutation Events",
      rows: events.filter(e => e.severity === "warn" || e.severity === "crit").slice(0, 10).map(e => ({
        label: e.message,
        sub: new Date(e.ts).toLocaleString(),
        value: e.severity.toUpperCase(),
        color: e.severity === "crit" ? "#ff003c" : "#ff9f1c",
        tag: null,
      })),
      empty: "No mutation events yet.",
    },
  };

  const d = details[stat];
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-md overflow-hidden"
        style={{ background: "rgba(4,8,16,0.97)", border: "1px solid rgba(57,255,20,0.2)" }}
      >
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="text-white font-bold text-sm uppercase tracking-widest">{d.title}</div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {d.rows.length === 0 && <div className="text-zinc-500 font-mono text-sm">{d.empty}</div>}
          {d.rows.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-sm border border-white/5"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[12px] text-white truncate">{r.label}</div>
                <div className="font-mono text-[10px] text-zinc-500 truncate">{r.sub}</div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="font-bold text-[12px]" style={{ color: r.color }}>{r.value}</span>
                {r.tag && (
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm border border-white/10 text-zinc-500 uppercase">
                    {r.tag}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, hint, statKey, onViewMore }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative px-5 py-3.5 rounded-md flex items-center gap-4 group transition-colors overflow-hidden cursor-default"
      style={{
        background: "rgba(4,8,16,0.85)",
        border: `1px solid ${color}33`,
        boxShadow: `inset 0 0 20px ${color}0a, 0 4px 20px rgba(0,0,0,0.5)`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Animated Background Sweep */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: Math.random() }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}1a, transparent)`,
          transform: "skewX(-20deg)",
        }}
      />
      
      {/* Scanline texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
           style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px)" }} />

      <div
        className="w-10 h-10 grid place-items-center rounded-sm relative shrink-0 z-10"
        style={{ background: `${color}15`, border: `1px solid ${color}40` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
        {/* Pulsing glow ring around icon */}
        <motion.span
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 rounded-sm"
          style={{ boxShadow: `0 0 15px ${color}` }}
        />
        <span
          className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 0 25px ${color}` }}
        />
      </div>
      
      <div className="flex-1 min-w-0 z-10">
        <div className="text-[10px] uppercase tracking-[0.25em] font-bold text-zinc-400 font-mono mb-0.5" style={{ textShadow: `0 0 8px ${color}33` }}>{label}</div>
        <div className="flex items-baseline gap-2">
          <NumberTicker value={value} color={color} />
          {hint && <span className="text-[10px] font-mono text-zinc-500">{hint}</span>}
        </div>
      </div>
      
      <button
        onClick={() => onViewMore(statKey)}
        className="shrink-0 z-10 flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-sm border transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300"
        style={{
          borderColor: `${color}40`,
          color: color,
          background: `${color}10`,
          boxShadow: `0 0 10px ${color}22`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${color}25`;
          e.currentTarget.style.boxShadow = `0 0 15px ${color}66`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `${color}10`;
          e.currentTarget.style.boxShadow = `0 0 10px ${color}22`;
        }}
      >
        View More <ChevronRight className="w-3 h-3" />
      </button>

      {/* Hover border highlight */}
      <div 
        className="absolute inset-0 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ border: `1px solid ${color}80`, boxShadow: `inset 0 0 15px ${color}33` }}
      />
    </motion.div>
  );
}

export default function CommandCenter() {
  const { stats, sessions, events, setSelectedSession } = useSocStore();
  const [view, setView] = useState("realistic");
  const [modal, setModal] = useState(null);

  return (
    <div className="relative">
      <AttackerPanel />

      {/* Stat bar */}
      <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stat-bar">
        <StatCard label="Active Intruders" value={stats.active_intruders} icon={Skull}         color="#ff003c" hint="live"     statKey="intruders" onViewMore={setModal} />
        <StatCard label="Total Sessions"   value={stats.total_sessions}   icon={Activity}      color="#39ff14" hint="all time" statKey="sessions"  onViewMore={setModal} />
        <StatCard label="Critical Alerts"  value={stats.critical_alerts}  icon={AlertTriangle} color="#ff9f1c" hint="risk≥80"  statKey="alerts"    onViewMore={setModal} />
        <StatCard label="Mutation Rate"    value={stats.mutation_rate}    icon={Dna}           color="#00f0ff" hint="/min"     statKey="mutation"  onViewMore={setModal} />
      </div>

      {/* Map */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-3">
            <div className="label-mono">Global Threat Map</div>
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-[#ff003c]/40 text-[#ff003c]">
              {sessions.filter(s => s.status === "active").length} active
            </span>
          </div>
          <div className="flex items-center gap-3">
          </div>
        </div>
        <div className="glass rounded-md relative overflow-hidden" style={{ height: "min(64vh, 620px)" }} data-testid="globe-container">
          {view === "2d" ? <WorldMap onSelect={id => setSelectedSession(id)} /> : <Globe3D onSelect={id => setSelectedSession(id)} style={view} />}

          {/* Vertical control strip — right side of globe */}
          <div className="absolute top-1/2 right-3 -translate-y-1/2 z-20 flex flex-col items-center gap-1"
               style={{ background: "rgba(4,8,16,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 4px", backdropFilter: "blur(12px)" }}>

            {/* Legend section */}
            {[{ c: "#39ff14", l: "Honeypot" }, { c: "#ff9f1c", l: "Probing" }, { c: "#ff003c", l: "Critical" }].map(x => (
              <div key={x.l}
                className="flex flex-col items-center gap-1.5 py-2 px-2 rounded-sm hover:bg-white/5 transition-colors cursor-default"
                title={x.l}
              >
                {/* Dotted line preview box */}
                <div style={{
                  width: 36, height: 18,
                  border: `1px solid ${x.c}44`,
                  borderRadius: 3,
                  background: `${x.c}0a`,
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <div style={{
                    width: "calc(100% + 6px)",
                    marginLeft: "-6px",
                    height: 2,
                    backgroundImage: `repeating-linear-gradient(90deg, ${x.c} 0px, ${x.c} 3px, transparent 3px, transparent 6px)`,
                    animation: "dash-run 0.6s linear infinite",
                    boxShadow: `0 0 4px ${x.c}`,
                  }} />
                </div>
                <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: x.c }}>{x.l}</span>
              </div>
            ))}

            {/* Divider */}
            <div className="w-5 h-px bg-white/10 my-1" />

            {/* View mode buttons */}
            {[["realistic", <Globe2 className="w-3.5 h-3.5" />, "Earth"],
              ["hex",      <Hexagon className="w-3.5 h-3.5" />, "Hex"],
              ["2d",       <Map className="w-3.5 h-3.5" />,     "2D"]].map(([k, ico, lbl]) => (
              <button
                key={k}
                onClick={() => setView(k)}
                data-testid={`map-mode-${k}`}
                title={lbl}
                className="flex flex-col items-center gap-1 py-2 px-2 rounded-sm transition-all"
                style={view === k
                  ? { background: "rgba(57,255,20,0.15)", color: "#39ff14", boxShadow: "0 0 10px rgba(57,255,20,0.3)" }
                  : { color: "#52525b" }}
              >
                {ico}
                <span className="text-[8px] font-mono uppercase tracking-widest">{lbl}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Feed + MITRE — EXPANDED height */}
      <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: 440 }}>
        <div className="lg:col-span-2 h-full">
          <EventFeed />
        </div>
        <div className="h-full">
          <MitreHeatmap />
        </div>
      </div>

      {/* Stat Detail Modal */}
      <AnimatePresence>
        {modal && <StatDetailModal stat={modal} sessions={sessions} events={events} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}
