"use client";

import AppShell from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { ScanLine } from "lucide-react";
import { useState } from "react";
import GreetingCard from "@/components/home/GreetingCard";
import QrisBanner from "@/components/home/QrisBanner";
import PromoBanner from "@/components/home/PromoBanner";

export default function HomePage() {
  const { session } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  if (!session) {
    return <AppShell><div /></AppShell>;
  }

  return (
    <AppShell>
      <GreetingCard
        accountId={session.account_id}
        balance={session.balance}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
      />

      <QrisBanner />

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

      <PromoBanner />
    </AppShell>
  );
}
