import { createContext, useContext, useEffect, useState } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        if (mounted) {
          setUser(false);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (mounted) {
          setUser(data.user || data);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("access_token");
          if (mounted) {
            setUser(false);
          }
        } else {
          // Temporary network error-aaga irunthaal token-ai azhikkamal local fallback user-ai set seyyavendum
          if (mounted && token) {
            setUser({ authenticated: true }); 
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const token = data.access_token || data.token;
    
    if (token) {
      localStorage.setItem("access_token", token);
    }
    setUser(data.user || data);
    return data.user || data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    const token = data.access_token || data.token;
    
    if (token) {
      localStorage.setItem("access_token", token);
    }
    setUser(data.user || data);
    return data.user || data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("access_token");
      setUser(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { formatApiErrorDetail };