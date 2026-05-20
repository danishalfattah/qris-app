"use client";

import { QrCode } from "lucide-react";

export default function QrisBanner() {
  return (
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
  );
}
