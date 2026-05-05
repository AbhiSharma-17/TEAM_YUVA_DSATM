import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Crosshair, Activity, ShieldOff } from "lucide-react";
import { useSocStore, API } from "../../store/socStore";

export default function AttackerPanel() {
  const { sessions, selectedSessionId, setSelectedSession, focusMode, setFocusMode } = useSocStore();
  const [pred, setPred] = useState(null);

  const session = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId),
    [sessions, selectedSessionId]
  );

  useEffect(() => {
    let alive = true;
    if (!session) return;
    setPred(null);
    axios
      .get(`${API}/predict/${session.id}`)
      .then((r) => alive && setPred(r.data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [session?.id]);

  return (
    <AnimatePresence>
      {session && (
        <motion.aside
          key={session.id}
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          data-testid="attacker-panel"
          className="fixed top-0 right-0 bottom-0 w-[380px] z-30 glass-strong border-l border-[#ff003c]/20 overflow-y-auto"
        >
          <div className="px-5 pt-5 pb-3 border-b border-white/5 sticky top-0 bg-[#0c0c0c]/85 backdrop-blur-xl z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="label-mono">Attacker Profile</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-2xl">{session.flag}</span>
                  <div>
                    <div className="text-white font-mono text-base font-bold">{session.ip}</div>
                    <div className="text-[11px] text-zinc-400">{session.country_name}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                data-testid="close-attacker-panel"
                className="p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 border border-white/5 rounded-sm">
                <div className="label-mono text-[8px]">Risk</div>
                <div
                  className="font-bold text-lg mt-0.5"
                  style={{
                    color: session.risk_score >= 80 ? "#ff003c" : session.risk_score >= 60 ? "#ff9f1c" : "#39ff14",
                    textShadow: "0 0 8px currentColor",
                  }}
                >
                  {session.risk_score}
                </div>
              </div>
              <div className="p-2 border border-white/5 rounded-sm">
                <div className="label-mono text-[8px]">Stage</div>
                <div className="text-white font-mono text-[11px] uppercase mt-1.5 truncate">{session.stage}</div>
              </div>
              <div className="p-2 border border-white/5 rounded-sm">
                <div className="label-mono text-[8px]">Status</div>
                <div
                  className="font-mono text-[11px] uppercase mt-1.5"
                  style={{
                    color: session.status === "active" ? "#ff003c" : session.status === "contained" ? "#ff9f1c" : "#39ff14",
                  }}
                >
                  {session.status}
                </div>
              </div>
            </div>

            <button
              onClick={() => setFocusMode(!focusMode)}
              data-testid="focus-mode-toggle"
              className={`mt-3 w-full ${focusMode ? "btn-crit" : "btn-neon"} flex items-center justify-center gap-2`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              {focusMode ? "Exit Focus Mode" : "Focus On Attacker"}
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5 text-[#39ff14]" />
                <span className="label-mono">Attacker Mind</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {session.intent_tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm border border-[#39ff14]/30 bg-[#39ff14]/5 text-[#39ff14]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3.5 h-3.5 text-[#ff9f1c]" />
                <span className="label-mono">Predicted Next Actions</span>
              </div>
              <div className="space-y-2">
                {pred?.predictions?.map((p) => {
                  const pct = Math.round(p.probability * 100);
                  const color = pct >= 70 ? "#ff003c" : pct >= 40 ? "#ff9f1c" : "#39ff14";
                  return (
                    <div key={p.label}>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-zinc-300">{p.label}</span>
                        <span style={{ color }} className="font-bold font-mono">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-sm overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {!pred && <div className="text-[11px] text-zinc-500 font-mono">analyzing telemetry…</div>}
                {pred && (
                  <div className="text-[10px] text-zinc-500 font-mono pt-1">
                    Next likely stage → <span className="text-[#ff9f1c]">{pred.next_likely_stage}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldOff className="w-3.5 h-3.5 text-[#ff003c]" />
                <span className="label-mono">Action Timeline</span>
              </div>
              <div className="border-l border-white/10 pl-3 space-y-2 max-h-[260px] overflow-y-auto">
                {session.commands.length === 0 && (
                  <div className="text-[11px] text-zinc-500 font-mono">awaiting commands…</div>
                )}
                {session.commands
                  .slice()
                  .reverse()
                  .map((c, i) => (
                    <div key={i} className="relative">
                      <span
                        className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full"
                        style={{
                          background: c.danger ? "#ff003c" : "#39ff14",
                          boxShadow: `0 0 6px ${c.danger ? "#ff003c" : "#39ff14"}`,
                        }}
                      />
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {new Date(c.ts).toLocaleTimeString()}
                      </div>
                      <div
                        className={`text-[11px] font-mono break-all ${
                          c.danger ? "text-[#ff003c]" : "text-[#39ff14]"
                        }`}
                      >
                        {c.cmd}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
