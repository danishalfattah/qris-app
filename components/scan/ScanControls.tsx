"use client";

import { useRef } from "react";
import { Flashlight, Image, QrCode } from "lucide-react";

interface ScanControlsProps {
  flashOn: boolean;
  onToggleFlash: () => void;
  onDemoQr: () => void;
  onImageSelected: (file: File) => void;
}

export default function ScanControls({
  flashOn,
  onToggleFlash,
  onDemoQr,
  onImageSelected,
}: ScanControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black via-black/90 to-transparent pt-12 pb-8 px-5">
      {/* DEV: Demo QR Button */}
      <button
        onClick={onDemoQr}
        className="w-full mb-4 py-3 rounded-xl bg-octo-gold text-black text-sm font-bold active:scale-[0.97] transition-all"
      >
        ⚡ Demo QR — Langsung Inquiry
      </button>

      {/* Action Buttons */}
      <div className="flex items-center justify-around mb-4">
        <button
          onClick={onToggleFlash}
          className="flex flex-col items-center gap-1.5"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              flashOn
                ? "bg-octo-gold text-black"
                : "bg-white/10 text-white border border-white/20"
            }`}
          >
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

        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageSelected(file);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Image className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/70 text-[10px]">Gallery</span>
          </button>
        </>
      </div>

      <p className="text-white/40 text-[10px] text-center">
        Arahkan kamera ke kode QR untuk memulai pembayaran
      </p>
    </div>
  );
}
