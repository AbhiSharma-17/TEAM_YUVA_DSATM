import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { geoMercator } from "d3-geo";
import { useSocStore } from "../../store/socStore";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function curve(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (!len) return `M ${x1},${y1}`;
  // Curve bulge perpendicular to the line, scaled by distance, biased upward
  const bulge = Math.min(0.32, 80 / len + 0.18);
  const cx = mx + (-dy / len) * len * bulge;
  const cy = my + (dx / len) * len * bulge - Math.min(60, len * 0.18);
  return `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`;
}

export default function WorldMap({ onSelect }) {
  const { sessions, focusMode, selectedSessionId } = useSocStore();
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 1200, h: 540 });
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Single Mercator projection used for both the country geographies and the markers
  const projection = useMemo(() => {
    const scale = size.w / (2 * Math.PI);
    return geoMercator()
      .scale(scale)
      .translate([size.w / 2, size.h / 1.55]);
  }, [size.w, size.h]);

  const visible = useMemo(() => {
    let arr = sessions.filter((s) => s.status === "active");
    if (focusMode && selectedSessionId) {
      arr = arr.filter((s) => s.id === selectedSessionId);
    }
    return arr.slice(0, 30);
  }, [sessions, focusMode, selectedSessionId]);

  const arcs = useMemo(
    () =>
      visible
        .map((s) => {
          const src = projection([s.src_lng, s.src_lat]);
          const dst = projection([s.dst_lng, s.dst_lat]);
          if (!src || !dst) return null;
          return { s, src, dst };
        })
        .filter(Boolean),
    [visible, projection]
  );

  // Unique honeypot destinations
  const honeypotDots = useMemo(() => {
    const seen = new Map();
    visible.forEach((s) => {
      if (!seen.has(s.honeypot_id)) {
        const p = projection([s.dst_lng, s.dst_lat]);
        if (p) seen.set(s.honeypot_id, { id: s.honeypot_id, name: s.honeypot_name, x: p[0], y: p[1] });
      }
    });
    return Array.from(seen.values());
  }, [visible, projection]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Subtle grid */}
      <svg className="absolute inset-0 pointer-events-none opacity-30" width="100%" height="100%">
        <defs>
          <pattern id="map-grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(57,255,20,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-grid)" />
      </svg>

      <ComposableMap
        projection={projection}
        width={size.w}
        height={size.h}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: "rgba(57,255,20,0.04)",
                    stroke: "rgba(57,255,20,0.45)",
                    strokeWidth: 0.6,
                    outline: "none",
                  },
                  hover: { fill: "rgba(57,255,20,0.12)", stroke: "rgba(57,255,20,0.85)", strokeWidth: 0.8, outline: "none" },
                  pressed: { fill: "rgba(57,255,20,0.18)", outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>

      {/* Arcs layer */}
      <svg className="absolute inset-0 pointer-events-none" width={size.w} height={size.h}>
        <defs>
          <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff003c" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#ff003c" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ff9f1c" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="arc-grad-safe" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#39ff14" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#39ff14" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {arcs.map(({ s, src, dst }) => {
          const isCrit = s.risk_score >= 80;
          return (
            <path
              key={`arc-${s.id}`}
              d={curve(src[0], src[1], dst[0], dst[1])}
              fill="none"
              stroke={isCrit ? "url(#arc-grad)" : "url(#arc-grad-safe)"}
              strokeWidth={isCrit ? 1.8 : 1.2}
              strokeDasharray="5 7"
              style={{
                animation: `arc-flow 1.6s linear infinite`,
                filter: `drop-shadow(0 0 6px ${isCrit ? "#ff003c" : "#39ff14"})`,
              }}
            />
          );
        })}
      </svg>

      {/* Honeypot markers */}
      <div className="absolute inset-0 pointer-events-none">
        {honeypotDots.map((h) => (
          <div
            key={`hp-${h.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: h.x, top: h.y }}
          >
            <span className="block w-3 h-3 rounded-sm bg-[#39ff14]/30 border border-[#39ff14] shadow-[0_0_10px_#39ff14]" />
          </div>
        ))}
      </div>

      {/* Source attacker markers (clickable) */}
      <div className="absolute inset-0">
        {arcs.map(({ s, src }) => {
          const isCrit = s.risk_score >= 80;
          const color = isCrit ? "#ff003c" : s.risk_score >= 60 ? "#ff9f1c" : "#39ff14";
          return (
            <button
              key={`src-${s.id}`}
              data-testid={`map-attacker-${s.id}`}
              onClick={() => onSelect && onSelect(s.id)}
              onMouseEnter={() => setHover({ s, x: src[0], y: src[1] })}
              onMouseLeave={() => setHover(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: src[0], top: src[1] }}
            >
              <span className="relative block w-3 h-3">
                <span
                  className="absolute inset-0 rounded-full animate-ping-slow"
                  style={{ background: color, opacity: 0.55 }}
                />
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ background: color, boxShadow: `0 0 14px ${color}` }}
                />
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 pointer-events-none glass-strong px-3 py-2 rounded-sm font-mono text-[11px] min-w-[200px]"
            style={{ left: Math.min(hover.x + 14, size.w - 220), top: Math.max(hover.y - 80, 8) }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{hover.s.flag}</span>
              <span className="text-white font-semibold">{hover.s.ip}</span>
            </div>
            <div className="text-zinc-400">{hover.s.country_name}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="label-mono">Risk</span>
              <span
                className="font-bold"
                style={{ color: hover.s.risk_score >= 80 ? "#ff003c" : hover.s.risk_score >= 60 ? "#ff9f1c" : "#39ff14" }}
              >
                {hover.s.risk_score}
              </span>
            </div>
            <div className="mt-0.5">
              <span className="label-mono">Stage</span> <span className="text-white ml-1">{hover.s.stage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-2 right-3 text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600">
        2D · Mercator Projection
      </div>
    </div>
  );
}
