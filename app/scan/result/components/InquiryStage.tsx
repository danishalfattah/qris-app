"use client";

import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import type { InquiryResponse } from "@/lib/types";
import type { AuthSession } from "../useScanResult";
import { Store, MapPin, CreditCard } from "lucide-react";

interface InquiryStageProps {
  inquiry: InquiryResponse;
  amount: string;
  setAmount: (value: string) => void;
  finalAmount: number;
  session: AuthSession;
  handleConfirm: () => void;
}

export default function InquiryStage({
  inquiry,
  amount,
  setAmount,
  finalAmount,
  session,
  handleConfirm,
}: InquiryStageProps) {
  return (
    <AppShell showNav={false}>
      <Header title="Detail Pembayaran" showBack />
      <div className="px-5 py-5 space-y-4 fade-in">
        {/* Merchant Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-octo-red-light rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-octo-red" />
            </div>
            <div>
              <h2 className="font-semibold text-octo-gray-900 text-base">
                {inquiry.merchant_name}
              </h2>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-octo-gray-400" />
                <span className="text-xs text-octo-gray-500">{inquiry.city}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 bg-octo-gray-50 rounded-xl p-3">
            <div className="flex justify-between text-xs">
              <span className="text-octo-gray-500">Merchant ID</span>
              <span className="text-octo-gray-800 font-medium font-mono">{inquiry.merchant_id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-octo-gray-500">Terminal ID</span>
              <span className="text-octo-gray-800 font-medium font-mono">{inquiry.terminal_id}</span>
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-5">
          <h3 className="text-sm font-semibold text-octo-gray-900 mb-3">Jumlah Pembayaran</h3>
          {inquiry.fixed_amount === 0 ? (
            <div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-octo-gray-400 text-sm font-medium">
                  Rp
                </span>
                <Input
                  id="amount-input"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 pl-10 text-2xl font-bold text-octo-gray-900 rounded-xl border-octo-gray-200 focus:border-octo-red focus:ring-octo-red/20"
                />
              </div>
              <p className="text-xs text-octo-gray-500 mt-2">Masukkan jumlah yang akan dibayar</p>
            </div>
          ) : (
            <div className="bg-octo-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-octo-gray-900 count-up">
                {formatCurrency(inquiry.fixed_amount)}
              </p>
              <p className="text-xs text-octo-gray-500 mt-1">Jumlah tetap</p>
            </div>
          )}
        </div>

        {/* Balance Info */}
        <div className="bg-octo-green-light rounded-xl px-4 py-3 flex items-center gap-2.5">
          <CreditCard className="w-4 h-4 text-octo-green shrink-0" />
          <div>
            <p className="text-xs text-octo-green font-medium">Saldo tersedia</p>
            <p className="text-sm font-semibold text-octo-green">
              {formatCurrency(session.balance)}
            </p>
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={inquiry.fixed_amount === 0 && finalAmount <= 0}
          className="w-full h-13 rounded-xl bg-gradient-to-r from-octo-red-600 to-octo-red-800 hover:from-octo-red-700 hover:to-octo-red text-white font-semibold text-sm shadow-lg shadow-octo-red/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Bayar {finalAmount > 0 ? formatCurrency(finalAmount) : ""}
        </Button>
      </div>
    </AppShell>
  );
}
