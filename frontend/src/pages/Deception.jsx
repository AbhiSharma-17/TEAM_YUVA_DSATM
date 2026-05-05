import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Sparkles, Database, Bug, Zap, X, Loader2, Plus, Activity, Server } from "lucide-react";
import { useSocStore, API } from "../store/socStore";
import EventFeed from "../components/dashboard/EventFeed";
import axios from "axios";

const NODE_DESC = {
  "aurora":     "SSH brute-force decoy capturing credential attacks from automated bots.",
  "frankfurt":  "Fake web admin panel logging unauthorized login and config probing.",
  "tokyo":      "SMB file share decoy monitoring ransomware lateral movement attempts.",
  "singapore":  "FTP server lure tracking file upload and exfiltration behaviour.",
  "sao-paulo":  "Windows RDP decoy capturing desktop intrusion and pivot attempts.",
  "sydney":     "IoT MQTT broker decoy monitoring device takeover and botnet enrollment.",
};

const NODE_FLAGS = {
  "aurora":     "🇺🇸",
  "frankfurt":  "🇩🇪",
  "tokyo":      "🇯🇵",
  "singapore":  "🇸🇬",
  "sao-paulo":  "🇧🇷",
  "sydney":     "🇦🇺",
};

function PolicyBadge({ policy }) {
  const isAggro = policy === "aggressive_lure";
  const color = isAggro ? "#ff003c" : "#39ff14";
  return (
    <span
      className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-sm border"
      style={{ borderColor: `${color}55`, color, background: `${color}10` }}
    >
      {policy.replace(/_/g, " ")}
    </span>
  );
}

export default function Deception() {
  const { honeypots, mutations, honeytokens, addMutation, addEvent } = useSocStore();
  const [showLure, setShowLure] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [behavior, setBehavior] = useState("Attacker scanned for /admin and tried default credentials on web login");
  const [generating, setGenerating] = useState(false);
  const [lure, setLure] = useState(null);
  const [mutatingId, setMutatingId] = useState(null);

  const [visibleNames, setVisibleNames] = useState(["aurora","frankfurt","tokyo","singapore","sao-paulo","sydney"]);

  // Show only the nodes whose names are in the visibleNames array
  const locationNodes = honeypots.filter(hp => visibleNames.includes(hp.name));

  const generate = async () => {
    setGenerating(true);
    setLure(null);
    try {
      const r = await axios.post(`${API}/lure/generate`, { behavior, target_os: "linux" });
      setLure(r.data);
    } catch {
      setLure({ lure: "[generation failed — check backend connection]" });
    } finally {
      setGenerating(false);
    }
  };

  const handleMutate = (hp) => {
    setMutatingId(hp.id);
    setTimeout(() => {
      addMutation({
        id: "mut_" + Date.now() + "_" + hp.id,
        ts: Date.now(),
        description: `Node ${hp.name} dynamically mutated. Services recycled to evade fingerprinting.`
      });
      setMutatingId(null);
    }, 1500);
  };

  const [activeAction, setActiveAction] = useState(null);

  const handleGlobalAction = (id, title, desc) => {
    setActiveAction(id);
    setTimeout(() => {
      addMutation({
        id: "gmut_" + Date.now(),
        ts: Date.now(),
        description: `[GLOBAL] ${title}: ${desc}`
      });
      addEvent({
        id: "evt_" + Date.now(),
        ts: Date.now(),
        severity: "crit",
        message: `System: Initiated ${title}`
      });
      setActiveAction(null);
    }, 1200);
  };

  const [addingNode, setAddingNode] = useState(false);
  const handleAddNode = (manualNode = null) => {
    setAddingNode(true);
    setTimeout(() => {
      const available = honeypots.filter(hp => !visibleNames.includes(hp.name));
      if (available.length > 0) {
        const newNode = manualNode || available[Math.floor(Math.random() * available.length)];
        setVisibleNames([...visibleNames, newNode.name]);
        addMutation({
          id: "mut_" + Date.now(),
          ts: Date.now(),
          description: `[FABRIC EXPANSION] Deployed new decoy node: ${newNode.name} (${newNode.type})`
        });
        addEvent({
          id: "evt_node_" + Date.now(),
          ts: Date.now(),
          severity: "warn",
          message: `Fabric: Deployed new node ${newNode.name}`
        });
      }
      setAddingNode(false);
      setShowDeployModal(false);
    }, 800);
  };

  return (
    <div className="px-5 py-4 space-y-4">

      {/* TOP ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

        {/* === DECOY NETWORK TOPOLOGY === */}
        <div className="glass rounded-md overflow-hidden" data-testid="honeypot-graph">
          {/* Header */}
          <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#39ff14]" />
              <span className="label-mono">DECOY NETWORK TOPOLOGY</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowLure(true)} data-testid="open-lure" className="btn-neon flex items-center gap-1.5 text-[10px]">
                <Sparkles className="w-3 h-3" /> AI Lure Generator
              </button>
              <button onClick={() => setShowDeployModal(true)} disabled={addingNode} className="btn-neon flex items-center gap-1.5 text-[10px]">
                {addingNode ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} ADD NODE
              </button>
            </div>
          </div>

          {/* Connection graph */}
          <div className="relative p-5 overflow-hidden" style={{ minHeight: 460 }}>
            {/* SVG connection lines */}
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
              {locationNodes.map((hp, i) =>
                locationNodes.slice(i + 1).map((other, j) => (
                  <line
                    key={`${hp.id}-${other.id}`}
                    x1={`${20 + (i % 3) * 30}%`} y1={`${22 + Math.floor(i / 3) * 48}%`}
                    x2={`${20 + ((i + j + 1) % 3) * 30}%`} y2={`${22 + Math.floor((i + j + 1) / 3) * 48}%`}
                    stroke="rgba(57,255,20,0.08)" strokeDasharray="3 5" strokeWidth="1"
                  />
                ))
              )}
            </svg>

            {/* Node cards — 3-column grid */}
            <div className="grid grid-cols-3 gap-4 relative">
              {locationNodes.map((hp, i) => {
                const isMutating = mutatingId === hp.id;
                const desc = NODE_DESC[hp.name] || "Adaptive decoy node tracking lateral movement.";
                const flag = NODE_FLAGS[hp.name] || "🌐";
                const isHot = hp.active_sessions > 0;
                return (
                  <motion.div
                    key={hp.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="relative group"
                  >
                    <div
                      className="rounded-sm p-3 border transition-all"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        borderColor: isHot ? "rgba(57,255,20,0.3)" : "rgba(255,255,255,0.07)",
                        boxShadow: isHot ? "0 0 12px rgba(57,255,20,0.08)" : "none",
                      }}
                    >
                      {/* Active pulse dot */}
                      {isHot && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#39ff14] shadow-[0_0_6px_#39ff14] animate-pulse" />
                      )}

                      {/* Flag + type */}
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-lg">{flag}</span>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm border border-white/10 text-zinc-500">
                          {hp.type}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="font-bold text-white text-[13px] tracking-wide mb-1 capitalize">
                        {hp.name.replace(/-/g, " ")}
                      </div>

                      {/* Policy badge */}
                      <div className="mb-2">
                        <PolicyBadge policy={hp.policy} />
                      </div>

                      {/* Description */}
                      <div className="text-[10px] text-zinc-500 leading-snug mb-2.5 min-h-[32px]">
                        {desc}
                      </div>

                      {/* Sessions */}
                      <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/5 pt-2 mb-2.5">
                        <span className="text-zinc-500">active sessions</span>
                        <span className={`font-bold ${isHot ? "text-[#39ff14]" : "text-zinc-600"}`}>
                          {hp.active_sessions}
                        </span>
                      </div>

                      {/* Per-node action buttons */}
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => handleMutate(hp)}
                          className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-1.5 rounded-sm border border-[#39ff14]/30 text-[#39ff14] bg-[#39ff14]/5 hover:bg-[#39ff14]/15 transition-all flex items-center justify-center gap-1"
                        >
                          {isMutating
                            ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            : <Zap className="w-2.5 h-2.5" />}
                          MUTATE NOW
                        </button>
                        <button
                          onClick={() => setShowLure(true)}
                          className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-1.5 rounded-sm border border-white/10 text-zinc-400 hover:border-[#39ff14]/30 hover:text-[#39ff14] transition-all flex items-center justify-center gap-1"
                        >
                          <Bug className="w-2.5 h-2.5" /> INJECT LURE
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="border-t border-white/5 px-4 py-3 grid grid-cols-3 gap-3">
            <div>
              <button 
                data-testid="action-leak" 
                onClick={() => handleGlobalAction("leak", "Deploy Fake DB Leak", "Exposed decoy SQL database credentials across all honeypot nodes.")}
                className="btn-crit w-full flex items-center justify-center gap-1.5 mb-1.5 py-2 text-[10px]"
              >
                {activeAction === "leak" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />} Deploy Fake DB Leak
              </button>
              <div className="text-[9px] text-zinc-500 text-center leading-tight">Simulates a high-value database breach to attract advanced adversaries.</div>
            </div>
            <div>
              <button 
                data-testid="action-vuln" 
                onClick={() => handleGlobalAction("vuln", "Inject Vulnerability", "Simulated CVE-2024-X 0-day vulnerability across web admin panels.")}
                className="btn-neon w-full flex items-center justify-center gap-1.5 mb-1.5 py-2 text-[10px]"
              >
                {activeAction === "vuln" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bug className="w-3 h-3" />} Inject Vulnerability
              </button>
              <div className="text-[9px] text-zinc-500 text-center leading-tight">Introduces a synthetic 0-day vulnerability to monitor exploitation tools.</div>
            </div>
            <div>
              <button 
                data-testid="action-escalate" 
                onClick={() => handleGlobalAction("escalate", "Escalate Deception", "Increased environmental complexity. Generated 50+ fake lateral movement paths.")}
                className="btn-neon w-full flex items-center justify-center gap-1.5 mb-1.5 py-2 text-[10px]" 
                style={{ color: "#ff9f1c", borderColor: "rgba(255,159,28,0.4)", background: "rgba(255,159,28,0.05)" }}
              >
                {activeAction === "escalate" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Escalate Deception
              </button>
              <div className="text-[9px] text-zinc-500 text-center leading-tight">Dynamically alters decoy states to prolong engagement with attackers.</div>
            </div>
          </div>

          {/* MUTATION TIMELINE (Moved up to be directly underneath actions) */}
          <div className="border-t border-white/5 bg-black/20" data-testid="mutation-timeline">
            <div className="px-4 pt-2 pb-1">
              <div className="label-mono">MUTATION TIMELINE</div>
            </div>
            <div className="p-3 overflow-x-auto">
              <div className="flex items-stretch gap-4 min-w-max pb-2">
                {mutations.length === 0 && <div className="text-[11px] text-zinc-500 font-mono">awaiting environment mutations…</div>}
                {mutations.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    className="relative flex flex-col items-center min-w-[240px]"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#ff9f1c] shadow-[0_0_8px_#ff9f1c] mb-2 z-10" />
                    <div className="glass border border-[#ff9f1c]/15 rounded-sm p-3 w-full bg-black/40">
                      <div className="text-[10px] font-mono text-zinc-500 mb-1">{new Date(m.ts).toLocaleTimeString()}</div>
                      <div className="text-[11px] font-mono text-white leading-snug">{m.description}</div>
                    </div>
                    {i < mutations.length - 1 && (
                      <div className="absolute left-1/2 right-[-32px] top-1 h-[1px] bg-[#ff9f1c]/20" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === ACTIVE HONEYTOKENS === */}
        <div className="glass rounded-md overflow-hidden flex flex-col" data-testid="honeytoken-panel">
          <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between">
            <div className="label-mono">ACTIVE HONEYTOKENS</div>
            <span className="text-[9px] font-mono text-zinc-500">{honeytokens.length} tokens</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[600px]">
            {honeytokens.length === 0 && <div className="text-[11px] text-zinc-500 font-mono">no triggers yet…</div>}
            {honeytokens.map((t) => {
              const triggered = t.triggered || t.severity === "crit";
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border rounded-sm p-2.5 transition-colors"
                  style={{
                    borderColor: triggered ? "rgba(255,0,60,0.35)" : "rgba(255,255,255,0.06)",
                    background: triggered ? "rgba(255,0,60,0.04)" : "transparent",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-white truncate">{t.name || t.type || "token"}</span>
                    {triggered && (
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm bg-[#ff003c]/20 text-[#ff003c] border border-[#ff003c]/30 ml-1 shrink-0">
                        TRIGGERED
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-zinc-400 truncate">{t.value || t.token || "—"}</div>
                  {t.triggered_by_ip && (
                    <div className="font-mono text-[9px] text-zinc-600 mt-0.5">tripped by {t.triggered_by_ip}</div>
                  )}
                  <div className="text-[9px] text-zinc-600 mt-1 leading-tight">
                    {(t.name || "").includes("api") || (t.type || "").includes("api")
                      ? "Fake cloud keys planted to alert on access."
                      : (t.name || "").includes("doc") || (t.type || "").includes("doc")
                      ? "Tainted document acting as a tripwire."
                      : (t.type || "").includes("email")
                      ? "Canary email alerting on any access attempt."
                      : "Canary artifact tracking unauthorized access."}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LIVE EVENT FEED (Added below the top row grid) */}
      <div className="h-[280px]">
        <EventFeed />
      </div>

      {/* AI LURE MODAL */}
      {showLure && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowLure(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            data-testid="lure-modal"
            className="glass-strong border border-[#39ff14]/20 rounded-md w-full max-w-xl"
          >
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#39ff14]" />
                <span className="text-white font-bold text-sm uppercase tracking-wider">AI Lure Generator</span>
              </div>
              <button onClick={() => setShowLure(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <div className="label-mono mb-2">Observed Attacker Behavior</div>
                <textarea
                  value={behavior}
                  onChange={(e) => setBehavior(e.target.value)}
                  rows={3}
                  data-testid="lure-input"
                  className="w-full bg-black/50 border border-white/10 px-3 py-2 text-[12px] font-mono text-white outline-none focus:border-[#39ff14]/50 rounded-sm"
                />
              </div>
              <button onClick={generate} disabled={generating} data-testid="generate-lure" className="btn-neon w-full flex items-center justify-center gap-2">
                {generating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Lure Pack…</> : <><Sparkles className="w-3.5 h-3.5" /> Generate Lure</>}
              </button>
              {lure && (
                <div className="bg-black/50 border border-white/10 rounded-sm p-3 max-h-[300px] overflow-y-auto">
                  <pre className="font-mono text-[11px] text-[#39ff14] whitespace-pre-wrap">{lure.lure}</pre>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* DEPLOY NODE MODAL */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowDeployModal(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong border border-[#39ff14]/20 rounded-md w-full max-w-xl flex flex-col max-h-[80vh]"
          >
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#39ff14]" />
                <span className="text-white font-bold text-sm uppercase tracking-wider">Deploy New Decoy Node</span>
              </div>
              <button onClick={() => setShowDeployModal(false)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Quick Deploy */}
              <div>
                <div className="label-mono mb-2 text-[#39ff14]">1. Quick Auto-Deploy</div>
                <div className="text-[11px] text-zinc-400 mb-3">Automatically select and deploy a random available template from the decoy inventory.</div>
                <button 
                  onClick={() => handleAddNode(null)} 
                  disabled={addingNode || honeypots.filter(hp => !visibleNames.includes(hp.name)).length === 0}
                  className="btn-neon w-full flex items-center justify-center gap-2 py-2.5"
                >
                  {addingNode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} 
                  AUTO DEPLOY RANDOM NODE
                </button>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="label-mono mb-2 text-zinc-300">2. Manual Selection</div>
                <div className="text-[11px] text-zinc-400 mb-3">Select a specific decoy configuration to deploy to the deception fabric.</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {honeypots.filter(hp => !visibleNames.includes(hp.name)).length === 0 && (
                    <div className="col-span-2 text-center text-zinc-500 text-[11px] font-mono py-4 border border-white/5 bg-white/5 rounded-sm">
                      [ NO MORE DECOY TEMPLATES AVAILABLE IN INVENTORY ]
                    </div>
                  )}
                  {honeypots.filter(hp => !visibleNames.includes(hp.name)).map(hp => (
                    <div key={hp.id} className="border border-white/10 rounded-sm p-3 hover:border-[#39ff14]/40 hover:bg-[#39ff14]/5 transition-colors cursor-pointer flex flex-col justify-between" onClick={() => handleAddNode(hp)}>
                      <div>
                        <div className="font-mono text-[11px] text-white font-bold mb-1">{hp.name}</div>
                        <div className="text-[9px] text-zinc-500 mb-2">Type: <span className="text-zinc-300">{hp.type}</span></div>
                      </div>
                      <button className="text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-sm border border-white/10 text-zinc-300 hover:border-[#39ff14]/30 hover:text-[#39ff14] mt-1 w-full flex items-center justify-center gap-1">
                        <Plus className="w-2.5 h-2.5" /> DEPLOY
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
