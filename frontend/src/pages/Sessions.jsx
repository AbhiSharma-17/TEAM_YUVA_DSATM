import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ShieldOff, FileSearch, X, ChevronRight, Code } from "lucide-react";
import { useSocStore } from "../store/socStore";

function riskColor(s) {
  if (s >= 80) return "#ff003c";
  if (s >= 60) return "#ff9f1c";
  return "#39ff14";
}

function TypingLine({ ts, cmd, danger }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(cmd.slice(0, i));
      if (i >= cmd.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [cmd]);
  return (
    <div className="flex gap-3 leading-relaxed">
      <span className="text-zinc-600 font-mono text-[11px] shrink-0">{new Date(ts).toLocaleTimeString()}</span>
      <span className="text-zinc-500 shrink-0">$</span>
      <span className={`font-mono text-[12px] break-all ${danger ? "text-[#ff003c]" : "text-[#39ff14]"}`}>
        {shown}
        <span className="cursor-blink" />
      </span>
    </div>
  );
}

function SessionCard({ s, active, onClick }) {
  const color = riskColor(s.risk_score);
  return (
    <button
      onClick={onClick}
      data-testid={`session-card-${s.id}`}
      className={`w-full text-left p-3 border-l-2 transition-all ${
        active ? "bg-[#39ff14]/8 border-[#39ff14]" : "border-transparent hover:bg-white/5 hover:border-white/30"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{s.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[12px] text-white truncate">{s.ip}</div>
          <div className="text-[10px] text-zinc-500 truncate">{s.country_name} → {s.honeypot_name}</div>
        </div>
        <div className="text-right">
          <div className="font-bold font-mono text-[13px]" style={{ color, textShadow: `0 0 6px ${color}55` }}>
            {s.risk_score}
          </div>
          <div className="text-[8px] uppercase tracking-wider text-zinc-500 font-mono">{s.status}</div>
        </div>
      </div>
    </button>
  );
}

function SessionDetailModal({ type, session, onClose }) {
  if (!session || !type) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-md overflow-hidden flex flex-col"
        style={{ background: "rgba(4,8,16,0.97)", border: "1px solid rgba(57,255,20,0.2)", maxHeight: "85vh" }}
      >
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="text-white font-bold text-sm uppercase tracking-widest">
            {type === "logs" ? "Full Command Execution Logs" : "Raw Threat Intelligence Profile"}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {type === "logs" ? (
            <div className="space-y-1.5 font-mono">
              {session.commands.length === 0 && <div className="text-zinc-500 text-sm">No commands recorded for this session.</div>}
              {session.commands.map((c, i) => (
                <div key={i} className="flex gap-4 p-1.5 hover:bg-white/5 rounded-sm">
                  <span className="text-zinc-500 text-[11px] shrink-0">{new Date(c.ts).toLocaleString()}</span>
                  <span className={`text-[12px] break-all ${c.danger ? "text-[#ff003c]" : "text-[#39ff14]"}`}>{c.cmd}</span>
                </div>
              ))}
            </div>
          ) : (
            <pre className="font-mono text-[11px] text-[#39ff14] whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(session, null, 2)}
            </pre>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Sessions() {
  const { sessions, selectedSessionId, setSelectedSession } = useSocStore();
  const sorted = useMemo(() => [...sessions].sort((a, b) => b.risk_score - a.risk_score), [sessions]);
  const sel = sorted.find((s) => s.id === selectedSessionId) || sorted[0];
  const [modalType, setModalType] = useState(null); // 'logs' or 'json'

  useEffect(() => {
    if (!selectedSessionId && sorted[0]) setSelectedSession(sorted[0].id);
  }, [sorted, selectedSessionId, setSelectedSession]);

  return (
    <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4" style={{ minHeight: "calc(100vh - 56px - 32px)" }}>
      {/* Session List */}
      <div className="glass rounded-md overflow-hidden flex flex-col" data-testid="session-list">
        <div className="px-4 pt-3 pb-2 border-b border-white/5">
          <div className="label-mono">Sessions ({sorted.length})</div>
          <div className="text-[10px] text-zinc-500 leading-tight mt-1">Live and historical intrusions ranked by AI threat score.</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sorted.map((s) => (
            <SessionCard key={s.id} s={s} active={sel?.id === s.id} onClick={() => setSelectedSession(s.id)} />
          ))}
        </div>
      </div>

      {sel && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
          {/* Terminal Replay */}
          <div className="glass scanlines rounded-md flex flex-col overflow-hidden" data-testid="terminal-replay">
            <div className="px-4 py-3 border-b border-white/5 flex items-start justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Terminal className="w-3.5 h-3.5 text-[#39ff14]" />
                  <span className="label-mono">Cinematic Terminal Replay</span>
                </div>
                <div className="text-[10px] text-zinc-500 leading-tight max-w-[80%]">
                  Live, animated reconstruction of the exact shell commands executed by the attacker inside the decoy environment.
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-[10px] font-mono text-zinc-500">{sel.ip} · {sel.honeypot_name}</div>
                <button
                  onClick={() => setModalType("logs")}
                  className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-sm border border-white/10 text-zinc-500 hover:border-[#39ff14]/40 hover:text-[#39ff14] transition-all"
                >
                  View Full Logs <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 bg-black/40">
              <div className="text-[10px] font-mono text-zinc-500 mb-2">[ session id: {sel.id.slice(0, 8)}… ]</div>
              {sel.commands.length === 0 && <div className="text-zinc-500 font-mono text-[11px]">awaiting commands…<span className="cursor-blink" /></div>}
              <AnimatePresence initial={false}>
                {sel.commands.slice(-25).map((c, i) => (
                  <motion.div key={`${sel.id}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <TypingLine ts={c.ts} cmd={c.cmd} danger={c.danger} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Attacker Profile */}
          <div className="glass rounded-md overflow-hidden flex flex-col" data-testid="attacker-profile">
            <div className="px-4 py-3 border-b border-white/5 flex items-start justify-between group">
              <div>
                <div className="label-mono mb-1">Attacker Profile</div>
                <div className="text-[10px] text-zinc-500 leading-tight pr-2">
                  Aggregated threat intelligence, AI-driven behavioral analysis, and extracted IOCs.
                </div>
              </div>
              <button
                onClick={() => setModalType("json")}
                className="shrink-0 flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-sm border border-white/10 text-zinc-500 hover:border-[#39ff14]/40 hover:text-[#39ff14] transition-all"
              >
                <Code className="w-3 h-3" /> View Raw
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{sel.flag}</span>
                <div>
                  <div className="font-mono text-base text-white font-bold">{sel.ip}</div>
                  <div className="text-[11px] text-zinc-400">{sel.country_name}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="label-mono">Risk</div>
                  <div className="font-bold text-2xl font-mono" style={{ color: riskColor(sel.risk_score), textShadow: `0 0 8px ${riskColor(sel.risk_score)}55` }}>
                    {sel.risk_score}
                  </div>
                </div>
              </div>

              <div>
                <div className="label-mono mb-2">AI Classification</div>
                <div className="flex flex-wrap gap-1.5">
                  {sel.intent_tags.map((t) => (
                    <span key={t} className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm border border-[#39ff14]/30 bg-[#39ff14]/5 text-[#39ff14]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="label-mono mb-2 flex items-center gap-2"><FileSearch className="w-3 h-3" /> Extracted IOCs</div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between"><span className="text-zinc-500">SRC IP</span><span className="text-white">{sel.ip}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">GEO</span><span className="text-white">{sel.country}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">DST</span><span className="text-white">{sel.honeypot_name}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">STAGE</span><span className="text-[#ff9f1c]">{sel.stage}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">TECHNIQUES</span><span className="text-white text-right">{sel.techniques.join(", ") || "none"}</span></div>
                </div>
              </div>

              <div>
                <div className="label-mono mb-2 flex items-center gap-2"><ShieldOff className="w-3 h-3" /> Behavior Timeline</div>
                <div className="border-l border-white/10 pl-3 space-y-2 max-h-[200px] overflow-y-auto">
                  {sel.commands.slice().reverse().slice(0, 12).map((c, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[14px] top-1.5 w-1.5 h-1.5 rounded-full" style={{ background: c.danger ? "#ff003c" : "#39ff14", boxShadow: `0 0 4px ${c.danger ? "#ff003c" : "#39ff14"}` }} />
                      <div className="text-[9px] text-zinc-500 font-mono">{new Date(c.ts).toLocaleTimeString()}</div>
                      <div className={`text-[11px] font-mono break-all ${c.danger ? "text-[#ff003c]" : "text-zinc-200"}`}>{c.cmd}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {modalType && <SessionDetailModal type={modalType} session={sel} onClose={() => setModalType(null)} />}
      </AnimatePresence>
    </div>
  );
}
