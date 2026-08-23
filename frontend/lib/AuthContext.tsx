"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cnic?: string;
  province?: string;
  city?: string;
  education?: string;
  date_of_birth?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("raahai-token");
    const savedUser = localStorage.getItem("raahai-user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try { setUser(JSON.parse(savedUser)); } catch {}
    }
    setLoading(false);
  }, []);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  async function login(email: string, password: string) {
    const res = await fetch(`${API}/api/citizen/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("raahai-token", data.token);
    localStorage.setItem("raahai-user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function register(data: any) {
    const res = await fetch(`${API}/api/citizen/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Registration failed");
    }
    const result = await res.json();
    localStorage.setItem("raahai-token", result.token);
    localStorage.setItem("raahai-user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem("raahai-token");
    localStorage.removeItem("raahai-user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
