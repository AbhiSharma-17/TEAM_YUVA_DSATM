import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Brain, Cpu, Network, Zap, ShieldCheck, Activity, Terminal, CheckCircle2, AlertTriangle, Play, Pause, FastForward, Globe2 } from "lucide-react";
import { useSocStore } from "../../store/socStore";

export default function HybridBrainModal() {
  const { hybridBrainOpen, setHybridBrainOpen, addMutation, addEvent, stats } = useSocStore();
  const [activeTab, setActiveTab] = useState("rules");
  
  // Rule State
  const [tarpitEnabled, setTarpitEnabled] = useState(false);
  const [riskThreshold, setRiskThreshold] = useState(80);
  const [savingRules, setSavingRules] = useState(false);

  // AI State
  const [aiStrategy, setAiStrategy] = useState("dynamic"); // dynamic, passive, aggressive
  const [aiLogs, setAiLogs] = useState([]);
  const [customLure, setCustomLure] = useState("");
  
  // Graph State
  const [correlating, setCorrelating] = useState(false);
  const [severed, setSevered] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setHybridBrainOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setHybridBrainOpen]);

  // Simulated AI Logs
  useEffect(() => {
    if (!hybridBrainOpen || activeTab !== "ai") return;
    
    const messages = [
      "Analyzing incoming payload heuristically...",
      "Matching payload signature to MITRE ATT&CK T1505...",
      `Generating deceptive payload response for session...`,
      "Injecting fake AWS credentials into honeypot memory...",
      "Monitoring attacker credential extraction...",
      "Updating risk profile based on lateral movement attempts...",
    ];
    
    const interval = setInterval(() => {
      setAiLogs(prev => {
        const next = [...prev, `[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${messages[Math.floor(Math.random() * messages.length)]}`];
        if (next.length > 8) return next.slice(next.length - 8);
        return next;
      });
    }, 2500);
    
    return () => clearInterval(interval);
  }, [hybridBrainOpen, activeTab]);

  if (!hybridBrainOpen) return null;

  const handleSaveRules = () => {
    setSavingRules(true);
    setTimeout(() => {
      addEvent({
        id: "evt_hb_rule_" + Date.now(),
        ts: Date.now(),
        severity: "warn",
        message: `Rule Engine: Tarpit=${tarpitEnabled ? 'ON' : 'OFF'}, Block Threshold=${riskThreshold}`
      });
      addMutation({
        id: "mut_hb_rule_" + Date.now(),
        ts: Date.now(),
        description: `[HYBRID BRAIN] Deterministic rules updated. Tarpitting: ${tarpitEnabled ? 'Enabled' : 'Disabled'}`
      });
      setSavingRules(false);
    }, 800);
  };

  const handleAiStrategy = (strat) => {
    setAiStrategy(strat);
    addEvent({
      id: "evt_hb_ai_" + Date.now(),
      ts: Date.now(),
      severity: "crit",
      message: `AI Engine: Strategy shifted to ${strat.toUpperCase()}`
    });
    addMutation({
      id: "mut_hb_ai_" + Date.now(),
      ts: Date.now(),
      description: `[HYBRID BRAIN] AI Lure generation strategy shifted to ${strat.toUpperCase()}`
    });
  };

  const handleInjectLure = () => {
    if (!customLure.trim()) return;
    const lure = customLure;
    setCustomLure("");
    
    setAiLogs(prev => {
      const next = [...prev, `[${new Date().toISOString().split('T')[1].slice(0, 8)}] ⚠️ USER OVERRIDE: Synthesizing custom file '${lure}' and injecting into attacker session...`];
      if (next.length > 8) return next.slice(next.length - 8);
      return next;
    });

    setTimeout(() => {
      addEvent({
        id: "evt_hb_lure_" + Date.now(),
        ts: Date.now(),
        severity: "crit",
        message: `AI Engine: Injected custom honeytoken '${lure}'`
      });
      addMutation({
        id: "mut_hb_lure_" + Date.now(),
        ts: Date.now(),
        description: `[HYBRID BRAIN] Manual Honeytoken Injection: '${lure}' successfully synthesized and deployed to active honeypots.`
      });
    }, 1000);
  };

  const handleSeverBotnet = () => {
    setCorrelating(true);
    setTimeout(() => {
      addEvent({
        id: "evt_hb_graph_" + Date.now(),
        ts: Date.now(),
        severity: "crit",
        message: `Graph Engine: Severed coordinated botnet cluster (3 IPs)`
      });
      addMutation({
        id: "mut_hb_graph_" + Date.now(),
        ts: Date.now(),
        description: `[HYBRID BRAIN] Graph correlation identified and severed botnet cluster acting across multiple nodes.`
      });
      setCorrelating(false);
      setSevered(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setHybridBrainOpen(false)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="glass border border-[#39ff14]/30 rounded-lg w-full max-w-4xl shadow-[0_0_40px_rgba(57,255,20,0.1)] flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#39ff14]/20 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-6 h-6 text-[#39ff14]" />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#39ff14] rounded-full shadow-[0_0_8px_#39ff14] animate-pulse" />
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-wider uppercase flex items-center gap-2">
                Hybrid Brain Operations
                <span className="px-1.5 py-0.5 rounded-sm bg-[#39ff14]/20 text-[#39ff14] text-[9px] font-mono tracking-widest border border-[#39ff14]/30">ONLINE</span>
              </div>
              <div className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Rule • AI • Graph Intelligence</div>
            </div>
          </div>
          <button onClick={() => setHybridBrainOpen(false)} className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-white/5 bg-black/20 p-3 flex flex-col gap-2">
            <TabButton 
              active={activeTab === "rules"} 
              onClick={() => setActiveTab("rules")} 
              icon={ShieldCheck} 
              label="Rule Engine" 
              subtext="Deterministic" 
            />
            <TabButton 
              active={activeTab === "ai"} 
              onClick={() => setActiveTab("ai")} 
              icon={Cpu} 
              label="AI Intelligence" 
              subtext="Generative Defense" 
            />
            <TabButton 
              active={activeTab === "graph"} 
              onClick={() => setActiveTab("graph")} 
              icon={Network} 
              label="Graph Intelligence" 
              subtext="Correlation Matrix" 
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-black/30">
            {activeTab === "rules" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#ff9f1c]" />
                  <h3 className="text-white font-bold text-lg">Deterministic Security Rules</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="glass-strong p-4 rounded-md border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="label-mono text-[#39ff14]">Aggressive Tarpitting</div>
                      <button 
                        onClick={() => setTarpitEnabled(!tarpitEnabled)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${tarpitEnabled ? 'bg-[#39ff14]' : 'bg-zinc-700'}`}
                      >
                        <div className={`absolute top-1 bottom-1 w-4 bg-black rounded-full transition-all ${tarpitEnabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="text-xs text-zinc-400 mb-4">
                      When enabled, the deception fabric artificially limits bandwidth for identified malicious actors to waste their time and resources.
                    </div>
                  </div>

                  <div className="glass-strong p-4 rounded-md border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="label-mono text-[#ff003c]">Auto-Block Threshold</div>
                      <div className="text-[#ff003c] font-mono font-bold">{riskThreshold}/100</div>
                    </div>
                    <div className="text-xs text-zinc-400 mb-4">
                      IP addresses reaching this risk score will be automatically blocked at the firewall level.
                    </div>
                    <input 
                      type="range" 
                      min="50" max="100" 
                      value={riskThreshold} 
                      onChange={(e) => setRiskThreshold(Number(e.target.value))}
                      className="w-full accent-[#ff003c]"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveRules}
                  disabled={savingRules}
                  className="btn-neon w-full py-3 flex justify-center items-center gap-2"
                >
                  {savingRules ? <Activity className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {savingRules ? 'Applying Rules...' : 'Apply Deterministic Rules'}
                </button>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-5 h-5 text-[#00f0ff]" />
                  <h3 className="text-white font-bold text-lg">Generative Defense Intelligence</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <StrategyCard 
                    label="Passive" 
                    icon={Pause}
                    active={aiStrategy === "passive"} 
                    onClick={() => handleAiStrategy("passive")} 
                    desc="Static lures only."
                  />
                  <StrategyCard 
                    label="Dynamic" 
                    icon={Play}
                    active={aiStrategy === "dynamic"} 
                    onClick={() => handleAiStrategy("dynamic")} 
                    desc="Adapts to payloads."
                  />
                  <StrategyCard 
                    label="Aggressive" 
                    icon={FastForward}
                    active={aiStrategy === "aggressive"} 
                    onClick={() => handleAiStrategy("aggressive")} 
                    desc="Injects zero-days."
                  />
                </div>

                <div className="flex-1 glass-strong border border-[#00f0ff]/20 rounded-md p-4 flex flex-col min-h-[200px]">
                  <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                    <Terminal className="w-4 h-4 text-[#00f0ff]" />
                    <span className="label-mono text-[#00f0ff]">AI Decision Audit Log</span>
                  </div>
                  <div className="flex-1 font-mono text-[11px] text-zinc-300 space-y-2 overflow-y-auto mb-3">
                    {aiLogs.length === 0 ? (
                      <div className="text-zinc-600 animate-pulse">Initializing LLM Engine...</div>
                    ) : (
                      aiLogs.map((log, i) => (
                        <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <span className="text-zinc-500">{log.split('] ')[0]}] </span>
                          <span className={log.includes('USER OVERRIDE') ? 'text-[#ff9f1c]' : 'text-[#00f0ff]'}>{log.split('] ')[1]}</span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <input 
                      type="text" 
                      placeholder="E.g., passwords_2026.txt or aws_keys.csv" 
                      value={customLure}
                      onChange={(e) => setCustomLure(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInjectLure()}
                      className="flex-1 bg-black/40 border border-[#00f0ff]/30 rounded-sm px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#00f0ff]"
                    />
                    <button 
                      onClick={handleInjectLure}
                      className="px-4 py-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 rounded-sm text-[#00f0ff] text-[10px] font-bold uppercase tracking-wider transition-colors"
                    >
                      Inject Custom Lure
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "graph" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Network className="w-5 h-5 text-[#b026ff]" />
                  <h3 className="text-white font-bold text-lg">Graph Correlation Engine</h3>
                </div>

                <div className="glass-strong border border-[#b026ff]/30 rounded-md p-5 bg-black/40 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#ff9f1c]" />
                        <span className="label-mono text-[#ff9f1c]">Coordinated Botnet Detected</span>
                      </div>
                      {severed && <span className="text-[#ff003c] font-bold text-[10px] border border-[#ff003c] px-2 py-0.5 rounded-sm uppercase tracking-widest animate-pulse">Quarantined</span>}
                    </div>

                    {/* Visual Graph Connection Map */}
                    <div className="h-40 bg-black/50 border border-white/5 rounded-md mb-6 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(176,38,255,0.1)_0%,transparent_70%)]" />
                      
                      {/* Central Target Node */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full border-2 grid place-items-center bg-black transition-colors duration-700 ${severed ? 'border-[#39ff14] shadow-[0_0_15px_#39ff14]' : 'border-[#ff003c] shadow-[0_0_15px_#ff003c]'}`}>
                          <Globe2 className={`w-5 h-5 ${severed ? 'text-[#39ff14]' : 'text-[#ff003c]'}`} />
                        </div>
                        <span className="text-[9px] font-mono mt-2 text-zinc-400">Target Fabric</span>
                      </div>

                      {/* Attacker Nodes */}
                      {[
                        { ip: "45.83.12.9", angle: -45, delay: 0 },
                        { ip: "45.83.12.14", angle: 0, delay: 0.2 },
                        { ip: "45.83.12.88", angle: 45, delay: 0.4 }
                      ].map((node, i) => (
                        <div key={i} className="absolute left-1/2 top-1/2 -mt-4 -ml-4" style={{ transform: `rotate(${node.angle}deg) translateX(-120px) rotate(${-node.angle}deg)` }}>
                          {/* Connection Line */}
                          {!severed && (
                            <div className="absolute top-4 left-8 h-[2px] w-[90px] bg-gradient-to-r from-[#b026ff] to-[#ff003c] origin-left animate-pulse" 
                                 style={{ transform: `rotate(${node.angle === -45 ? 25 : node.angle === 45 ? -25 : 0}deg)` }} />
                          )}
                          
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: node.delay, duration: 0.5 }}
                            className={`w-8 h-8 rounded-full border grid place-items-center bg-black relative z-10 ${severed ? 'border-zinc-700 opacity-30' : 'border-[#b026ff] shadow-[0_0_10px_#b026ff]'}`}
                          >
                            <Terminal className={`w-3 h-3 ${severed ? 'text-zinc-600' : 'text-[#b026ff]'}`} />
                          </motion.div>
                          <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono whitespace-nowrap ${severed ? 'text-zinc-600 line-through' : 'text-white'}`}>{node.ip}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleSeverBotnet}
                      disabled={correlating || severed}
                      className={`w-full py-3 rounded-md border font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                        severed 
                          ? 'border-zinc-700 bg-black/20 text-zinc-600 cursor-not-allowed' 
                          : 'border-[#b026ff]/50 bg-[#b026ff]/10 hover:bg-[#b026ff]/20 text-[#b026ff]'
                      }`}
                    >
                      {correlating ? <Activity className="w-4 h-4 animate-spin" /> : severed ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      {severed ? 'Botnet Quarantined' : 'Sever Botnet Connections'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, subtext }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-start p-3 rounded-md transition-all text-left ${active ? 'bg-[#39ff14]/10 border border-[#39ff14]/30 shadow-[inset_2px_0_0_#39ff14]' : 'hover:bg-white/5 border border-transparent'}`}
    >
      <div className={`flex items-center gap-2 mb-1 ${active ? 'text-[#39ff14]' : 'text-zinc-400'}`}>
        <Icon className="w-4 h-4" />
        <span className="font-bold text-xs tracking-wider uppercase">{label}</span>
      </div>
      <div className="text-[9px] font-mono text-zinc-500 ml-6 uppercase">{subtext}</div>
    </button>
  );
}

function StrategyCard({ label, icon: Icon, active, onClick, desc }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-md border transition-all text-left ${active ? 'border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_15px_rgba(0,240,255,0.15)]' : 'border-white/10 bg-black/40 hover:border-white/20'}`}
    >
      <div className={`flex items-center gap-2 mb-1 ${active ? 'text-[#00f0ff]' : 'text-zinc-400'}`}>
        <Icon className="w-4 h-4" />
        <span className="font-bold text-[11px] tracking-wider uppercase">{label}</span>
      </div>
      <div className="text-[10px] text-zinc-500">{desc}</div>
    </button>
  );
}
