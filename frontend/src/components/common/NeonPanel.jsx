import { motion } from "framer-motion";

export function NeonPanel({ children, className = "", title, accent = "green", testId }) {
  const ring = accent === "red"
    ? "border-[#ff003c]/15 hover:border-[#ff003c]/30"
    : accent === "amber"
    ? "border-[#ff9f1c]/15 hover:border-[#ff9f1c]/30"
    : "border-[#39ff14]/10 hover:border-[#39ff14]/30";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      data-testid={testId}
      className={`glass relative ${ring} transition-colors rounded-md ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="label-mono">{title}</div>
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function AccentDot({ color = "#39ff14", size = 8, pulse = false, className = "" }) {
  return (
    <span
      className={`inline-block rounded-full ${className}`}
      style={{
        background: color,
        width: size,
        height: size,
        boxShadow: `0 0 ${pulse ? "12px" : "6px"} ${color}`,
      }}
    />
  );
}

export function StatNumber({ value, suffix = "", color = "#fff" }) {
  return (
    <span className="stat-num" style={{ color, textShadow: `0 0 12px ${color}55` }}>
      {value}
      {suffix && <span className="text-base font-medium opacity-60 ml-1">{suffix}</span>}
    </span>
  );
}

export function SectionLabel({ children, accent = "#39ff14" }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-[2px] w-3" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} />
      <span className="label-mono">{children}</span>
    </div>
  );
}
