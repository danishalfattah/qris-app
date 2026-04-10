"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import QrScanner from "@/components/QrScanner";
import { X, Info, Flashlight, Image, QrCode } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [flashOn, setFlashOn] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      // Navigate to result page with QR data
      const encoded = encodeURIComponent(decodedText);
      router.push(`/scan/result?qr=${encoded}`);
    },
    [router]
  );

  const handleScanError = useCallback((error: string) => {
    setScanError(error);
  }, []);

  if (!user) return null;

  return (
    <AppShell showNav={false}>
      <div className="min-h-screen bg-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-linear-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-white font-semibold text-base">Scan QRIS</h1>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* QRIS Countries Banner */}
        <div className="absolute top-14 left-0 right-0 z-20 px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2">
            <p className="text-white/90 text-[11px] text-center">
              QRIS can also be used in country:{" "}
              <span className="font-medium">
                🇹🇭 Thailand  🇸🇬 Singapore  🇲🇾 Malaysia  🇯🇵 Japan
              </span>
            </p>
          </div>
        </div>

        {/* Camera & Scanner */}
        <div className="flex-1 flex items-center justify-center relative mt-20 mb-48 px-6">
          {scanError ? (
            <div className="text-center px-6 fade-in">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-white/60" />
              </div>
              <p className="text-white/80 text-sm mb-2">Kamera tidak tersedia</p>
              <p className="text-white/50 text-xs mb-6">{scanError}</p>
              <button
                onClick={() => {
                  // Demo: navigate with mock QR data
                  const mockQr = "00020101021226680016ID.CO.TELKOMSEL011893600898011234567802150008850012345603048888530336054041500550206150000620742035126304ABCD";
                  router.push(`/scan/result?qr=${encodeURIComponent(mockQr)}`);
                }}
                className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors border border-white/20"
              >
                Gunakan Demo QR
              </button>
            </div>
          ) : (
            <div className="w-full max-w-[300px]">
              <QrScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black via-black/90 to-transparent pt-12 pb-8 px-5">
          {/* DEV: Demo QR Button */}
          <button
            onClick={() => {
              const mockQr = "00020101021226680016ID.CO.TELKOMSEL011893600898011234567802150008850012345603048888530336054041500550206150000620742035126304ABCD";
              router.push(`/scan/result?qr=${encodeURIComponent(mockQr)}`);
            }}
            className="w-full mb-4 py-3 rounded-xl bg-octo-gold text-black text-sm font-bold active:scale-[0.97] transition-all"
          >
            ⚡ Demo QR — Langsung Inquiry
          </button>

          {/* Action Buttons */}
          <div className="flex items-center justify-around mb-4">
            <button
              onClick={() => setFlashOn(!flashOn)}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                flashOn
                  ? "bg-octo-gold text-black"
                  : "bg-white/10 text-white border border-white/20"
              }`}>
                <Flashlight className="w-5 h-5" />
              </div>
              <span className="text-white/70 text-[10px]">Flash</span>
            </button>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <QrCode className="w-7 h-7 text-white" />
              </div>
              <span className="text-white/90 text-[10px] font-medium">QRIS</span>
            </div>

            <button className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Image className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/70 text-[10px]">Gallery</span>
            </button>
          </div>

          <p className="text-white/40 text-[10px] text-center">
            Arahkan kamera ke kode QR untuk memulai pembayaran
          </p>
        </div>
      </div>
    </AppShell>
  );
}
