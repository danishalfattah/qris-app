"use client";

import { useAuth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import { useRouter } from "next/navigation";
import {
  User,
  CreditCard,
  Shield,
  HelpCircle,
  FileText,
  Bell,
  ChevronRight,
  LogOut,
  Settings,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuSections = [
  {
    title: "Akun",
    items: [
      { icon: User, label: "Data Pribadi", href: "#" },
      { icon: CreditCard, label: "Rekening Saya", href: "#" },
      { icon: Shield, label: "Keamanan", href: "#" },
      { icon: Bell, label: "Notifikasi", href: "#" },
    ],
  },
  {
    title: "Lainnya",
    items: [
      { icon: Settings, label: "Pengaturan", href: "#" },
      { icon: HelpCircle, label: "Bantuan", href: "#" },
      { icon: FileText, label: "Syarat & Ketentuan", href: "#" },
      { icon: Info, label: "Tentang Aplikasi", href: "#" },
    ],
  },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
            <h1 className="text-white font-bold text-lg">{user.name}</h1>
            <p className="text-white/60 text-sm">{user.email}</p>
            <p className="text-white/40 text-xs mt-0.5 font-mono">
              {user.accountNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4 pb-4">
        {/* Account Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4 fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-octo-gray-400 uppercase tracking-wider">
                No. HP
              </p>
              <p className="text-sm font-medium text-octo-gray-900 mt-0.5">
                {user.phone}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-octo-gray-400 uppercase tracking-wider">
                Status
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 bg-octo-green rounded-full" />
                <span className="text-sm font-medium text-octo-green">
                  Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="fade-in">
            <p className="text-xs font-semibold text-octo-gray-500 mb-2 uppercase tracking-wider px-1">
              {section.title}
            </p>
            <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 divide-y divide-octo-gray-100 overflow-hidden">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-octo-gray-50 transition-colors active:bg-octo-gray-100"
                >
                  <div className="w-9 h-9 bg-octo-gray-50 rounded-xl flex items-center justify-center">
                    <item.icon className="w-4.5 h-4.5 text-octo-gray-600" />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-octo-gray-800">
                    {item.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-octo-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 rounded-2xl px-4 py-4 border border-red-100 hover:bg-red-100 transition-colors active:scale-[0.98] mt-2"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          <span className="text-sm font-semibold text-red-600">Keluar</span>
        </button>

        {/* Version */}
        <p className="text-center text-[11px] text-octo-gray-400 py-2">
          QRIS Pay v1.0.0
        </p>
      </div>
    </AppShell>
  );
}
