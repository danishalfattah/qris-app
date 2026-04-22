"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as api from "./api";

interface AuthSession {
  token: string;
  account_id: string;
  balance: number;
}

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string, initial_balance: number) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("qris_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.account_id && typeof parsed?.balance === "number") {
          setSession(parsed);
        } else {
          localStorage.removeItem("qris_user");
        }
      } catch {
        localStorage.removeItem("qris_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const data = await api.login(username, password);
      setSession(data);
      localStorage.setItem("qris_user", JSON.stringify(data));
      return { success: true, message: "Login berhasil" };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Login gagal" };
    }
  };

  const register = async (username: string, password: string, initial_balance: number) => {
    try {
      const data = await api.register(username, password, initial_balance);
      setSession(data);
      localStorage.setItem("qris_user", JSON.stringify(data));
      return { success: true, message: "Registrasi berhasil" };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Registrasi gagal" };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("qris_user");
  };

  const updateBalance = (newBalance: number) => {
    if (!session) return;
    const updated = { ...session, balance: newBalance };
    setSession(updated);
    localStorage.setItem("qris_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, register, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
