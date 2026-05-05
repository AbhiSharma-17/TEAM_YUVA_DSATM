import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";
const API = `${BACKEND_URL}/api`;

const AuthCtx = createContext(null);

const TOKEN_KEY = "chameleon_session_token";

function applyToken(token) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Hydrate header at module load so api requests carry the token from first paint
if (typeof window !== "undefined") {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      if (!t) throw new Error("No session token");
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setUser({ user_id: res.data.user_id, email: res.data.email, name: res.data.name, picture: res.data.picture });
    } catch (err) {
      applyToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const setAuth = (data) => {
    if (data?.session_token) applyToken(data.session_token);
    setUser({ user_id: data.user_id, email: data.email, name: data.name, picture: data.picture });
  };

  const logout = async () => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      await axios.post(`${API}/auth/logout`, {}, t ? { headers: { Authorization: `Bearer ${t}` } } : {});
    } catch {}
    applyToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const loginWithPhone = async (phone, code) => {
    try {
      const res = await axios.post(`${API}/auth/phone/verify`, { phone, code });
      setAuth(res.data);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <AuthCtx.Provider value={{ user, loading, setUser: setAuth, refresh: checkAuth, logout, loginWithPhone }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
