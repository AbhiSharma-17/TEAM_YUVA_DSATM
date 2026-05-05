import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSocStore } from "../../store/socStore";

const MITRE_META = {
  T1110: { tactic: "Credential Access",  desc: "Automated brute-force across SSH and web panels." },
  T1059: { tactic: "Execution",          desc: "Shell commands: reverse shells, miners, droppers." },
  T1046: { tactic: "Discovery",          desc: "Network scanning mapping exposed honeypot services." },
  T1078: { tactic: "Persistence",        desc: "Default/stolen credentials used to maintain access." },
  T1505: { tactic: "Persistence",        desc: "Web shells and backdoors on HTTP decoy nodes." },
  T1190: { tactic: "Initial Access",     desc: "Exploitation of simulated public-facing CVEs." },
  T1003: { tactic: "Credential Access",  desc: "/etc/shadow reads and memory scraping detected." },
  T1486: { tactic: "Impact",             desc: "Ransomware encryption on SMB and file-share decoys." },
};

const TACTIC_COLOR = {
  "Credential Access": "#ff003c",
  "Execution":         "#ff003c",
  "Discovery":         "#ff9f1c",
  "Persistence":       "#ff9f1c",
  "Initial Access":    "#39ff14",
  "Impact":            "#ff003c",
};

export default function MitreHeatmap() {
  const { mitre, refreshMitre, events } = useSocStore();

  useEffect(() => {
    const id = setInterval(() => refreshMitre(), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, []);

  const top = (mitre || []).slice(0, 8);
  const max = Math.max(1, ...top.map(t => t.count));

  return (
    <div className="glass rounded-md h-full flex flex-col overflow-hidden" data-testid="mitre-heatmap">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="label-mono">MITRE ATT&CK · Top Techniques</div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm border border-[#39ff14]/30 text-[#39ff14]">
            {events.length > 0 ? "live" : "idle"}
          </span>
          <span className="text-[9px] font-mono text-zinc-500">{top.length} techniques</span>
        </div>
      </div>

      {/* Technique list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {top.map((t, i) => {
          const meta = MITRE_META[t.id] || { tactic: "Unknown", desc: "Technique observed in the deception grid." };
          const intensity = t.count / max;
          const color = TACTIC_COLOR[meta.tactic] || "#39ff14";
          const pct = Math.max(4, Math.round(intensity * 100));

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-sm border border-white/5 overflow-hidden"
              style={{ background: "rgba(0,0,0,0.3)" }}
            >
              {/* Top row: ID + name + count */}
              <div className="px-3 pt-2.5 pb-1 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color }}>{t.id}</span>
                    <span
                      className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm border"
                      style={{ color, borderColor: `${color}40`, background: `${color}10` }}
                    >
                      {meta.tactic}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-medium">{t.name}</div>
                  <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">{meta.desc}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold text-lg leading-none" style={{ color, textShadow: `0 0 8px ${color}55` }}>
                    {t.count}
                  </div>
                  <div className="text-[8px] font-mono text-zinc-600">hits</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-[2px] bg-white/5 mx-3 mb-2.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="h-full rounded-full"
                  style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                />
              </div>
            </motion.div>
          );
        })}

        {top.length === 0 && (
          <div className="text-zinc-600 font-mono text-[11px] px-1">no techniques observed yet…</div>
        )}
      </div>
    </div>
  );
}
