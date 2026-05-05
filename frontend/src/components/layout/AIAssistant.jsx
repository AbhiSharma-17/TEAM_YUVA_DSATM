import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Send, Bot, X, Loader2, ChevronRight } from "lucide-react";
import { useSocStore, API } from "../../store/socStore";

const SUGGESTIONS = [
  "What is happening right now?",
  "Who is the most dangerous attacker?",
  "Recommend a deception action",
  "Show MITRE techniques",
  "Generate executive report",
  "Show recent events",
  "What countries are attacking?",
  "Explain how Chameleon works",
];

/** Lightweight inline markdown → JSX renderer */
function MarkdownText({ text }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Heading ##
        if (line.startsWith("### "))
          return <div key={i} className="text-[#39ff14] font-bold text-[11px] uppercase tracking-widest mt-3 mb-1 border-b border-[#39ff14]/20 pb-1">{line.slice(4)}</div>;
        if (line.startsWith("## "))
          return <div key={i} className="text-white font-bold text-[13px] mt-3 mb-1">{line.slice(3)}</div>;
        if (line.startsWith("# "))
          return <div key={i} className="text-[#39ff14] font-bold text-[14px] mt-2 mb-1">{line.slice(2)}</div>;

        // Bullet list
        if (line.match(/^[-*•] /)) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[#39ff14] mt-0.5 shrink-0">›</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }

        // Numbered list
        if (line.match(/^\d+\. /)) {
          const num = line.match(/^(\d+)\. /)[1];
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[#39ff14] font-mono text-[10px] mt-0.5 shrink-0">{num}.</span>
              <span>{renderInline(line.replace(/^\d+\. /, ""))}</span>
            </div>
          );
        }

        // Empty line
        if (line.trim() === "") return <div key={i} className="h-1" />;

        // Normal paragraph
        return <div key={i}>{renderInline(line)}</div>;
      })}
    </div>
  );
}

function renderInline(text) {
  // Bold **text**, inline code `code`
  const parts = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={idx++}>{text.slice(last, match.index)}</span>);
    const raw = match[0];
    if (raw.startsWith("`"))
      parts.push(<code key={idx++} className="bg-[#39ff14]/10 text-[#39ff14] px-1 rounded text-[11px] font-mono">{raw.slice(1, -1)}</code>);
    else
      parts.push(<strong key={idx++} className="text-white font-bold">{raw.slice(2, -2)}</strong>);
    last = match.index + raw.length;
  }
  if (last < text.length) parts.push(<span key={idx++}>{text.slice(last)}</span>);
  return parts.length ? parts : text;
}

export default function AIAssistant() {
  const { aiOpen, setAiOpen } = useSocStore();
  const [sessionId] = useState(() => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "**CHAMELEON SOC analyst online.**\n\nI have full visibility into the live deception grid. Ask me about active threats, attack origins, MITRE techniques, recommended actions, or request an executive report." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!aiOpen) return;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 100);
    return () => { document.body.style.overflow = ""; };
  }, [aiOpen]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next = [...messages, { role: "user", text: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await axios.post(`${API}/chat`, { session_id: sessionId, message: trimmed });
      setMessages([...next, { role: "assistant", text: r.data.reply }]);
    } catch {
      setMessages([...next, { role: "assistant", text: "**[Connection failed]**\n\nCould not reach the Chameleon backend. Check that the server is running on port 5000." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!aiOpen) return null;

  return (
    <motion.aside
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      data-testid="ai-assistant-panel"
      className="fixed top-0 right-0 bottom-0 w-[440px] z-50 flex flex-col"
      style={{ background: "rgba(4,8,16,0.97)", borderLeft: "1px solid rgba(57,255,20,0.2)", backdropFilter: "blur(20px)" }}
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 grid place-items-center rounded-sm" style={{ background: "rgba(57,255,20,0.08)", border: "1px solid rgba(57,255,20,0.2)" }}>
            <Bot className="w-4 h-4 text-[#39ff14]" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#39ff14] rounded-full shadow-[0_0_8px_#39ff14] animate-pulse" />
          </div>
          <div>
            <div className="text-white text-sm font-bold tracking-wide">CHAMELEON ANALYST</div>
            <div className="text-[9px] font-mono text-[#39ff14]/60 uppercase tracking-widest">Gemini 1.5 Flash · Live Context</div>
          </div>
        </div>
        <button onClick={() => setAiOpen(false)} data-testid="close-ai" className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-sm transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="text-[9px] font-mono uppercase tracking-widest mb-1.5 px-1" style={{ color: m.role === "user" ? "#39ff14" : "#71717a" }}>
                {m.role === "user" ? "› Analyst" : "⬡ Chameleon"}
              </div>
              <div
                className="px-3.5 py-2.5 rounded-sm text-[12px] leading-relaxed max-w-[95%]"
                style={m.role === "user"
                  ? { background: "rgba(57,255,20,0.08)", border: "1px solid rgba(57,255,20,0.25)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#d4d4d8" }
                }
              >
                {m.role === "assistant"
                  ? <MarkdownText text={m.text} />
                  : <span>{m.text}</span>
                }
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5 px-1">
            <div className="flex gap-1">
              {[0, 1, 2].map(j => (
                <motion.span
                  key={j}
                  className="w-1.5 h-1.5 rounded-full bg-[#39ff14]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Analyzing threat surface…</span>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 pt-2 pb-1 border-t border-white/5 shrink-0">
        <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-1.5">Quick queries</div>
        <div className="flex flex-wrap gap-1.5 max-h-[64px] overflow-hidden">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-sm transition-all disabled:opacity-40"
              style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#71717a" }}
              onMouseEnter={e => { e.target.style.borderColor = "rgba(57,255,20,0.4)"; e.target.style.color = "#39ff14"; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.color = "#71717a"; }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 shrink-0">
        <div className="flex gap-2" style={{ border: "1px solid rgba(57,255,20,0.2)", borderRadius: "2px", background: "rgba(0,0,0,0.4)" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask the analyst…"
            data-testid="ai-input"
            className="flex-1 bg-transparent px-3 py-2.5 text-[12px] font-mono text-white outline-none placeholder:text-zinc-600"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            data-testid="ai-send"
            className="px-3 text-[#39ff14] disabled:opacity-30 transition-opacity hover:bg-[#39ff14]/10"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="text-[8px] font-mono text-zinc-700 mt-1.5 text-center">Press Enter to send · Powered by live SOC telemetry</div>
      </div>
    </motion.aside>
  );
}
