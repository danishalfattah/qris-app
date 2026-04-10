"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import { getMockBalance } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import {
  Eye,
  EyeOff,
  RefreshCw,
  CreditCard,
  Banknote,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function BalancePage() {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const balance = useMemo(() => {
    if (!user) return null;
    return getMockBalance(user);
  }, [user]);

  if (!user || !balance) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  return (
    <AppShell>
      <Header title="Saldo" />

      <div className="px-5 py-5 space-y-4">
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-octo-red-600 to-octo-red-800 rounded-2xl p-5 shadow-xl shadow-octo-red/20 relative overflow-hidden fade-in">
          {/* Decorative */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-4 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white/70" />
                <p className="text-white/70 text-xs font-medium">Saldo Tersedia</p>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                {showBalance ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-white font-bold text-3xl tracking-tight mb-4 count-up">
              {showBalance
                ? formatCurrency(balance.availableBalance)
                : "Rp ••••••••"}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-wider">Nomor Rekening</p>
                <p className="text-white/90 text-sm font-mono mt-0.5">
                  {balance.accountNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-[10px] uppercase tracking-wider">Pemilik</p>
                <p className="text-white/90 text-sm font-medium mt-0.5">
                  {balance.accountName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Effective Balance */}
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4 fade-in fade-in-delay-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Banknote className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-octo-gray-500">Saldo Efektif</p>
              <p className="text-base font-bold text-octo-gray-900">
                {showBalance
                  ? formatCurrency(balance.effectiveBalance)
                  : "Rp ••••••••"}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4 fade-in fade-in-delay-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-octo-gray-500">Terakhir Diperbarui</p>
                <p className="text-sm font-medium text-octo-gray-800">
                  {new Date(balance.lastUpdated).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4 hover:bg-octo-gray-50 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 fade-in fade-in-delay-3"
        >
          <RefreshCw
            className={`w-4 h-4 text-octo-red ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
          <span className="text-sm font-semibold text-octo-red">
            {isRefreshing ? "Memperbarui..." : "Perbarui Saldo"}
          </span>
        </button>

        {/* Info */}
        <div className="bg-octo-gray-50 rounded-xl p-3 border border-octo-gray-100">
          <p className="text-[11px] text-octo-gray-500 leading-relaxed text-center">
            Saldo ditampilkan secara real-time. Tekan &quot;Perbarui Saldo&quot; untuk mendapatkan informasi terbaru.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
