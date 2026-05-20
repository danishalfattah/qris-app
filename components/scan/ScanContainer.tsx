"use client";

import QrScanner from "@/components/QrScanner";
import { QrCode } from "lucide-react";

interface ScanContainerProps {
  scanError: string | null;
  onScanSuccess: (decodedText: string) => void;
  onScanError: (error: string) => void;
  onDemoQr: () => void;
}

export default function ScanContainer({
  scanError,
  onScanSuccess,
  onScanError,
  onDemoQr,
}: ScanContainerProps) {
  if (scanError) {
    return (
      <div className="text-center px-6 fade-in">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-10 h-10 text-white/60" />
        </div>
        <p className="text-white/80 text-sm mb-2">Kamera tidak tersedia</p>
        <p className="text-white/50 text-xs mb-6">{scanError}</p>
        <button
          onClick={onDemoQr}
          className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors border border-white/20"
        >
          Gunakan Demo QR
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[300px]">
      <QrScanner onScanSuccess={onScanSuccess} onScanError={onScanError} />
    </div>
  );
}
