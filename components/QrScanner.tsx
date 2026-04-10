"use client";

import { useEffect, useRef } from "react";

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export default function QrScanner({ onScanSuccess, onScanError }: QrScannerProps) {
  // Use refs to avoid stale closure issues
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);
  onScanSuccessRef.current = onScanSuccess;
  onScanErrorRef.current = onScanError;

  useEffect(() => {
    let scanner: import("html5-qrcode").Html5Qrcode | null = null;
    let cancelled = false;
    let hasScanned = false;

    async function initScanner() {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");

      // Check if component already unmounted
      if (cancelled) return;

      // Make sure the container exists
      const container = document.getElementById("qr-reader");
      if (!container) return;

      try {
        scanner = new Html5Qrcode("qr-reader", { verbose: false });

        if (cancelled) return;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (hasScanned || cancelled) return;
            hasScanned = true;

            // Stop scanner first, then navigate
            if (scanner) {
              scanner
                .stop()
                .then(() => {
                  scanner = null;
                  onScanSuccessRef.current(decodedText);
                })
                .catch(() => {
                  // Even if stop fails, still navigate
                  onScanSuccessRef.current(decodedText);
                });
            } else {
              onScanSuccessRef.current(decodedText);
            }
          },
          () => {
            // QR not found in current frame - normal, ignore
          }
        );
      } catch (err) {
        if (!cancelled) {
          console.error("QR Scanner init error:", err);
          onScanErrorRef.current?.(
            err instanceof Error ? err.message : "Gagal memulai kamera"
          );
        }
      }
    }

    // Delay init to let the DOM settle
    const timer = setTimeout(initScanner, 600);

    // Cleanup function
    return () => {
      cancelled = true;
      clearTimeout(timer);

      if (scanner) {
        try {
          const s = scanner;
          scanner = null;
          // Use getState safely
          const state = s.getState();
          // Html5QrcodeScannerState.SCANNING = 2
          if (state === 2) {
            s.stop().catch(() => {
              // Suppress errors during cleanup
            });
          }
        } catch {
          // Scanner may already be destroyed, ignore
        }
      }
    };
  }, []); // Empty deps - only init once

  return (
    <div className="relative w-full">
      <div id="qr-reader" className="w-full overflow-hidden rounded-2xl" />

      {/* Viewfinder overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-[250px] h-[250px]">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-lg" />

          {/* Scan line */}
          <div className="scan-line absolute left-2 right-2 h-[3px] bg-linear-to-r from-transparent via-octo-red to-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
}
