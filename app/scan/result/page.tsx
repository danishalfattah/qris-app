"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useScanResult } from "./useScanResult";
import InquiryStage from "./components/InquiryStage";
import ConfirmStage from "./components/ConfirmStage";
import ProcessingStage from "./components/ProcessingStage";
import ResultStage from "./components/ResultStage";

function ScanResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, updateBalance } = useAuth();
  const qrData = searchParams.get("qr") || "";
  const imageParam = searchParams.get("image");

  const s = useScanResult(qrData, imageParam, session, updateBalance);

  if (!session) {
    return (
      <AppShell showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Memuat..." />
        </div>
      </AppShell>
    );
  }

  if (s.inquiryError) {
    return (
      <AppShell showNav={false}>
        <div className="px-5 py-10 text-center">
          <XCircle className="w-14 h-14 text-red-400 mx-auto mb-3" />
          <p className="text-octo-gray-700 font-medium">{s.inquiryError}</p>
          <Button onClick={() => router.back()} className="mt-5 rounded-xl bg-octo-red text-white">
            Kembali
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!s.inquiry) {
    return (
      <AppShell showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Memproses QR..." />
        </div>
      </AppShell>
    );
  }

  switch (s.stage) {
    case "inquiry":
      return (
        <InquiryStage
          inquiry={s.inquiry}
          amount={s.amount}
          setAmount={s.setAmount}
          finalAmount={s.finalAmount}
          session={session}
          handleConfirm={s.handleConfirm}
        />
      );
    case "confirm":
      return (
        <ConfirmStage
          inquiry={s.inquiry}
          finalAmount={s.finalAmount}
          pin={s.pin}
          setPin={s.setPin}
          handlePay={s.handlePay}
        />
      );
    case "processing":
      return <ProcessingStage />;
    case "result":
      return (
        <ResultStage
          paymentStatus={s.paymentStatus}
          paymentError={s.paymentError}
          inquiry={s.inquiry}
          finalAmount={s.finalAmount}
          onHome={() => router.push("/")}
          onScan={() => router.push("/scan")}
        />
      );
  }
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
