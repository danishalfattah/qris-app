"use client";

import { formatCurrency, getGreeting } from "@/lib/format";
import { QrCode, Bell, Search, Eye, EyeOff } from "lucide-react";

interface GreetingCardProps {
  accountId: string;
  balance: number;
  showBalance: boolean;
  onToggleBalance: () => void;
}

export default function GreetingCard({
  accountId,
  balance,
  showBalance,
  onToggleBalance,
}: GreetingCardProps) {
  const greeting = getGreeting();

  return (
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
          <h1 className="text-white font-bold text-xl">{accountId}</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white/70 text-xs font-medium">Saldo Tersedia</p>
            <button
              onClick={onToggleBalance}
              className="text-white/60 hover:text-white transition-colors"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-white font-bold text-2xl tracking-tight">
            {showBalance ? formatCurrency(balance) : "Rp ••••••••"}
          </p>
          <p className="text-white/50 text-xs mt-1 font-mono">{accountId}</p>
        </div>
      </div>
    </div>
  );
}
