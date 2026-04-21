# API Spec Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sesuaikan QRIS UI dengan API spec — buat `lib/api.ts` berisi mock data sesuai format API, update auth context, sesuaikan UI di semua halaman, hapus halaman tanpa endpoint.

**Architecture:** API service layer terpusat di `lib/api.ts` dengan mock data internal (delay ≤100ms). `lib/auth.tsx` menyimpan `token`, `account_id`, `balance`. Semua halaman membaca data dari auth context atau memanggil fungsi dari `lib/api.ts` — tidak ada fetch langsung di komponen.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui v4

---

## File Map

| File | Action | Keterangan |
|------|--------|------------|
| `lib/types.ts` | Modifikasi | Ganti semua tipe dengan tipe sesuai API spec |
| `lib/api.ts` | Buat baru | Semua fungsi API dengan mock data internal |
| `lib/auth.tsx` | Modifikasi | Pakai `api.ts`, simpan `token`+`account_id`+`balance`, tambah `register` dan `updateBalance` |
| `lib/mock-data.ts` | Hapus | Mock dipindah ke `lib/api.ts` |
| `app/login/page.tsx` | Modifikasi | Email → username, tambah link register, hapus demo credentials |
| `app/register/page.tsx` | Buat baru | Form register dengan username, password, initial_balance |
| `app/scan/result/page.tsx` | Modifikasi | Pakai `api.ts` untuk inquiry+payment+polling, field sesuai API spec |
| `app/page.tsx` | Modifikasi | Balance dari auth context, hapus recent transactions |
| `app/profile/page.tsx` | Modifikasi | Tampilkan account_id + balance dari context, hapus field yang tidak ada di API |
| `components/BottomNav.tsx` | Modifikasi | Hapus link `/history` dan `/balance` |
| `app/history/` | Hapus | Tidak ada user history endpoint |
| `app/balance/` | Hapus | Tidak ada balance endpoint |
| `app/e-statement/` | Hapus | Tidak ada endpoint pendukung |

---

## Task 1: Update `lib/types.ts`

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Ganti seluruh isi `lib/types.ts`**

```typescript
// ============ Auth Types ============
export interface AuthResponse {
  token: string;
  account_id: string;
  balance: number;
}

// ============ QRIS Inquiry Types ============
export interface InquiryResponse {
  merchant_id: string;
  merchant_name: string;
  terminal_id: string;
  city: string;
  fixed_amount: number;
  inquiry_id: string;
}

// ============ Payment Types ============
export interface PaymentResponse {
  status: string;
  transaction_id: string;
  message: string;
  estimated_completion: string;
}

// ============ Transaction Status Types ============
export interface TransactionStatusResponse {
  transaction_id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  final_balance: number;
  timestamp: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "refactor: replace types with API spec aligned types"
```

---

## Task 2: Buat `lib/api.ts` dengan mock data

**Files:**
- Create: `lib/api.ts`

- [ ] **Step 1: Buat file `lib/api.ts`**

```typescript
import type {
  AuthResponse,
  InquiryResponse,
  PaymentResponse,
  TransactionStatusResponse,
} from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  await delay(80);
  if (!username || !password) {
    throw new Error("Username dan password wajib diisi");
  }
  return {
    token: "mock-jwt-token-" + username,
    account_id: "ACC-" + username.toUpperCase(),
    balance: 1000000,
  };
}

export async function register(
  username: string,
  password: string,
  initial_balance: number
): Promise<AuthResponse> {
  await delay(80);
  if (!username || !password) {
    throw new Error("Username dan password wajib diisi");
  }
  if (initial_balance < 0) {
    throw new Error("Saldo awal tidak boleh negatif");
  }
  return {
    token: "mock-jwt-token-" + username,
    account_id: "ACC-" + username.toUpperCase(),
    balance: initial_balance,
  };
}

export async function inquiryByPayload(
  qris_payload: string,
  _token: string
): Promise<InquiryResponse> {
  await delay(80);
  return {
    merchant_id: "MRC001",
    merchant_name: "Warung Makan Sederhana",
    terminal_id: "TRM001",
    city: "Jakarta",
    fixed_amount: 25000,
    inquiry_id: "INQ-" + Date.now(),
  };
}

export async function inquiryByImage(
  _imageFile: File,
  _token: string
): Promise<InquiryResponse> {
  await delay(100);
  return {
    merchant_id: "MRC002",
    merchant_name: "Toko Serba Ada",
    terminal_id: "TRM002",
    city: "Bandung",
    fixed_amount: 0,
    inquiry_id: "INQ-" + Date.now(),
  };
}

export async function createPayment(
  inquiry_id: string,
  amount: number,
  pincode: string,
  _token: string
): Promise<PaymentResponse> {
  await delay(80);
  if (pincode.length !== 6) {
    throw new Error("PIN harus 6 digit");
  }
  if (amount <= 0) {
    throw new Error("Jumlah pembayaran harus lebih dari 0");
  }
  return {
    status: "PENDING",
    transaction_id: "TRX-" + Date.now(),
    message: "Pembayaran sedang diproses",
    estimated_completion: new Date(Date.now() + 5000).toISOString(),
  };
}

export async function getTransactionStatus(
  transaction_id: string,
  _token: string
): Promise<TransactionStatusResponse> {
  await delay(80);
  return {
    transaction_id,
    status: "SUCCESS",
    final_balance: 975000,
    timestamp: new Date().toISOString(),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/api.ts
git commit -m "feat: add api service layer with mock data"
```

---

## Task 3: Update `lib/auth.tsx`

**Files:**
- Modify: `lib/auth.tsx`

- [ ] **Step 1: Ganti seluruh isi `lib/auth.tsx`**

```typescript
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
        setSession(JSON.parse(stored));
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/auth.tsx
git commit -m "refactor: update auth context to use api.ts, add register and updateBalance"
```

---

## Task 4: Update `components/BottomNav.tsx`

**Files:**
- Modify: `components/BottomNav.tsx`

- [ ] **Step 1: Hapus link `/history` dan `/balance`, pertahankan Home, Scan QR, Profile**

Ganti array `navItems` menjadi:

```typescript
const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/scan", icon: ScanLine, label: "Scan QR", isCenter: true },
  { href: "/profile", icon: User, label: "Profil" },
];
```

Hapus juga import `History` dan `Wallet` dari `lucide-react` di baris 5 karena tidak dipakai lagi.

Baris 5 menjadi:
```typescript
import { Home, ScanLine, User } from "lucide-react";
```

- [ ] **Step 2: Commit**

```bash
git add components/BottomNav.tsx
git commit -m "refactor: remove history and balance nav items from BottomNav"
```

---

## Task 5: Hapus folder yang tidak memiliki endpoint

**Files:**
- Delete: `app/history/`
- Delete: `app/balance/`
- Delete: `app/e-statement/`
- Delete: `lib/mock-data.ts`

- [ ] **Step 1: Hapus folder dan file yang tidak diperlukan**

```bash
rm -rf "app/history"
rm -rf "app/balance"
rm -rf "app/e-statement"
rm "lib/mock-data.ts"
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove pages and mock-data with no API backing"
```

---

## Task 6: Update `app/login/page.tsx`

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Ganti seluruh isi `app/login/page.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, QrCode, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/");
    }
  }, [session, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(username, password);

    if (result.success) {
      router.replace("/");
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;
  if (session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Section */}
      <div className="octo-gradient px-6 pt-14 pb-12 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-20 right-10 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-octo-red" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              QRIS Pay
            </span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Selamat Datang! 👋</h1>
          <p className="text-white/70 text-sm">
            Login untuk mulai bertransaksi dengan QRIS
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 px-6 mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-octo-gray-700">
                Username
              </label>
              <Input
                id="username-input"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl border-octo-gray-200 focus:border-octo-red focus:ring-octo-red/20 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-octo-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-octo-gray-200 focus:border-octo-red focus:ring-octo-red/20 pr-12 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-octo-gray-400 hover:text-octo-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-octo-red-600 to-octo-red-800 hover:from-octo-red-700 hover:to-octo-red text-white font-semibold text-sm shadow-lg shadow-octo-red/25 transition-all duration-200 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center fade-in">
          <p className="text-sm text-octo-gray-500">
            Belum punya akun?{" "}
            <Link href="/register" className="text-octo-red font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 mb-6">
          <div className="flex items-center gap-1.5 text-octo-gray-400 text-xs">
            <QrCode className="w-4 h-4" />
            <span>Powered by QRIS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: update login page to use username field and add register link"
```

---

## Task 7: Buat `app/register/page.tsx`

**Files:**
- Create: `app/register/page.tsx`

- [ ] **Step 1: Buat file `app/register/page.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, QrCode, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/");
    }
  }, [session, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError("Username hanya boleh huruf dan angka");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    const balance = parseFloat(initialBalance);
    if (isNaN(balance) || balance < 0) {
      setError("Saldo awal tidak boleh negatif");
      return;
    }

    setIsSubmitting(true);
    const result = await register(username, password, balance);

    if (result.success) {
      router.replace("/");
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;
  if (session) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Section */}
      <div className="octo-gradient px-6 pt-14 pb-12 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-20 right-10 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-octo-red" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              QRIS Pay
            </span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Buat Akun Baru</h1>
          <p className="text-white/70 text-sm">
            Daftar untuk mulai bertransaksi dengan QRIS
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 px-6 mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-octo-gray-700">
                Username
              </label>
              <Input
                id="username-input"
                type="text"
                placeholder="Hanya huruf dan angka"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl border-octo-gray-200 focus:border-octo-red focus:ring-octo-red/20 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-octo-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-octo-gray-200 focus:border-octo-red focus:ring-octo-red/20 pr-12 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-octo-gray-400 hover:text-octo-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-octo-gray-700">
                Saldo Awal
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-octo-gray-400 text-sm font-medium">
                  Rp
                </span>
                <Input
                  id="balance-input"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="h-12 pl-10 rounded-xl border-octo-gray-200 focus:border-octo-red focus:ring-octo-red/20 text-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 fade-in">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-octo-red-600 to-octo-red-800 hover:from-octo-red-700 hover:to-octo-red text-white font-semibold text-sm shadow-lg shadow-octo-red/25 transition-all duration-200 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Mendaftar...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center fade-in">
          <p className="text-sm text-octo-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-octo-red font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 mb-6">
          <div className="flex items-center gap-1.5 text-octo-gray-400 text-xs">
            <QrCode className="w-4 h-4" />
            <span>Powered by QRIS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/register/page.tsx
git commit -m "feat: add register page with username, password, initial_balance"
```

---

## Task 8: Update `app/page.tsx` (Home)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Ganti seluruh isi `app/page.tsx`**

```typescript
"use client";

import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { getGreeting, formatCurrency } from "@/lib/format";
import Link from "next/link";
import { ScanLine, QrCode, Bell, Search, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const { session } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  if (!session) {
    return <AppShell><div /></AppShell>;
  }

  const greeting = getGreeting();

  return (
    <AppShell>
      {/* Header */}
      <div className="octo-gradient px-5 pt-4 pb-8 rounded-b-[1.5rem] relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute bottom-0 right-20 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative z-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-octo-red" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                QRIS Pay
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors relative">
                <Bell className="w-5 h-5" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-octo-gold rounded-full" />
              </button>
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-4">
            <p className="text-white/70 text-sm">{greeting},</p>
            <h1 className="text-white font-bold text-xl">{session.account_id}</h1>
          </div>

          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/70 text-xs font-medium">Saldo Tersedia</p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-white font-bold text-2xl tracking-tight">
              {showBalance ? formatCurrency(session.balance) : "Rp ••••••••"}
            </p>
            <p className="text-white/50 text-xs mt-1 font-mono">{session.account_id}</p>
          </div>
        </div>
      </div>

      {/* QRIS Banner */}
      <div className="px-5 -mt-3 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 px-4 py-3 flex items-center gap-2 fade-in">
          <QrCode className="w-5 h-5 text-octo-red shrink-0" />
          <p className="text-xs text-octo-gray-600">
            <span className="font-semibold text-octo-gray-800">QRIS</span>{" "}
            diterima di <span className="font-medium">🇹🇭 Thailand</span>{" "}
            <span className="font-medium">🇸🇬 Singapore</span>{" "}
            <span className="font-medium">🇲🇾 Malaysia</span>{" "}
            <span className="font-medium">🇯🇵 Japan</span>
          </p>
        </div>
      </div>

      {/* Scan CTA */}
      <div className="px-5 mt-5">
        <Link
          href="/scan"
          className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-octo-gray-100 px-4 py-4 hover:bg-octo-gray-50 transition-colors active:scale-[0.99] fade-in"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-octo-red-600 to-octo-red-800 rounded-xl flex items-center justify-center shadow-md">
            <ScanLine className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-octo-gray-900">Scan QR Code</p>
            <p className="text-xs text-octo-gray-500 mt-0.5">Bayar dengan scan QRIS merchant</p>
          </div>
        </Link>
      </div>

      {/* Promo Banner */}
      <div className="px-5 mt-5 mb-4">
        <div className="bg-gradient-to-r from-octo-red-50 to-amber-50 rounded-2xl p-4 border border-octo-red-100 fade-in fade-in-delay-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-octo-red rounded-xl flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-octo-gray-900">Promo QRIS</p>
              <p className="text-xs text-octo-gray-600 mt-0.5 leading-relaxed">
                Dapatkan cashback hingga 50% untuk transaksi pertama menggunakan QRIS!
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "refactor: home page reads balance from auth context, remove mock transactions"
```

---

## Task 9: Update `app/profile/page.tsx`

**Files:**
- Modify: `app/profile/page.tsx`

- [ ] **Step 1: Ganti seluruh isi `app/profile/page.tsx`**

```typescript
"use client";

import { useAuth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import { User, LogOut, QrCode } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function ProfilePage() {
  const { session, logout } = useAuth();
  const router = useRouter();

  if (!session) return null;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const initials = session.account_id.slice(0, 2).toUpperCase();

  return (
    <AppShell>
      {/* Header with gradient */}
      <div className="octo-gradient px-5 pt-6 pb-10 rounded-b-[1.5rem] relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-octo-red font-bold text-xl">{initials}</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">{session.account_id}</h1>
            <p className="text-white/60 text-sm font-mono">{session.account_id}</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4 pb-4">
        {/* Account Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4 fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-octo-gray-400 uppercase tracking-wider">
                Account ID
              </p>
              <p className="text-sm font-medium text-octo-gray-900 mt-0.5 font-mono">
                {session.account_id}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-octo-gray-400 uppercase tracking-wider">
                Saldo
              </p>
              <p className="text-sm font-medium text-octo-gray-900 mt-0.5">
                {formatCurrency(session.balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4 fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-octo-gray-50 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-octo-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-octo-gray-800">Status Akun</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-octo-green rounded-full" />
              <span className="text-sm font-medium text-octo-green">Aktif</span>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4 fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-octo-gray-50 rounded-xl flex items-center justify-center">
              <QrCode className="w-4 h-4 text-octo-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-octo-gray-800">QRIS Pay</p>
              <p className="text-xs text-octo-gray-500">v1.0.0</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 rounded-2xl px-4 py-4 border border-red-100 hover:bg-red-100 transition-colors active:scale-[0.98] mt-2"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span className="text-sm font-semibold text-red-600">Keluar</span>
        </button>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/profile/page.tsx
git commit -m "refactor: profile page shows account_id and balance from auth context"
```

---

## Task 10: Update `app/scan/result/page.tsx`

**Files:**
- Modify: `app/scan/result/page.tsx`

- [ ] **Step 1: Ganti seluruh isi `app/scan/result/page.tsx`**

```typescript
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as api from "@/lib/api";
import type { InquiryResponse, TransactionStatusResponse } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  Store,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  Receipt,
  Home,
  Terminal,
} from "lucide-react";

function ScanResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, updateBalance } = useAuth();
  const qrData = searchParams.get("qr") || "";
  const imageParam = searchParams.get("image");

  const [stage, setStage] = useState<"inquiry" | "confirm" | "processing" | "result">("inquiry");
  const [inquiry, setInquiry] = useState<InquiryResponse | null>(null);
  const [inquiryError, setInquiryError] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<TransactionStatusResponse | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!session) return;

    async function fetchInquiry() {
      if (!session) return;
      try {
        let result: InquiryResponse;
        if (imageParam) {
          const res = await fetch(imageParam);
          const blob = await res.blob();
          const file = new File([blob], "qr.jpg", { type: blob.type });
          result = await api.inquiryByImage(file, session.token);
        } else {
          result = await api.inquiryByPayload(qrData, session.token);
        }
        setInquiry(result);
      } catch (err) {
        setInquiryError(err instanceof Error ? err.message : "Gagal memproses QR");
      }
    }

    fetchInquiry();
  }, [qrData, imageParam, session]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  if (!session) {
    return (
      <AppShell showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Memuat..." />
        </div>
      </AppShell>
    );
  }

  if (inquiryError) {
    return (
      <AppShell showNav={false}>
        <Header title="Detail Pembayaran" showBack />
        <div className="px-5 py-10 text-center">
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-3" />
          <p className="text-octo-gray-700 font-medium">{inquiryError}</p>
          <Button onClick={() => router.back()} className="mt-5 rounded-xl bg-octo-red text-white">
            Kembali
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!inquiry) {
    return (
      <AppShell showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Memproses QR..." />
        </div>
      </AppShell>
    );
  }

  const finalAmount = inquiry.fixed_amount > 0 ? inquiry.fixed_amount : parseInt(amount) || 0;

  const handleConfirm = () => setStage("confirm");

  const handlePay = async () => {
    setStage("processing");
    setPaymentError("");

    try {
      const payment = await api.createPayment(inquiry.inquiry_id, finalAmount, pin, session.token);
      const transactionId = payment.transaction_id;

      let pollCount = 0;
      const maxPolls = 15;

      pollingRef.current = setInterval(async () => {
        pollCount++;
        try {
          const status = await api.getTransactionStatus(transactionId, session.token);
          if (status.status !== "PENDING") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (status.status === "SUCCESS") {
              updateBalance(status.final_balance);
            }
            setPaymentStatus(status);
            setStage("result");
          } else if (pollCount >= maxPolls) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setPaymentError("Waktu tunggu habis. Silakan cek kembali.");
            setStage("result");
          }
        } catch {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setPaymentError("Gagal memeriksa status pembayaran.");
          setStage("result");
        }
      }, 2000);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Pembayaran gagal");
      setStage("result");
    }
  };

  // ============ INQUIRY STAGE ============
  if (stage === "inquiry") {
    return (
      <AppShell showNav={false}>
        <Header title="Detail Pembayaran" showBack />
        <div className="px-5 py-5 space-y-4 fade-in">
          {/* Merchant Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-octo-red-light rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-octo-red" />
              </div>
              <div>
                <h2 className="font-semibold text-octo-gray-900 text-base">
                  {inquiry.merchant_name}
                </h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-octo-gray-400" />
                  <span className="text-xs text-octo-gray-500">{inquiry.city}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 bg-octo-gray-50 rounded-xl p-3">
              <div className="flex justify-between text-xs">
                <span className="text-octo-gray-500">Merchant ID</span>
                <span className="text-octo-gray-800 font-medium font-mono">{inquiry.merchant_id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-octo-gray-500">Terminal ID</span>
                <span className="text-octo-gray-800 font-medium font-mono">{inquiry.terminal_id}</span>
              </div>
            </div>
          </div>

          {/* Amount Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-5">
            <h3 className="text-sm font-semibold text-octo-gray-900 mb-3">Jumlah Pembayaran</h3>
            {inquiry.fixed_amount === 0 ? (
              <div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-octo-gray-400 text-sm font-medium">
                    Rp
                  </span>
                  <Input
                    id="amount-input"
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-14 pl-10 text-2xl font-bold text-octo-gray-900 rounded-xl border-octo-gray-200 focus:border-octo-red focus:ring-octo-red/20"
                  />
                </div>
                <p className="text-xs text-octo-gray-500 mt-2">Masukkan jumlah yang akan dibayar</p>
              </div>
            ) : (
              <div className="bg-octo-gray-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-octo-gray-900 count-up">
                  {formatCurrency(inquiry.fixed_amount)}
                </p>
                <p className="text-xs text-octo-gray-500 mt-1">Jumlah tetap</p>
              </div>
            )}
          </div>

          {/* Balance Info */}
          <div className="bg-octo-green-light rounded-xl px-4 py-3 flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-octo-green shrink-0" />
            <div>
              <p className="text-xs text-octo-green font-medium">Saldo tersedia</p>
              <p className="text-sm font-semibold text-octo-green">
                {formatCurrency(session.balance)}
              </p>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={inquiry.fixed_amount === 0 && finalAmount <= 0}
            className="w-full h-13 rounded-xl bg-gradient-to-r from-octo-red-600 to-octo-red-800 hover:from-octo-red-700 hover:to-octo-red text-white font-semibold text-sm shadow-lg shadow-octo-red/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bayar {finalAmount > 0 ? formatCurrency(finalAmount) : ""}
          </Button>
        </div>
      </AppShell>
    );
  }

  // ============ CONFIRM STAGE (PIN) ============
  if (stage === "confirm") {
    return (
      <AppShell showNav={false}>
        <Header title="Konfirmasi Pembayaran" showBack />
        <div className="px-5 py-6 space-y-4 fade-in">
          <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4 text-center">
            <div className="w-12 h-12 bg-octo-red-light rounded-full flex items-center justify-center mx-auto mb-2">
              <Store className="w-6 h-6 text-octo-red" />
            </div>
            <p className="text-xs text-octo-gray-600 mb-0.5">Bayar ke</p>
            <h2 className="font-bold text-base text-octo-gray-900 mb-2">{inquiry.merchant_name}</h2>
            <p className="text-2xl font-bold text-octo-red count-up">{formatCurrency(finalAmount)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4">
            <h3 className="text-sm font-semibold text-octo-gray-900 mb-3 text-center">
              Masukkan PIN Transaksi
            </h3>
            <div className="flex justify-center gap-2.5 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                    pin.length > i ? "border-octo-red bg-octo-red-light" : "border-octo-gray-200"
                  }`}
                >
                  {pin.length > i && <div className="w-2.5 h-2.5 bg-octo-red rounded-full" />}
                </div>
              ))}
            </div>

            <Input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="text-center text-lg tracking-[1em] h-0 opacity-0 absolute"
              autoFocus
            />

            <div className="max-w-[280px] mx-auto">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((num, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (num === "⌫") {
                        setPin(pin.slice(0, -1));
                      } else if (num !== "" && pin.length < 6) {
                        setPin(pin + num.toString());
                      }
                    }}
                    disabled={num === ""}
                    className={`h-12 rounded-xl text-lg font-semibold transition-all duration-150 active:scale-95 ${
                      num === ""
                        ? "invisible"
                        : num === "⌫"
                          ? "bg-octo-gray-100 text-octo-gray-600 hover:bg-octo-gray-200"
                          : "bg-octo-gray-50 text-octo-gray-900 hover:bg-octo-gray-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handlePay}
            disabled={pin.length < 6}
            className="w-full h-12 rounded-xl bg-linear-to-r from-octo-red-600 to-octo-red-800 hover:from-octo-red-700 hover:to-octo-red text-white font-semibold text-sm shadow-lg shadow-octo-red/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
          >
            Konfirmasi Pembayaran
          </Button>
        </div>
      </AppShell>
    );
  }

  // ============ PROCESSING STAGE ============
  if (stage === "processing") {
    return (
      <AppShell showNav={false}>
        <div className="min-h-screen flex flex-col items-center justify-center px-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-octo-red-light flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-octo-red animate-spin" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-octo-red/20 pulse-ring" />
          </div>
          <h2 className="text-lg font-semibold text-octo-gray-900 mb-2">Memproses Pembayaran</h2>
          <p className="text-sm text-octo-gray-500 text-center">
            Mohon tunggu, pembayaran Anda sedang diproses...
          </p>
        </div>
      </AppShell>
    );
  }

  // ============ RESULT STAGE ============
  if (stage === "result") {
    if (paymentError) {
      return (
        <AppShell showNav={false}>
          <div className="px-5 pt-12 pb-8 text-center bg-red-50 rounded-b-[2rem]">
            <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-xl font-bold text-red-600 mb-1">Pembayaran Gagal</h1>
            <p className="text-sm text-octo-gray-600">{paymentError}</p>
          </div>
          <div className="px-5 mt-4">
            <Button
              onClick={() => router.push("/")}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-octo-red-600 to-octo-red-800 text-white font-semibold text-sm"
            >
              <Home className="w-4 h-4 mr-1.5" />
              Beranda
            </Button>
          </div>
        </AppShell>
      );
    }

    if (!paymentStatus) return null;
    const isSuccess = paymentStatus.status === "SUCCESS";

    return (
      <AppShell showNav={false}>
        <div
          className={`px-5 pt-12 pb-8 text-center ${isSuccess ? "bg-octo-green-light" : "bg-red-50"} rounded-b-[2rem]`}
        >
          <div className="slide-up">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isSuccess ? "bg-octo-green" : "bg-red-500"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : (
                <XCircle className="w-10 h-10 text-white" />
              )}
            </div>
            <h1 className={`text-xl font-bold mb-1 ${isSuccess ? "text-octo-green" : "text-red-600"}`}>
              {isSuccess ? "Pembayaran Berhasil!" : "Pembayaran Gagal"}
            </h1>
            <p className="text-3xl font-bold text-octo-gray-900 mt-4 count-up">
              {formatCurrency(finalAmount)}
            </p>
          </div>
        </div>

        <div className="px-5 mt-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-5 fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-4 h-4 text-octo-gray-400" />
              <h3 className="text-sm font-semibold text-octo-gray-900">Detail Transaksi</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Merchant", value: inquiry.merchant_name },
                { label: "ID Transaksi", value: paymentStatus.transaction_id, mono: true },
                { label: "Jumlah", value: formatCurrency(finalAmount) },
                { label: "Saldo Akhir", value: formatCurrency(paymentStatus.final_balance), bold: true },
                { label: "Waktu", value: new Date(paymentStatus.timestamp).toLocaleString("id-ID") },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-octo-gray-500">{item.label}</span>
                  <span
                    className={`text-right ${item.mono ? "font-mono" : ""} ${
                      item.bold ? "font-bold text-octo-gray-900" : "text-octo-gray-800 font-medium"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pb-8">
            <Button
              onClick={() => router.push("/")}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-octo-red-600 to-octo-red-800 text-white font-semibold text-sm shadow-lg shadow-octo-red/25"
            >
              <Home className="w-4 h-4 mr-1.5" />
              Beranda
            </Button>
            <Button
              onClick={() => router.push("/scan")}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-octo-gray-200 text-octo-gray-700 font-semibold text-sm"
            >
              Scan Lagi
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return null;
}

export default function ScanResultPage() {
  return (
    <Suspense
      fallback={
        <AppShell showNav={false}>
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner text="Memuat..." />
          </div>
        </AppShell>
      }
    >
      <ScanResultContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/scan/result/page.tsx
git commit -m "feat: scan result uses api.ts for inquiry, payment, and status polling"
```

---

## Task 11: Update `app/scan/page.tsx` — gallery button

**Files:**
- Modify: `app/scan/page.tsx`

- [ ] **Step 1: Ganti `user` → `session`, dan tambahkan handler gallery button**

Ganti baris `const { user } = useAuth();` menjadi `const { session } = useAuth();` dan `if (!user) return null;` menjadi `if (!session) return null;`.

Tambahkan state `fileInputRef` dan handler untuk gallery button:

```typescript
// Tambah di bagian atas komponen, setelah deklarasi state yang ada
const fileInputRef = useRef<HTMLInputElement>(null);
```

Tambahkan import `useRef` dari react (sudah ada `useState, useCallback` — tambahkan `useRef`).

Ganti gallery button (baris `<button className="flex flex-col items-center gap-1.5">` yang tidak punya onClick) menjadi:

```typescript
<>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        router.push(`/scan/result?image=${encodeURIComponent(objectUrl)}`);
      }
    }}
  />
  <button
    onClick={() => fileInputRef.current?.click()}
    className="flex flex-col items-center gap-1.5"
  >
    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
      <Image className="w-5 h-5 text-white" />
    </div>
    <span className="text-white/70 text-[10px]">Gallery</span>
  </button>
</>
```

- [ ] **Step 2: Commit**

```bash
git add app/scan/page.tsx
git commit -m "feat: wire gallery button to upload image for QRIS inquiry"
```

---

## Task 12: Fix sisa referensi ke `user` dari auth

**Files:**
- Modify: `components/AppShell.tsx`

- [ ] **Step 1: Ganti `user` dengan `session` di `components/AppShell.tsx`**

Buka `components/AppShell.tsx`. Ganti semua penggunaan `user` dari `useAuth()` dengan `session`:

```typescript
// Sebelum
const { user, isLoading } = useAuth();
if (!user) router.replace("/login");

// Sesudah
const { session, isLoading } = useAuth();
if (!session) router.replace("/login");
```

- [ ] **Step 2: Jalankan build untuk cek error TypeScript**

```bash
npm run build
```

Expected: Build berhasil tanpa TypeScript error. Jika ada error karena referensi `user` yang tersisa di file lain, perbaiki satu per satu:
- `user` → `session`
- `user.name` → `session.account_id`
- `user.accountNumber` → `session.account_id`
- `balance.availableBalance` → `session.balance`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: replace remaining user references with session from new auth context"
```

---

## Verification

Jalankan dev server:
```bash
npm run dev
```

Lalu verifikasi:

1. **Register:** Buka `http://localhost:3000/register` → isi username, password, saldo awal → submit → redirect ke home, balance tampil sesuai yang diisi
2. **Login:** Logout → buka `/login` → isi username + password → redirect ke home
3. **Home:** Saldo tampil dari auth context, tidak ada "Transaksi Terakhir"
4. **Profile:** Menampilkan `account_id` dan balance, tidak ada email/phone
5. **BottomNav:** Hanya ada Home, Scan QR (tengah), Profil — tidak ada History atau Saldo
6. **Scan kamera:** Scan QR → tampil merchant info (merchant_name, city, terminal_id) → input PIN → processing → result sukses dengan saldo akhir
7. **Navigasi ke `/history`:** Harus 404
8. **Navigasi ke `/balance`:** Harus 404
