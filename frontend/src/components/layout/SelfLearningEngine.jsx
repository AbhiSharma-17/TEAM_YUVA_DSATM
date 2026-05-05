import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, TrendingUp, RefreshCw, ShieldCheck, Brain, Activity, Zap, GitBranch } from "lucide-react";
import { useSocStore } from "../../store/socStore";

const LEARNING_LOGS = [
  "Analyzing SSH brute-force pattern from 45.83.12.9...",
  "Pattern absorbed → updating neural ruleset v{v}",
  "New exploit signature detected in live payload stream.",
  "Recalibrating deception bait profile for T1059...",
  "Prediction model retrained. Accuracy delta: +{d}%",
  "Honeytoken decay rate adjusted for IoT node class.",
  "Correlated botnet cluster ASN-12345 flagged automatically.",
  "Graph model updated with 3 new attacker relationship edges.",
  "Deception layer mutation threshold auto-recalculated.",
  "Zero-day probe detected → isolation chain triggered autonomously.",
  "Credential lure strategy rotated based on attacker tooling.",
  "MITRE T1486 signature cross-referenced with 7 sessions.",
  "Self-updating blocklist synced with Graph Intelligence.",
  "Adaptive delay injected to slow down automated scanners.",
  "New country origin cluster identified: Brazil, Ukraine.",
];

const CAPABILITIES = [
  { icon: TrendingUp,  label: "Auto-Pattern Absorption",       color: "text-[#39ff14]",  desc: "Absorbs new attack signatures in real-time without redeployment." },
  { icon: RefreshCw,   label: "Continuous Model Updates",       color: "text-[#ff9f1c]",  desc: "Retrains its prediction model autonomously after each threat cycle." },
  { icon: Brain,       label: "Behavioral Fingerprinting",      color: "text-[#00f0ff]",  desc: "Builds unique attacker profiles across sessions to track recurring actors." },
  { icon: GitBranch,   label: "Graph-Aware Correlation",        color: "text-[#b026ff]",  desc: "Cross-references Graph Intelligence to flag coordinated botnet activity." },
  { icon: ShieldCheck, label: "Improved Deception Over Time",   color: "text-[#39ff14]",  desc: "Each new attack makes the honeypot smarter and more convincing." },
  { icon: Zap,         label: "Zero-Lag Autonomous Response",   color: "text-[#ff003c]",  desc: "Triggers isolation and mutation within milliseconds of pattern match." },
];

const panelVariants = {
  hidden: { x: 440, opacity: 0, scale: 0.95 },
  visible: { 
    x: 0, opacity: 1, scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 200, staggerChildren: 0.08, delayChildren: 0.1 }
  },
  exit: { x: 440, opacity: 0, scale: 0.95, transition: { duration: 0.25, ease: "easeInOut" } }
};

const itemVariants = {
  hidden: { x: 20, opacity: 0, filter: "blur(4px)" },
  visible: { 
    x: 0, opacity: 1, filter: "blur(0px)",
    transition: { type: "spring", damping: 20, stiffness: 300 }
  }
};

export default function SelfLearningPanel() {
  const { selfLearningOpen, setSelfLearningOpen } = useSocStore();
  const [accuracy, setAccuracy] = useState(87.4);
  const [patternsLearned, setPatternsLearned] = useState(142);
  const [modelVersion, setModelVersion] = useState(1);
  const [trainingProgress, setTrainingProgress] = useState(62);
  const [logs, setLogs] = useState(["System initializing self-learning engine..."]);
  const [isTraining, setIsTraining] = useState(false);

  // Continuous live-learning simulation
  useEffect(() => {
    if (!selfLearningOpen) return;
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;

      setTrainingProgress(prev => {
        const next = prev + (Math.random() * 1.8);
        if (next >= 100) {
          setModelVersion(v => v + 1);
          setAccuracy(a => Math.min(99.9, parseFloat((a + Math.random() * 0.4).toFixed(1))));
          setPatternsLearned(p => p + Math.floor(Math.random() * 5 + 1));
          setIsTraining(false);
          return 0;
        }
        if (next > 70) setIsTraining(true);
        return parseFloat(next.toFixed(1));
      });

      if (tick % 3 === 0) {
        const raw = LEARNING_LOGS[Math.floor(Math.random() * LEARNING_LOGS.length)];
        const msg = raw
          .replace("{v}", modelVersion + 1)
          .replace("{d}", (Math.random() * 0.6).toFixed(1));
        setLogs(prev => {
          const next = [`[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${msg}`, ...prev];
          return next.slice(0, 12);
        });
      }

      if (tick % 2 === 0) {
        setAccuracy(a => {
          const delta = (Math.random() - 0.45) * 0.15;
          return Math.min(99.9, Math.max(80, parseFloat((a + delta).toFixed(1))));
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selfLearningOpen, modelVersion]);

  // Lock scroll when open
  useEffect(() => {
    if (selfLearningOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [selfLearningOpen]);

  return (
    <AnimatePresence>
      {selfLearningOpen && (
        <motion.aside
          key="self-learning-panel"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-0 right-0 bottom-0 w-[440px] z-50 flex flex-col overflow-hidden shadow-[-20px_0_50px_rgba(0,240,255,0.15)]"
          style={{
            background: "rgba(4,8,16,0.92)",
            borderLeft: "1px solid rgba(0,240,255,0.4)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Animated Cyberpunk Background */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.div 
              animate={{ backgroundPosition: ["0px 0px", "0px 100px"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(0, 240, 255, 0.3) 25%, rgba(0, 240, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, 0.3) 75%, rgba(0, 240, 255, 0.3) 76%, transparent 77%, transparent)",
                backgroundSize: "50px 50px"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            <motion.div
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.15)_0%,transparent_70%)]"
            />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="relative w-9 h-9 grid place-items-center rounded-sm"
                style={{ background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.2)" }}
              >
                <Sparkles className="w-4 h-4 text-[#00f0ff]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff] animate-pulse" />
              </div>
              <div>
                <div className="text-white text-sm font-bold tracking-wide">SELF-LEARNING ENGINE</div>
                <div className="text-[9px] font-mono text-[#00f0ff]/60 uppercase tracking-widest">Rule + AI + Graph · v{modelVersion}.0</div>
              </div>
            </div>
            <button
              onClick={() => setSelfLearningOpen(false)}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Live stats bar */}
          <motion.div variants={itemVariants} className="px-5 py-4 border-b border-white/5 grid grid-cols-3 gap-3 shrink-0">
            {[
              { label: "Accuracy", value: `${accuracy}%`, color: "text-[#39ff14]", bar: accuracy, barColor: "from-[#39ff14] to-[#00f0ff]" },
              { label: "Patterns", value: patternsLearned, color: "text-[#ff9f1c]", bar: Math.min(100, (patternsLearned / 300) * 100), barColor: "from-[#ff9f1c] to-[#ff003c]" },
              { label: "Model", value: `v${modelVersion}.0`, color: "text-[#00f0ff]", bar: null },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-sm p-2.5 border border-white/5">
                <div className="text-[9px] font-mono text-zinc-500 uppercase mb-1">{s.label}</div>
                <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
                {s.bar !== null && (
                  <div className="mt-1.5 h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${s.barColor} rounded-full transition-all duration-1000`}
                      style={{ width: `${s.bar}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          {/* Training cycle */}
          <motion.div variants={itemVariants} className="px-5 py-3 border-b border-white/5 shrink-0 relative overflow-hidden group">
            {/* Animated glowing backdrop for training bar */}
            {isTraining && (
               <motion.div 
                 animate={{ opacity: [0, 0.5, 0] }} 
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff9f1c]/10 to-transparent skew-x-12 translate-x-[-100%]"
               />
            )}
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <RefreshCw className={`w-3 h-3 text-[#ff9f1c] ${isTraining ? "animate-spin" : ""}`} />
                <span className="text-[9px] font-mono text-zinc-400 uppercase">
                  {isTraining ? "Retraining model..." : "Training Cycle Progress"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#ff9f1c] font-bold">{trainingProgress.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#ff9f1c] to-[#ff003c] rounded-full"
                animate={{ width: `${trainingProgress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </motion.div>

          {/* Live Reasoning Log */}
          <motion.div variants={itemVariants} className="px-5 py-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Live Reasoning Log</span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {logs.map((log, i) => (
                <motion.div
                  key={log + i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-mono text-[10px] leading-relaxed"
                >
                  <span className="text-zinc-600">{log.split("] ")[0]}] </span>
                  <span className={i === 0 ? "text-[#00f0ff]" : "text-zinc-400"}>{log.split("] ")[1]}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Capabilities */}
          <motion.div variants={itemVariants} className="flex-1 overflow-y-auto px-5 py-4">
            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Core Capabilities</div>
            <div className="space-y-3">
              {CAPABILITIES.map(({ icon: Icon, label, color, desc }) => (
                <div key={label} className="flex gap-3 p-3 rounded-sm border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className={`mt-0.5 shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold font-mono uppercase tracking-wider ${color}`}>{label}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
