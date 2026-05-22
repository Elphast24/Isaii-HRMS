import { createContext, useContext, useState, useEffect } from "react";
import { getMeAPI, logoutAPI } from "../service/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("hrms_token");
      if (token) {
        try {
          const res = await getMeAPI();
          setUser(res.data.user);
        } catch {
          localStorage.removeItem("hrms_token");
          localStorage.removeItem("hrms_user");
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("hrms_token", token);
    localStorage.setItem("hrms_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch {
      // Silent fail
    } finally {
      localStorage.removeItem("hrms_token");
      localStorage.removeItem("hrms_user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};