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
