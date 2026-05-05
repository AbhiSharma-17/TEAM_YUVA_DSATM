import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthProvider";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:5000";
const API = `${BACKEND_URL}/api`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) {
      navigate("/login", { replace: true });
      return;
    }
    const session_id = decodeURIComponent(m[1]);

    (async () => {
      try {
        const r = await axios.post(`${API}/auth/session`, { session_id });
        setUser(r.data);
        // Clean hash
        window.history.replaceState(null, "", window.location.pathname);
        navigate("/", { replace: true, state: { user: r.data } });
      } catch (e) {
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="font-mono text-[#39ff14] uppercase tracking-[0.3em] text-xs animate-pulse">
        Establishing secure session…
      </div>
    </div>
  );
}
