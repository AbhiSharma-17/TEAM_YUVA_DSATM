import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { useSocStore } from "../../store/socStore";

const COUNTRIES_URL = "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";
const EARTH_NIGHT   = "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const EARTH_DAY     = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const BUMP          = "https://unpkg.com/three-globe/example/img/earth-topology.png";
const STARS         = "https://unpkg.com/three-globe/example/img/night-sky.png";
const SPECULAR      = "https://unpkg.com/three-globe/example/img/earth-water.png";

// Eagerly preload textures
if (typeof window !== "undefined" && !window.__globeTexturesPreloaded) {
  window.__globeTexturesPreloaded = true;
  [EARTH_NIGHT, EARTH_DAY, BUMP, STARS, SPECULAR].forEach((u) => {
    const i = new Image(); i.src = u;
  });
}

export default function Globe3D({ onSelect, style = "realistic" }) {
  const { sessions, focusMode, selectedSessionId } = useSocStore();
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const [size, setSize] = useState({ w: 1200, h: 540 });
  const [ready, setReady] = useState(false);
  const [countries, setCountries] = useState({ features: [] });

  useEffect(() => {
    if (style !== "hex") return;
    fetch(COUNTRIES_URL).then((r) => r.json()).then(setCountries).catch(() => {});
  }, [style]);

  // Responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Globe init — smooth inertial controls
  useEffect(() => {
    if (!globeRef.current) return;
    const ctrl = globeRef.current.controls();
    if (ctrl) {
      ctrl.autoRotate       = true;
      ctrl.autoRotateSpeed  = 0.28;     // slower = cinematic
      ctrl.enableZoom       = true;
      ctrl.enableDamping    = true;     // inertial drag feel
      ctrl.dampingFactor    = 0.08;     // smoothness of inertia
      ctrl.rotateSpeed      = 0.5;      // user drag speed
      ctrl.zoomSpeed        = 0.6;
      ctrl.minDistance      = 101;
      ctrl.maxDistance      = 600;
    }
    // Slight tilt for a cinematic starting angle
    globeRef.current.pointOfView({ lat: 18, lng: 25, altitude: 2.2 }, 0);
    const t = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(t);
  }, []);

  // Fly to selected attacker
  useEffect(() => {
    if (!globeRef.current || !selectedSessionId) return;
    const s = sessions.find((x) => x.id === selectedSessionId);
    if (!s) return;
    globeRef.current.pointOfView({ lat: s.src_lat, lng: s.src_lng, altitude: 1.6 }, 1400);
  }, [selectedSessionId, sessions]);

  const visible = useMemo(() => {
    let arr = sessions.filter((s) => s.status === "active");
    if (focusMode && selectedSessionId) arr = arr.filter((s) => s.id === selectedSessionId);
    return arr.slice(0, 30);
  }, [sessions, focusMode, selectedSessionId]);

  // Arc color helpers — bright vivid colors
  const arcColor = (s) => {
    if (s.risk_score >= 80) return ["#ff003c", "#ff003c"];
    if (s.risk_score >= 60) return ["#ff9f1c", "#ff9f1c"];
    return ["#39ff14", "#39ff14"];
  };

  const arcsData = useMemo(() =>
    visible.map((s) => ({
      startLat: s.src_lat,
      startLng: s.src_lng,
      endLat:   s.dst_lat,
      endLng:   s.dst_lng,
      color:    arcColor(s),
      stroke:   s.risk_score >= 80 ? 1.4 : s.risk_score >= 60 ? 1.0 : 0.7,
      session:  s,
    })),
  [visible]);

  const sourceRings = useMemo(() =>
    visible.map((s) => {
      const color = s.risk_score >= 80 ? "#ff003c" : s.risk_score >= 60 ? "#ff9f1c" : "#39ff14";
      return {
        lat: s.src_lat,
        lng: s.src_lng,
        maxR: s.risk_score >= 80 ? 6 : 4,
        propagationSpeed: s.risk_score >= 80 ? 4.5 : 2.8,
        repeatPeriod: s.risk_score >= 80 ? 550 : 950,
        color,
      };
    }),
  [visible]);

  const points = useMemo(() => {
    const arr = [];
    visible.forEach((s) => {
      const color = s.risk_score >= 80 ? "#ff003c" : s.risk_score >= 60 ? "#ff9f1c" : "#39ff14";
      arr.push({ lat: s.src_lat, lng: s.src_lng, size: 0.45, color, type: "src", session: s });
    });
    const seen = new Set();
    visible.forEach((s) => {
      if (!seen.has(s.honeypot_id)) {
        seen.add(s.honeypot_id);
        arr.push({ lat: s.dst_lat, lng: s.dst_lng, size: 0.6, color: "#39ff14", type: "dst", session: s });
      }
    });
    return arr;
  }, [visible]);

  const realistic = style === "realistic";
  // Use night texture (city lights) for a more premium look
  const globeTexture = realistic ? EARTH_NIGHT : "";

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(2,4,12,1)"
        backgroundImageUrl={realistic ? STARS : null}

        // Globe surface — bright blue marble day texture
        globeImageUrl={realistic ? EARTH_DAY : ""}
        bumpImageUrl={realistic ? BUMP : ""}
        showGlobe={true}

        // Atmosphere — more visible, richer glow
        showAtmosphere
        atmosphereColor={realistic ? "#4fa3ff" : "#39ff14"}
        atmosphereAltitude={realistic ? 0.28 : 0.20}

        rendererConfig={{ antialias: true, alpha: false, powerPreference: "high-performance" }}

        // Hex polygons (only when style==='hex')
        hexPolygonsData={style === "hex" ? countries.features : []}
        hexPolygonResolution={3}
        hexPolygonMargin={0.35}
        hexPolygonUseDots={true}
        hexPolygonColor={() => "#39ff14"}
        hexPolygonAltitude={0.006}

        // Arcs — slow, constant dotted flow, no flicker
        arcsData={arcsData}
        arcColor={(d) => d.color}
        arcStroke={(d) => d.stroke}
        arcDashLength={0.02}
        arcDashGap={0.02}
        arcDashAnimateTime={4000}
        arcAltitudeAutoScale={0.45}

        // Rings — tighter, more intense pulses
        ringsData={sourceRings}
        ringColor={(d) => d.color}
        ringMaxRadius={(d) => d.maxR}
        ringPropagationSpeed={(d) => d.propagationSpeed}
        ringRepeatPeriod={(d) => d.repeatPeriod}
        ringAltitude={0.003}

        // Points
        pointsData={points}
        pointLat={(d) => d.lat}
        pointLng={(d) => d.lng}
        pointAltitude={(d) => (d.type === "dst" ? 0.025 : 0.015)}
        pointRadius={(d) => d.size}
        pointColor={(d) => d.color}
        pointResolution={10}
        pointLabel={(d) => {
          const s = d.session;
          if (!s) return "";
          if (d.type === "dst") {
            return `<div style="background:rgba(5,10,20,.95);border:1px solid #39ff1466;color:#fff;padding:8px 12px;font:11px/1.5 JetBrains Mono,monospace;border-radius:4px;box-shadow:0 0 20px #39ff1433">
              <div style="color:#39ff14;font-size:9px;letter-spacing:.2em;margin-bottom:4px">HONEYPOT NODE</div>
              <div style="font-weight:bold">${s.honeypot_name}</div>
            </div>`;
          }
          const color = s.risk_score >= 80 ? "#ff003c" : s.risk_score >= 60 ? "#ff9f1c" : "#39ff14";
          return `<div style="background:rgba(5,10,20,.95);border:1px solid ${color}66;color:#fff;padding:8px 12px;font:11px/1.5 JetBrains Mono,monospace;border-radius:4px;box-shadow:0 0 20px ${color}33">
            <div style="font-size:14px;margin-bottom:4px">${s.flag} <strong>${s.ip}</strong></div>
            <div style="color:#a1a1aa;margin-bottom:2px">${s.country_name}</div>
            <div>Risk <span style="color:${color};font-weight:bold">${s.risk_score}</span> · ${s.stage}</div>
          </div>`;
        }}
        onPointClick={(d) => {
          if (d?.session && onSelect) onSelect(d.session.id);
        }}
      />

      {/* Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#39ff14]/30 border-t-[#39ff14] rounded-full animate-spin" />
            <div className="font-mono text-[10px] text-[#39ff14] uppercase tracking-[0.3em] animate-pulse">
              Initializing Globe…
            </div>
          </div>
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-2 right-3 text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 pointer-events-none">
        {realistic ? "3D · EARTH NIGHT · LIVE THREATS" : "3D · CYBER HEX"}
      </div>
    </div>
  );
}
