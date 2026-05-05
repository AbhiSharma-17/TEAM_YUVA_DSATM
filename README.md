# 🦎 Chameleon — Adaptive Honeypot Intelligence Platform

> **Hackathon Project · Team YUVA · DSATM**  
> A next-generation, AI-powered honeypot and threat deception platform with real-time attack visualization, MITRE ATT&CK mapping, and an integrated SOC analyst chatbot.

---

## 📌 What is Chameleon?

**Chameleon** is an adaptive honeypot platform that **lures, observes, and analyzes cyber attackers** in real time. Instead of blocking attackers immediately, Chameleon lets them interact with decoy systems (honeypots), silently records everything they do, and uses AI to classify threats, map attack techniques, and recommend responses.

The name "Chameleon" reflects the system's core ability to **dynamically mutate** its honeypots — changing their apparent OS, services, and vulnerabilities to keep attackers engaged longer and gather richer intelligence.

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| 🌍 **Live Global Attack Map** | Real-time 3D globe and world map showing active attack sessions with animated arcs from attacker origin to honeypot |
| 🖥️ **Command Center Dashboard** | Live stats — active intruders, critical alerts, mutation rate, total sessions |
| 🧬 **Adaptive Mutations** | Honeypots automatically change their fingerprint (OS, services, banners) to deceive attackers |
| 🪤 **Honeytoken Tracking** | Fake credentials, AWS keys, and sensitive-looking files that trigger alerts when accessed |
| 🧠 **MITRE ATT&CK Heatmap** | Visualizes which ATT&CK techniques (T1110, T1059, T1046, etc.) are most actively used |
| 💬 **Chameleon Analyst (AI Chatbot)** | Built-in SOC analyst powered by Gemini — answers live questions about active threats with 33 categorized query shortcuts |
| 🎭 **Deception Studio** | Full control panel to manage honeypots, honeytokens, and mutation policies |
| 📋 **Session Intelligence** | Drilldown into each attacker session — commands run, risk score, attack stage, threat actor classification |
| 📊 **Reports** | AI-generated executive summaries and threat intelligence exports |
| 🏆 **CTF Mode** | Capture-the-Flag challenge mode for security training and awareness |
| 📡 **WebSocket Live Feed** | All dashboard data updates in real time via WebSocket — no page refresh needed |
| 🔐 **Authentication** | Phone OTP + OAuth login with 7-day session tokens |

---

## 🏗️ Architecture

```
TEAM_YUVA_DSATM/
└── final-main/
    ├── backend/              # FastAPI Python backend
    │   ├── server.py         # Main server — API, simulator, WebSocket, AI chat
    │   ├── requirements.txt  # Python dependencies
    │   └── .env              # Environment variables (MongoDB, Gemini API key)
    │
    ├── frontend/             # React frontend
    │   ├── src/
    │   │   ├── pages/        # Full page views
    │   │   │   ├── CommandCenter.jsx   # Main dashboard
    │   │   │   ├── Sessions.jsx        # Attacker session list & drilldown
    │   │   │   ├── Deception.jsx       # Honeypot & honeytoken management
    │   │   │   ├── Reports.jsx         # AI-generated reports
    │   │   │   └── CTF.jsx             # Capture The Flag mode
    │   │   ├── components/
    │   │   │   ├── dashboard/          # Globe3D, WorldMap, AttackerPanel, MitreHeatmap
    │   │   │   ├── layout/             # Sidebar, TopNav, AIAssistant (Chameleon Analyst)
    │   │   │   └── ui/                 # Radix UI component library (shadcn)
    │   │   ├── store/
    │   │   │   └── socStore.js         # Zustand global state — sessions, events, WebSocket
    │   │   └── auth/                   # AuthProvider, AuthCallback (OAuth)
    │   ├── package.json
    │   └── tailwind.config.js
    │
    ├── demo/
    │   └── simulate_attack.py   # Script to trigger a live attack demo
    ├── tests/                   # Backend API test suite
    └── .gitignore
```

---

## ⚙️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance Python REST API framework |
| **Uvicorn** | ASGI server with hot-reload |
| **Motor + MongoDB** | Async MongoDB driver for session/event storage |
| **WebSockets** | Real-time push of attack events to frontend |
| **Gemini API** | Powers the Chameleon Analyst AI chatbot |
| **Python-Jose + Bcrypt** | JWT auth and password hashing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **React Router v7** | Client-side routing |
| **Zustand** | Lightweight global state management |
| **Framer Motion** | Smooth page transitions and micro-animations |
| **Recharts** | Charts for stats and MITRE heatmap |
| **Three.js + react-globe.gl** | Interactive 3D attack globe |
| **React Simple Maps** | 2D world map with attack arcs |
| **Tailwind CSS + Radix UI** | Styling and accessible component primitives |
| **Socket.IO Client** | WebSocket connection to backend |
| **Axios** | HTTP client for REST API calls |
| **Firebase** | OAuth authentication backend |

---

## 🛠️ How to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running on `localhost:27017`

---

### 1. Clone the repository

```bash
git clone https://github.com/AbhiSharma-17/TEAM_YUVA_DSATM.git
cd TEAM_YUVA_DSATM/final-main
```

---

### 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python server.py
```

Backend runs at → **http://localhost:8000**  
API Docs (Swagger) → **http://localhost:8000/docs**

#### Environment Variables (`.env`)
```env
MONGO_URL=mongodb://localhost:27017/chameleon
DB_NAME=chameleon
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### 3. Start the Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

Frontend runs at → **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Live stats — intruders, alerts, mutation rate |
| `GET` | `/api/sessions` | All attacker sessions |
| `GET` | `/api/sessions/{id}` | Single session detail |
| `GET` | `/api/events` | Latest 80 attack events |
| `GET` | `/api/honeypots` | All honeypot nodes with session counts |
| `GET` | `/api/mutations` | Recent honeypot mutations |
| `GET` | `/api/honeytokens` | Triggered honeytoken alerts |
| `GET` | `/api/mitre` | MITRE ATT&CK technique hit counts |
| `GET` | `/api/predict/{id}` | AI prediction of next attack stage |
| `POST` | `/api/chat` | Chameleon Analyst AI chat |
| `POST` | `/api/simulate/attack` | Trigger a manual demo attack |
| `POST` | `/api/simulate/command` | Inject a command into a session |
| `WS` | `/api/ws` | WebSocket for live event push |
| `POST` | `/api/auth/phone/verify` | Phone OTP login (demo OTP: `123456`) |
| `GET` | `/api/auth/me` | Get current logged-in user |
| `POST` | `/api/auth/logout` | Logout and clear session |

---

## 🌐 Honeypot Network

Chameleon manages **16 global honeypot nodes** across different countries and service types:

| Type | Examples |
|---|---|
| `SSH_SERVER` | aurora (US) |
| `HTTP_ADMIN` | frankfurt (DE) |
| `SMB_SHARE` | tokyo (JP) |
| `FTP_SERVER` | singapore (SG) |
| `RDP_WINDOWS` | sao-paulo (BR) |
| `IOT_DEVICE` | sydney (AU), iot-device-40 (HK), iot-device-56 (IN) |
| `CLOUD_DASHBOARD` | cloud-dashboard-86 (KR), cloud-dashboard-30 (GB) |
| `CONTAINER_NODE` | container-node-16 (FR) |
| `DATABASE` | database-79 (US), database-94 (JP) |
| `WINDOWS_HOST` | windows-host-44 (NL), windows-host-91 (AU) |
| `LINUX_SERVER` | linux-server-37 (RU) |

---

## 🧠 MITRE ATT&CK Coverage

Chameleon detects and tracks these MITRE ATT&CK techniques:

| ID | Technique |
|---|---|
| T1110 | Brute Force |
| T1059 | Command & Scripting Interpreter |
| T1046 | Network Service Discovery |
| T1078 | Valid Accounts |
| T1505 | Server Software Component |
| T1190 | Exploit Public-Facing Application |
| T1003 | OS Credential Dumping |
| T1486 | Data Encrypted for Impact |

---

## 💬 Chameleon Analyst — AI Query Categories

The built-in SOC analyst chatbot supports **33 queries** across 7 categories:

| Category | Example Queries |
|---|---|
| 🔵 Status | "What is happening right now?", "Show honeypot health status" |
| 🔴 Threat | "Who is the most dangerous attacker?", "Classify current threat actor" |
| 🟣 MITRE | "Show MITRE techniques detected", "Map attack to kill chain phases" |
| 🟢 Deception | "Which honeypot is most engaged?", "What honeytokens were triggered?" |
| 🟠 Response | "What should I do immediately?", "Generate an incident response plan" |
| 🟡 Report | "Generate executive report", "Summarize last 24 hours of activity" |
| ⚪ Info | "Explain how Chameleon works", "What is a honeypot?" |

---

## 🎮 Demo — Simulate a Live Attack

Run this from the project root to trigger a demo attack on the globe:

```bash
python demo/simulate_attack.py
```

Or use the **Command Center** → **Simulate Attack** button in the UI.

---

## 👥 Team

**Team YUVA — DSATM**

Built for hackathon demonstration of adaptive honeypot deception technology and AI-assisted threat intelligence.

---

## 📄 License

This project is built for educational and hackathon purposes.
