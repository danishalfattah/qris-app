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
