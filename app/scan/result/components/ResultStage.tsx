"use client";

import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { InquiryResponse, TransactionStatusResponse } from "@/lib/types";
import { CheckCircle2, XCircle, Receipt, Home } from "lucide-react";

interface ResultStageProps {
  paymentStatus: TransactionStatusResponse | null;
  paymentError: string;
  inquiry: InquiryResponse;
  finalAmount: number;
  onHome: () => void;
  onScan: () => void;
}

export default function ResultStage({
  paymentStatus,
  paymentError,
  inquiry,
  finalAmount,
  onHome,
  onScan,
}: ResultStageProps) {
  if (paymentError) {
    return (
      <AppShell showNav={false}>
        <div className="px-5 pt-12 pb-8 text-center bg-red-50 rounded-b-[2rem]">
          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-bold text-red-600 mb-1">Pembayaran Gagal</h1>
          <p className="text-sm text-octo-gray-600">{paymentError}</p>
        </div>
        <div className="px-5 mt-4">
          <Button
            onClick={onHome}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-octo-red-600 to-octo-red-800 text-white font-semibold text-sm"
          >
            <Home className="w-4 h-4 mr-1.5" />
            Beranda
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!paymentStatus) return null;

  const isSuccess = paymentStatus.status === "SUCCESS";

  return (
    <AppShell showNav={false}>
      <div
        className={`px-5 pt-12 pb-8 text-center ${isSuccess ? "bg-octo-green-light" : "bg-red-50"} rounded-b-[2rem]`}
      >
        <div className="slide-up">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isSuccess ? "bg-octo-green" : "bg-red-500"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-10 h-10 text-white" />
            ) : (
              <XCircle className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className={`text-xl font-bold mb-1 ${isSuccess ? "text-octo-green" : "text-red-600"}`}>
            {isSuccess ? "Pembayaran Berhasil!" : "Pembayaran Gagal"}
          </h1>
          <p className="text-3xl font-bold text-octo-gray-900 mt-4 count-up">
            {formatCurrency(finalAmount)}
          </p>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-5 fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-4 h-4 text-octo-gray-400" />
            <h3 className="text-sm font-semibold text-octo-gray-900">Detail Transaksi</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Merchant", value: inquiry.merchant_name },
              { label: "ID Transaksi", value: paymentStatus.transaction_id, mono: true },
              { label: "Jumlah", value: formatCurrency(finalAmount) },
              { label: "Saldo Akhir", value: formatCurrency(paymentStatus.final_balance), bold: true },
              { label: "Waktu", value: new Date(paymentStatus.timestamp).toLocaleString("id-ID") },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-octo-gray-500">{item.label}</span>
                <span
                  className={`text-right ${item.mono ? "font-mono" : ""} ${
                    item.bold ? "font-bold text-octo-gray-900" : "text-octo-gray-800 font-medium"
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <Button
            onClick={onHome}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-octo-red-600 to-octo-red-800 text-white font-semibold text-sm shadow-lg shadow-octo-red/25"
          >
            <Home className="w-4 h-4 mr-1.5" />
            Beranda
          </Button>
          <Button
            onClick={onScan}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-octo-gray-200 text-octo-gray-700 font-semibold text-sm"
          >
            Scan Lagi
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
