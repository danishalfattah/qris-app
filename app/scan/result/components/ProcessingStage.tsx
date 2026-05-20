"use client";

import AppShell from "@/components/AppShell";
import { Loader2 } from "lucide-react";

export default function ProcessingStage() {
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
