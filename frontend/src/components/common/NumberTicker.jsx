import { useEffect, useRef, useState } from "react";

export function NumberTicker({ value, color = "#fff", className = "" }) {
  const [display, setDisplay] = useState(value || 0);
  const prev = useRef(value || 0);

  useEffect(() => {
    const start = prev.current;
    const end = Number(value) || 0;
    if (start === end) return;
    const dur = 600;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (k < 1) raf = requestAnimationFrame(tick);
      else prev.current = end;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span className={`stat-num ${className}`} style={{ color, textShadow: `0 0 14px ${color}55` }}>
      {Number.isFinite(display) ? display.toLocaleString() : "0"}
    </span>
  );
}
