"use client";

import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import {
  getGreeting,
  formatCurrency,
  formatDate,
  formatTime,
} from "@/lib/format";
import { getMockBalance, getMockHistory } from "@/lib/mock-data";
import Link from "next/link";
import {
  ScanLine,
  Wallet,
  History,
  QrCode,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  const balance = useMemo(() => {
    if (!user) return null;
    return getMockBalance(user);
  }, [user]);

  const recentTx = useMemo(() => {
    return getMockHistory(1, 3).transactions;
  }, []);

  if (!user) {
    return (
      <AppShell>
        <div />
      </AppShell>
    );
  }

  const greeting = getGreeting();

  return (
    <AppShell>
      {/* Header */}
      <div className="octo-gradient px-5 pt-4 pb-8 rounded-b-[1.5rem] relative overflow-hidden">
        {/* Decorative */}
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
            <h1 className="text-white font-bold text-xl">{user.name}</h1>
          </div>

          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/70 text-xs font-medium">
                Saldo Tersedia
              </p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-white/60 hover:text-white transition-colors"
              >
                {showBalance ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-white font-bold text-2xl tracking-tight">
              {showBalance && balance
                ? formatCurrency(balance.availableBalance)
                : "Rp ••••••••"}
            </p>
            <p className="text-white/50 text-xs mt-1">{user.accountNumber}</p>
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

      {/* Quick Actions */}
      {/* <div className="px-5 mt-5">
        <div className="grid grid-cols-4 gap-3">
          {[
            { href: "/scan", icon: ScanLine, label: "Scan QR", color: "from-octo-red-600 to-octo-red-800" },
            { href: "/balance", icon: Wallet, label: "Saldo", color: "from-emerald-500 to-emerald-700" },
            { href: "/history", icon: History, label: "Mutasi", color: "from-blue-500 to-blue-700" },
            { href: "/scan", icon: QrCode, label: "Bayar QR", color: "from-amber-500 to-amber-700" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:shadow-lg group-active:scale-95 transition-all duration-200`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-medium text-octo-gray-700 text-center leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div> */}

      {/* Recent Transactions */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-octo-gray-900">
            Transaksi Terakhir
          </h2>
          <Link
            href="/history"
            className="text-xs font-medium text-octo-red flex items-center gap-0.5 hover:underline"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 divide-y divide-octo-gray-100 overflow-hidden">
          {recentTx.map((tx, i) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 px-4 py-3.5 fade-in fade-in-delay-${i + 1}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === "IN"
                    ? "bg-octo-green-light text-octo-green"
                    : "bg-octo-red-light text-octo-red"
                }`}
              >
                {tx.type === "IN" ? (
                  <ArrowDownLeft className="w-5 h-5" />
                ) : (
                  <ArrowUpRight className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-octo-gray-900 truncate">
                  {tx.merchantName || tx.description}
                </p>
                <p className="text-xs text-octo-gray-500 mt-0.5">
                  {formatDate(tx.timestamp)} • {formatTime(tx.timestamp)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-semibold ${
                    tx.type === "IN" ? "text-octo-green" : "text-octo-gray-900"
                  }`}
                >
                  {tx.type === "IN" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="px-5 mt-5 mb-4">
        <div className="bg-gradient-to-r from-octo-red-50 to-amber-50 rounded-2xl p-4 border border-octo-red-100 fade-in fade-in-delay-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-octo-red rounded-xl flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-octo-gray-900">
                Promo QRIS
              </p>
              <p className="text-xs text-octo-gray-600 mt-0.5 leading-relaxed">
                Dapatkan cashback hingga 50% untuk transaksi pertama menggunakan
                QRIS!
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
