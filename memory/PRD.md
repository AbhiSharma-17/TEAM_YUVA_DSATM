# Chameleon Adaptive Honeypot — PRD

## Original Problem Statement
Production-level React frontend (+ supporting FastAPI backend) for a cybersecurity platform called "Chameleon Adaptive Honeypot": an AI-powered adaptive honeypot that mutates environments and analyzes attackers in real-time.

## User Choices Captured
- Backend: FastAPI + WebSocket simulator
- AI chat & reports: Claude Sonnet 4.5 via Emergent LLM key
- Map: 2D + realistic 3D Blue Marble + cyber Hex globe (3 modes)
- CTF: Persisted leaderboard with backend
- **Auth: Emergent Google Social Login** (added in iteration 3)
- **Sidebar navigation** (added in iteration 3)

## Personas
SOC Analyst · Threat Hunter · Deception Engineer · CISO · CTF participants

## Architecture
- React (CRA) + Tailwind + Framer Motion + Zustand + react-globe.gl + react-simple-maps
- FastAPI + Motor (MongoDB) + WebSockets + emergentintegrations LLM + httpx (Emergent Auth)
- Auth via Bearer token in localStorage (chosen over httpOnly cookie due to K8s ingress overriding `Access-Control-Allow-Origin: *` with `credentials: true`)

## Implemented (latest 2026-02-04)
### Backend
- Auth: `POST /api/auth/session` (exchange Emergent session_id), `GET /api/auth/me`, `POST /api/auth/logout` — accepts Bearer header OR cookie
- Simulator: maintains 6–18 active sessions, GC > 60
- REST: stats, sessions, events, honeypots, mutations, honeytokens, mitre, predict
- LLM: chat, lure/generate, report/generate
- CTF: score upsert, leaderboard
- WebSocket /api/ws

### Frontend
- **Auth flow**: `Login` (Google) → `AuthCallback` (URL fragment session_id → POST /api/auth/session → store Bearer) → `ProtectedRoute`
- **Sidebar nav** (collapsible) replacing top nav: Command Center, Sessions, Deception, Reports, CTF + AI Analyst + CTF toggle + user profile + logout
- **Globe modes**: `Earth` (NASA Blue Marble + stars), `Hex` (cyberpunk neon dots), `2D` (Mercator with neon arcs). Textures pre-loaded for instant render.
- Cinematic terminal replay, attacker panel, MITRE heatmap, deception fabric + AI lure modal, executive reports + jsPDF export, CTF leaderboard

## Test Status
- Backend: 16/16 endpoints (iter 1)
- Frontend: full flow verified visually (login → dashboard → CTF submit → report generation)

## Backlog
- P1: Rate-limit LLM endpoints
- P1: Persist sessions/events to MongoDB
- P2: Auto-zoom-to-attacker camera animation in 3D mode
- P2: Time-range slider on Command Center map
- P3: Slack-shareable threat briefing card every 15 min
