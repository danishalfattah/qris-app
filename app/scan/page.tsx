"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import ScanContainer from "@/components/scan/ScanContainer";
import ScanControls from "@/components/scan/ScanControls";
import { X, Info } from "lucide-react";

const MOCK_QR =
  "00020101021226680016ID.CO.TELKOMSEL011893600898011234567802150008850012345603048888530336054041500550206150000620742035126304ABCD";

export default function ScanPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [flashOn, setFlashOn] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      router.push(`/scan/result?qr=${encodeURIComponent(decodedText)}`);
    },
    [router],
  );

  const handleScanError = useCallback((error: string) => {
    setScanError(error);
  }, []);

  const handleDemoQr = useCallback(() => {
    router.push(`/scan/result?qr=${encodeURIComponent(MOCK_QR)}`);
  }, [router]);

  const handleImageSelected = useCallback(
    (file: File) => {
      const objectUrl = URL.createObjectURL(file);
      router.push(`/scan/result?image=${encodeURIComponent(objectUrl)}`);
    },
    [router],
  );

  if (!session) return null;

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
                🇹🇭 Thailand 🇸🇬 Singapore 🇲🇾 Malaysia 🇯🇵 Japan
              </span>
            </p>
          </div>
        </div>

        {/* Camera & Scanner */}
        <div className="flex-1 flex items-center justify-center relative mt-20 mb-48 px-6">
          <ScanContainer
            scanError={scanError}
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            onDemoQr={handleDemoQr}
          />
        </div>

        <ScanControls
          flashOn={flashOn}
          onToggleFlash={() => setFlashOn(!flashOn)}
          onDemoQr={handleDemoQr}
          onImageSelected={handleImageSelected}
        />
      </div>
    </AppShell>
  );
}
