"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as api from "@/lib/api";
import type { InquiryResponse, TransactionStatusResponse } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  Store,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  Receipt,
  Home,
  Terminal,
} from "lucide-react";

function ScanResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, updateBalance } = useAuth();
  const qrData = searchParams.get("qr") || "";
  const imageParam = searchParams.get("image");

  const [stage, setStage] = useState<"inquiry" | "confirm" | "processing" | "result">("inquiry");
  const [inquiry, setInquiry] = useState<InquiryResponse | null>(null);
  const [inquiryError, setInquiryError] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<TransactionStatusResponse | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!session) return;

    async function fetchInquiry() {
      if (!session) return;
      try {
        let result: InquiryResponse;
        if (imageParam) {
          const res = await fetch(imageParam);
          const blob = await res.blob();
          const file = new File([blob], "qr.jpg", { type: blob.type });
          result = await api.inquiryByImage(file, session.token);
        } else {
          result = await api.inquiryByPayload(qrData, session.token);
        }
        setInquiry(result);
      } catch (err) {
        setInquiryError(err instanceof Error ? err.message : "Gagal memproses QR");
      }
    }

    fetchInquiry();
  }, [qrData, imageParam, session]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  if (!session) {
    return (
      <AppShell showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Memuat..." />
        </div>
      </AppShell>
    );
  }

  if (inquiryError) {
    return (
      <AppShell showNav={false}>
        <Header title="Detail Pembayaran" showBack />
        <div className="px-5 py-10 text-center">
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-3" />
          <p className="text-octo-gray-700 font-medium">{inquiryError}</p>
          <Button onClick={() => router.back()} className="mt-5 rounded-xl bg-octo-red text-white">
            Kembali
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!inquiry) {
    return (
      <AppShell showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Memproses QR..." />
        </div>
      </AppShell>
    );
  }

  const finalAmount = inquiry.fixed_amount > 0 ? inquiry.fixed_amount : parseInt(amount) || 0;

  const handleConfirm = () => setStage("confirm");

  const handlePay = async () => {
    setStage("processing");
    setPaymentError("");

    try {
      const payment = await api.createPayment(inquiry.inquiry_id, finalAmount, pin, session.token);
      const transactionId = payment.transaction_id;

      let pollCount = 0;
      const maxPolls = 15;

      pollingRef.current = setInterval(async () => {
        pollCount++;
        try {
          const status = await api.getTransactionStatus(transactionId, session.token);
          if (status.status !== "PENDING") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (status.status === "SUCCESS") {
              updateBalance(status.final_balance);
            }
            setPaymentStatus(status);
            setStage("result");
          } else if (pollCount >= maxPolls) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setPaymentError("Waktu tunggu habis. Silakan cek kembali.");
            setStage("result");
          }
        } catch {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setPaymentError("Gagal memeriksa status pembayaran.");
          setStage("result");
        }
      }, 2000);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Pembayaran gagal");
      setStage("result");
    }
  };

  // ============ INQUIRY STAGE ============
  if (stage === "inquiry") {
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

  // ============ CONFIRM STAGE (PIN) ============
  if (stage === "confirm") {
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

  // ============ PROCESSING STAGE ============
  if (stage === "processing") {
    return (
      <AppShell showNav={false}>
        <div className="min-h-screen flex flex-col items-center justify-center px-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-octo-red-light flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-octo-red animate-spin" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-octo-red/20 pulse-ring" />
          </div>
          <h2 className="text-lg font-semibold text-octo-gray-900 mb-2">Memproses Pembayaran</h2>
          <p className="text-sm text-octo-gray-500 text-center">
            Mohon tunggu, pembayaran Anda sedang diproses...
          </p>
        </div>
      </AppShell>
    );
  }

  // ============ RESULT STAGE ============
  if (stage === "result") {
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
              onClick={() => router.push("/")}
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
              onClick={() => router.push("/")}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-octo-red-600 to-octo-red-800 text-white font-semibold text-sm shadow-lg shadow-octo-red/25"
            >
              <Home className="w-4 h-4 mr-1.5" />
              Beranda
            </Button>
            <Button
              onClick={() => router.push("/scan")}
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

  return null;
}

export default function ScanResultPage() {
  return (
    <Suspense
      fallback={
        <AppShell showNav={false}>
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner text="Memuat..." />
          </div>
        </AppShell>
      }
    >
      <ScanResultContent />
    </Suspense>
  );
}
