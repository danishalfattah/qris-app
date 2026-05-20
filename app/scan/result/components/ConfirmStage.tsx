"use client";

import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import type { InquiryResponse } from "@/lib/types";
import { Store } from "lucide-react";

interface ConfirmStageProps {
  inquiry: InquiryResponse;
  finalAmount: number;
  pin: string;
  setPin: (value: string) => void;
  handlePay: () => void;
}

export default function ConfirmStage({
  inquiry,
  finalAmount,
  pin,
  setPin,
  handlePay,
}: ConfirmStageProps) {
  return (
    <AppShell showNav={false}>
      <Header title="Konfirmasi Pembayaran" showBack />
      <div className="px-5 py-6 space-y-4 fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-octo-red-light rounded-full flex items-center justify-center mx-auto mb-2">
            <Store className="w-6 h-6 text-octo-red" />
          </div>
          <p className="text-xs text-octo-gray-600 mb-0.5">Bayar ke</p>
          <h2 className="font-bold text-base text-octo-gray-900 mb-2">{inquiry.merchant_name}</h2>
          <p className="text-2xl font-bold text-octo-red count-up">{formatCurrency(finalAmount)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4">
          <h3 className="text-sm font-semibold text-octo-gray-900 mb-3 text-center">
            Masukkan PIN Transaksi
          </h3>
          <div className="flex justify-center gap-2.5 mb-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  pin.length > i ? "border-octo-red bg-octo-red-light" : "border-octo-gray-200"
                }`}
              >
                {pin.length > i && <div className="w-2.5 h-2.5 bg-octo-red rounded-full" />}
              </div>
            ))}
          </div>

          <Input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="text-center text-lg tracking-[1em] h-0 opacity-0 absolute"
            autoFocus
          />

          <div className="max-w-[280px] mx-auto">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((num, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (num === "⌫") {
                      setPin(pin.slice(0, -1));
                    } else if (num !== "" && pin.length < 6) {
                      setPin(pin + num.toString());
                    }
                  }}
                  disabled={num === ""}
                  className={`h-12 rounded-xl text-lg font-semibold transition-all duration-150 active:scale-95 ${
                    num === ""
                      ? "invisible"
                      : num === "⌫"
                        ? "bg-octo-gray-100 text-octo-gray-600 hover:bg-octo-gray-200"
                        : "bg-octo-gray-50 text-octo-gray-900 hover:bg-octo-gray-100"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handlePay}
          disabled={pin.length < 6}
          className="w-full h-12 rounded-xl bg-linear-to-r from-octo-red-600 to-octo-red-800 hover:from-octo-red-700 hover:to-octo-red text-white font-semibold text-sm shadow-lg shadow-octo-red/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
        >
          Konfirmasi Pembayaran
        </Button>
      </div>
    </AppShell>
  );
}
