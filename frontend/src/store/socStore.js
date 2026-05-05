import { create } from "zustand";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
const WS_URL = process.env.REACT_APP_WS_URL || "ws://127.0.0.1:8000/api/ws";
export const API = `${BACKEND_URL}/api`;

const MAX_EVENTS = 80;
const MAX_MUTATIONS = 30;
const MAX_TOKENS = 30;

export const useSocStore = create((set, get) => ({
  connected: false,
  livePaused: false,
  stats: { active_intruders: 0, total_sessions: 0, critical_alerts: 0, mutation_rate: 0 },
  sessions: [],
  events: [],
  mutations: [],
  honeytokens: [],
  mitre: [],
  honeypots: [],
  selectedSessionId: null,
  focusMode: false,
  ctfMode: false,
  aiOpen: false,
  hybridBrainOpen: false,
  selfLearningOpen: false,
  sidebarCollapsed: false,
  socket: null,

  setConnected: (v) => set({ connected: v }),
  setStats: (s) => set({ stats: s }),
  setSelectedSession: (id) => set({ selectedSessionId: id }),
  setFocusMode: (v) => set({ focusMode: v }),
  setCtfMode: (v) => set({ ctfMode: v }),
  setAiOpen: (v) => set({ aiOpen: v }),
  setHybridBrainOpen: (v) => set({ hybridBrainOpen: v }),
  setSelfLearningOpen: (v) => set({ selfLearningOpen: v }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  upsertSession: (s) => {
    const cur = get().sessions;
    const idx = cur.findIndex((x) => x.id === s.id);
    if (idx >= 0) {
      const next = [...cur];
      next[idx] = { ...next[idx], ...s };
      set({ sessions: next });
    } else {
      set({ sessions: [s, ...cur].slice(0, 60) });
    }
  },

  addEvent: (e) => {
    if (!e || !e.id) return;
    if (get().events.some((x) => x.id === e.id)) return;
    const next = [e, ...get().events].slice(0, MAX_EVENTS);
    set({ events: next });
  },

  addMutation: (m) => {
    if (!m || !m.id) return;
    if (get().mutations.some((x) => x.id === m.id)) return;
    set({ mutations: [m, ...get().mutations].slice(0, MAX_MUTATIONS) });
  },
  addHoneytoken: (t) => {
    if (!t || !t.id) return;
    if (get().honeytokens.some((x) => x.id === t.id)) return;
    set({ honeytokens: [t, ...get().honeytokens].slice(0, MAX_TOKENS) });
  },

  applySnapshot: (data) => {
    const dedupe = (arr) => {
      const seen = new Set();
      return (arr || []).filter((x) => x && x.id && !seen.has(x.id) && seen.add(x.id));
    };
    set({
      stats: data.stats || get().stats,
      sessions: dedupe(data.sessions),
      events: dedupe(data.events),
      mutations: dedupe(data.mutations),
      honeytokens: dedupe(data.honeytokens),
    });
  },

  hydrate: async () => {
    try {
      const [stats, sessions, events, mutations, tokens, mitre, honeypots] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/sessions`),
        axios.get(`${API}/events`),
        axios.get(`${API}/mutations`),
        axios.get(`${API}/honeytokens`),
        axios.get(`${API}/mitre`),
        axios.get(`${API}/honeypots`),
      ]);
      set({
        stats: stats.data,
        sessions: sessions.data,
        events: events.data,
        mutations: mutations.data,
        honeytokens: tokens.data,
        mitre: mitre.data,
        honeypots: honeypots.data,
      });
    } catch (e) {
      console.error("hydrate failed", e);
    }
  },

  refreshMitre: async () => {
    try {
      const r = await axios.get(`${API}/mitre`);
      set({ mitre: r.data });
    } catch {}
  },

  connectWS: () => {
    if (get().socket) return;
    const wsUrl = `${BACKEND_URL.replace(/^http/, "ws")}/api/ws`;
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => set({ connected: true, socket: ws });
    ws.onclose = () => {
      set({ connected: false, socket: null });
      // Only auto-reconnect if not manually paused
      if (!get().livePaused) {
        setTimeout(() => get().connectWS(), 2500);
      }
    };
    ws.onerror = () => {};
    ws.onmessage = (m) => {
      try {
        const msg = JSON.parse(m.data);
        const { event, data } = msg;
        switch (event) {
          case "snapshot":
            get().applySnapshot(data);
            break;
          case "stats":
            set({ stats: data });
            break;
          case "new_session":
            get().upsertSession(data);
            break;
          case "attack_event":
            get().addEvent(data);
            // Also push command into the session's commands array so the terminal panel updates
            {
              const sessions = get().sessions;
              const sidx = sessions.findIndex((s) => s.id === data.session_id);
              if (sidx >= 0) {
                // Extract the raw command text — strip leading "$ " or "[ip] executed: " prefix
                let rawCmd = data.message || "";
                if (rawCmd.startsWith("$ ")) rawCmd = rawCmd.slice(2);
                else if (rawCmd.includes(" executed: ")) rawCmd = rawCmd.split(" executed: ").slice(1).join(" executed: ");
                const isDanger = data.severity === "crit";
                const newCmd = { ts: data.ts, cmd: rawCmd, danger: isDanger };
                const updated = [...sessions];
                updated[sidx] = {
                  ...updated[sidx],
                  commands: [...(updated[sidx].commands || []), newCmd].slice(-30),
                };
                set({ sessions: updated });
              }
            }
            break;
          case "stage_change": {
            const list = get().sessions.map((s) => (s.id === data.session_id ? { ...s, stage: data.to } : s));
            set({ sessions: list });
            break;
          }
          case "session_end": {
            const list = get().sessions.map((s) => (s.id === data.id ? { ...s, status: data.status } : s));
            set({ sessions: list });
            break;
          }
          case "mutation":
            get().addMutation(data);
            break;
          case "honeytoken_triggered":
            get().addHoneytoken(data);
            break;
          default:
            break;
        }
      } catch (e) {
        // ignore
      }
    };
  },
  disconnectWS: () => {
    const ws = get().socket;
    if (ws) {
      set({ livePaused: true });
      ws.close();
      set({ socket: null, connected: false });
    }
  },

  goLive: () => {
    set({ livePaused: false });
    get().connectWS();
  },
}));
