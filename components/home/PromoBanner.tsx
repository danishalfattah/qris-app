"use client";

import { QrCode } from "lucide-react";

export default function PromoBanner() {
  return (
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
  );
}
