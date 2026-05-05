import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import { FileText, Download, RefreshCw, Loader2 } from "lucide-react";
import { API } from "../store/socStore";

const RANGES = [
  { v: 5, label: "5 min" },
  { v: 30, label: "30 min" },
  { v: 60, label: "1 hr" },
  { v: 240, label: "4 hr" },
  { v: 1440, label: "24 hr" },
];

function MarkdownLite({ text }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((l, i) => {
        if (l.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-[#39ff14] mt-5 mb-1 tracking-tight">{l.slice(3)}</h2>;
        if (l.startsWith("# ")) return <h1 key={i} className="text-2xl font-black text-white">{l.slice(2)}</h1>;
        if (l.startsWith("- ")) return <li key={i} className="ml-5 list-disc text-zinc-200 text-[13.5px]">{l.slice(2)}</li>;
        if (l.match(/^\d+\.\s/)) return <li key={i} className="ml-5 list-decimal text-zinc-200 text-[13.5px]">{l.replace(/^\d+\.\s/, "")}</li>;
        if (!l.trim()) return <div key={i} className="h-1" />;
        return <p key={i} className="text-zinc-300 text-[13.5px] leading-relaxed">{l}</p>;
      })}
    </div>
  );
}

export default function Reports() {
  const [range, setRange] = useState(60);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/report/generate`, { range_minutes: range });
      setReport(r.data);
    } catch (e) {
      setReport({ body: "[generation failed]", generated_at: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = () => {
    if (!report) return;
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 48;
    let y = margin;

    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, 80, "F");
    doc.setTextColor(57, 255, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CHAMELEON · Executive Threat Report", margin, 48);
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(`Range: last ${range} minutes · Generated ${new Date(report.generated_at).toLocaleString()}`, margin, 64);

    y = 110;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const lines = report.body.split("\n");
    for (let line of lines) {
      // Robustly sanitize text for jsPDF: Strip ALL non-ASCII characters, replace bold, backticks
      line = line.replace(/[^\x00-\x7F]/g, "").replace(/\*\*/g, "").replace(/`/g, "'");
      
      if (y > 800) { doc.addPage(); y = margin; }
      if (line.startsWith("## ")) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(20, 120, 20);
        const text = doc.splitTextToSize(line.slice(3), pageWidth - margin * 2);
        doc.text(text, margin, y);
        y += text.length * 16 + 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
      } else {
        const text = doc.splitTextToSize(line, pageWidth - margin * 2);
        doc.text(text, margin, y);
        y += text.length * 14;
      }
    }
    doc.save(`chameleon-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to export PDF. Error: " + err.message);
    }
  };

  return (
    <div className="px-5 py-4 space-y-4">
      <div className="glass rounded-md p-5 flex flex-wrap items-center gap-3" data-testid="report-controls">
        <FileText className="w-5 h-5 text-[#39ff14]" />
        <div>
          <div className="text-white font-bold text-base">Executive Threat Report</div>
          <div className="text-[11px] text-zinc-500 font-mono">LLM-generated · Claude Sonnet 4.5</div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1 p-1 rounded-sm border border-white/10 bg-black/40">
          {RANGES.map((r) => (
            <button
              key={r.v}
              onClick={() => setRange(r.v)}
              data-testid={`range-${r.v}`}
              className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                range === r.v ? "bg-[#39ff14]/15 text-[#39ff14]" : "text-zinc-400 hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button onClick={generate} disabled={loading} data-testid="generate-report" className="btn-neon flex items-center gap-2">
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating</> : <><RefreshCw className="w-3.5 h-3.5" /> Generate Report</>}
        </button>
        <button onClick={exportPdf} disabled={!report} data-testid="export-pdf" className="btn-neon flex items-center gap-2 disabled:opacity-40">
          <Download className="w-3.5 h-3.5" /> Export PDF
        </button>
      </div>

      <motion.div
        key={report?.id || "empty"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-md max-w-3xl mx-auto"
        data-testid="report-document"
      >
        <div className="px-8 pt-8 pb-4 border-b border-white/5">
          <div className="label-mono mb-2">Confidential · SOC Internal</div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Chameleon Threat Report</h1>
          <div className="text-[11px] text-zinc-500 font-mono mt-1">
            {report ? `Generated ${new Date(report.generated_at).toLocaleString()} · last ${report.range_minutes}m window` : "no report generated yet"}
          </div>
        </div>
        <div className="px-8 py-6">
          {!report && (
            <div className="text-zinc-500 text-sm font-mono">
              Select a time window and click <span className="text-[#39ff14]">Generate Report</span> to produce a board-ready threat assessment.
            </div>
          )}
          {report && (
            <>
              {report.snapshot && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <Stat label="Sessions" value={report.snapshot.session_count} />
                  <Stat label="Critical" value={report.snapshot.stats.critical_alerts} color="#ff003c" />
                  <Stat label="Active" value={report.snapshot.stats.active_intruders} color="#ff9f1c" />
                  <Stat label="Mutations/min" value={report.snapshot.stats.mutation_rate} color="#00f0ff" />
                </div>
              )}
              <MarkdownLite text={report.body} />
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value, color = "#39ff14" }) {
  return (
    <div className="border border-white/5 p-3 rounded-sm">
      <div className="label-mono">{label}</div>
      <div className="font-mono font-bold text-xl mt-1" style={{ color, textShadow: `0 0 6px ${color}55` }}>{value}</div>
    </div>
  );
}
