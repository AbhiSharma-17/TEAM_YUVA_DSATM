import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import AIAssistant from "@/components/layout/AIAssistant";
import HybridBrainModal from "@/components/dashboard/HybridBrainModal";
import SelfLearningPanel from "@/components/layout/SelfLearningEngine";
import CommandCenter from "@/pages/CommandCenter";
import Sessions from "@/pages/Sessions";
import Deception from "@/pages/Deception";
import Reports from "@/pages/Reports";
import CTF from "@/pages/CTF";
import Login from "@/pages/Login";
import { useSocStore } from "@/store/socStore";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";
import AuthCallback from "@/auth/AuthCallback";
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="font-mono text-[#39ff14] uppercase tracking-[0.3em] text-xs animate-pulse">
          Verifying credentials…
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function ShellRoutes() {
  const { hydrate, connectWS, sidebarCollapsed, livePaused, goLive } = useSocStore();
  useEffect(() => {
    hydrate();
    connectWS();
    // eslint-disable-next-line
  }, []);

  const padLeft = sidebarCollapsed ? "pl-[72px]" : "pl-[244px]";
  return (
    <div className="min-h-screen text-zinc-100">
      <Sidebar />
      <AIAssistant />
      <HybridBrainModal />
      <SelfLearningPanel />
      <main className={`${padLeft} pb-12 transition-[padding] duration-300 relative`}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageWrapper><CommandCenter /></PageWrapper>} />
            <Route path="/sessions" element={<PageWrapper><Sessions /></PageWrapper>} />
            <Route path="/deception" element={<PageWrapper><Deception /></PageWrapper>} />
            <Route path="/reports" element={<PageWrapper><Reports /></PageWrapper>} />
            <Route path="/ctf" element={<PageWrapper><CTF /></PageWrapper>} />
          </Routes>
        </AnimatePresence>

        {/* Paused overlay — covers all data when live feed is off */}
        <AnimatePresence>
          {livePaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center"
              style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center gap-5 text-center px-8"
              >
                {/* Offline indicator */}
                <div className="w-16 h-16 rounded-full grid place-items-center border border-[#ff003c]/30 bg-[#ff003c]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#ff003c" strokeWidth="1.8">
                    <line x1="1" y1="1" x2="23" y2="23"/>
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>
                  </svg>
                </div>

                <div>
                  <div className="text-white font-bold text-xl tracking-widest uppercase mb-1">Live Feed Paused</div>
                  <div className="text-zinc-500 font-mono text-sm">
                    Real-time telemetry is disconnected.<br />Data shown is frozen from last update.
                  </div>
                </div>

                <button
                  onClick={() => goLive()}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-sm font-mono text-sm uppercase tracking-[0.2em] transition-all"
                  style={{
                    background: "rgba(57,255,20,0.1)",
                    border: "1px solid rgba(57,255,20,0.5)",
                    color: "#39ff14",
                    boxShadow: "0 0 20px rgba(57,255,20,0.15)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(57,255,20,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(57,255,20,0.15)"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#39ff14" strokeWidth="2">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>
                  </svg>
                  Go Live
                </button>

                <div className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                  WebSocket feed disconnected · click to reconnect
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}


function AppRouter() {
  const location = useLocation();
  // Detect Emergent OAuth callback fragment synchronously during render
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ShellRoutes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
