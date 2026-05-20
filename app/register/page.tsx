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
              className="w-full h-12 rounded-xl bg-linear-to-r from-octo-red-600 to-octo-red-800 hover:from-octo-red-700 hover:to-octo-red text-white font-semibold text-sm shadow-lg shadow-octo-red/25 transition-all duration-200 active:scale-[0.98]"
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
