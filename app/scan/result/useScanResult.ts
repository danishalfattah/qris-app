import { useState, useEffect, useRef } from "react";
import * as api from "@/lib/api";
import type { InquiryResponse, TransactionStatusResponse } from "@/lib/types";

export interface AuthSession {
  token: string;
  account_id: string;
  balance: number;
}

export function useScanResult(
  qrData: string,
  imageParam: string | null,
  session: AuthSession | null,
  updateBalance: (balance: number) => void
) {
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

  const finalAmount = inquiry
    ? inquiry.fixed_amount > 0
      ? inquiry.fixed_amount
      : parseInt(amount) || 0
    : 0;

  const handleConfirm = () => setStage("confirm");

  const handlePay = async () => {
    if (!session || !inquiry) return;
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

  return {
    stage,
    setStage,
    inquiry,
    inquiryError,
    amount,
    setAmount,
    pin,
    setPin,
    paymentStatus,
    paymentError,
    finalAmount,
    handleConfirm,
    handlePay,
  };
}
