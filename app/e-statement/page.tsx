"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { getMockHistory } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import {
  FileSpreadsheet,
  FileDown,
  Lightbulb,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Generate months from current month back 12 months
function generateMonths(): { month: number; year: number; label: string }[] {
  const months: { month: number; year: number; label: string }[] = [];
  const now = new Date();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      label: monthNames[d.getMonth()],
    });
  }

  return months;
}

// Group months by year
function groupByYear(months: { month: number; year: number; label: string }[]) {
  const groups: Record<number, typeof months> = {};
  months.forEach((m) => {
    if (!groups[m.year]) groups[m.year] = [];
    groups[m.year].push(m);
  });
  return groups;
}

// Get transaction count for a month
function getMonthTransactions(
  allTransactions: Transaction[],
  month: number,
  year: number
): { count: number; income: number; expense: number } {
  const filtered = allTransactions.filter((t) => {
    const d = new Date(t.timestamp);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  return {
    count: filtered.length,
    income: filtered
      .filter((t) => t.type === "IN")
      .reduce((sum, t) => sum + t.amount, 0),
    expense: filtered
      .filter((t) => t.type === "OUT")
      .reduce((sum, t) => sum + t.amount + t.fee, 0),
  };
}

// Generate PDF content and trigger download
function downloadPDF(
  monthLabel: string,
  year: number,
  transactions: Transaction[],
  accountName: string,
  accountNumber: string
) {
  const month = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ].indexOf(monthLabel);

  const filtered = transactions.filter((t) => {
    const d = new Date(t.timestamp);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const totalIn = filtered.filter((t) => t.type === "IN").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === "OUT").reduce((s, t) => s + t.amount + t.fee, 0);

  // Build simple text-based PDF content
  let content = `MUTASI REKENING - e-Statement\n`;
  content += `${"=".repeat(60)}\n\n`;
  content += `Nama      : ${accountName}\n`;
  content += `No. Rek   : ${accountNumber}\n`;
  content += `Periode   : ${monthLabel} ${year}\n`;
  content += `${"=".repeat(60)}\n\n`;

  if (filtered.length === 0) {
    content += `Tidak ada transaksi pada periode ini.\n`;
  } else {
    content += `${"Tanggal".padEnd(22)}${"Keterangan".padEnd(25)}${"Debit".padStart(15)}${"Kredit".padStart(15)}\n`;
    content += `${"-".repeat(77)}\n`;

    filtered.forEach((tx) => {
      const date = new Date(tx.timestamp).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const desc = (tx.merchantName || tx.description).slice(0, 22);
      const debit = tx.type === "OUT" ? `Rp ${(tx.amount + tx.fee).toLocaleString("id-ID")}` : "";
      const credit = tx.type === "IN" ? `Rp ${tx.amount.toLocaleString("id-ID")}` : "";

      content += `${date.padEnd(22)}${desc.padEnd(25)}${debit.padStart(15)}${credit.padStart(15)}\n`;
    });

    content += `${"-".repeat(77)}\n`;
    content += `${"TOTAL".padEnd(47)}${`Rp ${totalOut.toLocaleString("id-ID")}`.padStart(15)}${`Rp ${totalIn.toLocaleString("id-ID")}`.padStart(15)}\n`;
  }

  content += `\n${"=".repeat(60)}\n`;
  content += `Dokumen ini digenerate secara otomatis oleh QRIS Pay.\n`;
  content += `Tanggal cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}\n`;

  // Download as .txt (simple e-statement)
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `e-Statement_${monthLabel}_${year}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function EStatementPage() {
  const { user } = useAuth();
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const months = useMemo(() => generateMonths(), []);
  const grouped = useMemo(() => groupByYear(months), [months]);

  // Get all transactions (1 year range)
  const allTransactions = useMemo(() => {
    return getMockHistory(1, 100, "ALL", "1Y").transactions;
  }, []);

  if (!user) return null;

  const handleDownload = async (
    monthLabel: string,
    year: number,
    format: "pdf" | "excel"
  ) => {
    const key = `${monthLabel}-${year}-${format}`;
    setDownloadingKey(key);

    // Simulate download delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    downloadPDF(
      monthLabel,
      year,
      allTransactions,
      user.name,
      user.accountNumber
    );

    setDownloadingKey(null);
  };

  return (
    <AppShell showNav={false}>
      <Header title="e-Statement" showBack />

      <div className="px-5 py-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3 fade-in">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Gunakan <span className="font-semibold">tanggal lahir Anda (DDMMYYYY)</span> untuk
            membuka file e-statement yang terproteksi password.
          </p>
        </div>

        {/* Monthly Statements grouped by year */}
        {Object.entries(grouped)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([year, yearMonths]) => {
            return (
              <div key={year} className="fade-in">
                <p className="text-xs font-semibold text-octo-gray-500 mb-3 uppercase tracking-wider">
                  {year}
                </p>

                <div className="space-y-3">
                  {yearMonths.map((m) => {
                    const txData = getMonthTransactions(
                      allTransactions,
                      m.month,
                      m.year
                    );
                    const pdfKey = `${m.label}-${m.year}-pdf`;
                    const excelKey = `${m.label}-${m.year}-excel`;

                    return (
                      <div
                        key={`${m.month}-${m.year}`}
                        className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 p-4"
                      >
                        <div className="flex items-center justify-between">
                          {/* Month Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-octo-gray-50 rounded-xl flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-octo-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-octo-gray-900">
                                {m.label}
                              </p>
                              {txData.count > 0 ? (
                                <p className="text-[11px] text-octo-gray-500 mt-0.5">
                                  {txData.count} transaksi
                                </p>
                              ) : (
                                <p className="text-[11px] text-octo-gray-400 mt-0.5">
                                  Tidak ada transaksi
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Download Buttons */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDownload(m.label, m.year, "excel")}
                              disabled={downloadingKey === excelKey || txData.count === 0}
                              className={cn(
                                "flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 active:scale-95",
                                txData.count > 0
                                  ? "text-emerald-600 hover:text-emerald-700"
                                  : "text-octo-gray-300 cursor-not-allowed"
                              )}
                            >
                              <FileSpreadsheet className={cn(
                                "w-4 h-4",
                                downloadingKey === excelKey && "animate-pulse"
                              )} />
                              <span>Excel</span>
                            </button>

                            <div className="w-px h-5 bg-octo-gray-200" />

                            <button
                              onClick={() => handleDownload(m.label, m.year, "pdf")}
                              disabled={downloadingKey === pdfKey || txData.count === 0}
                              className={cn(
                                "flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 active:scale-95",
                                txData.count > 0
                                  ? "text-octo-red hover:text-octo-red-800"
                                  : "text-octo-gray-300 cursor-not-allowed"
                              )}
                            >
                              <FileDown className={cn(
                                "w-4 h-4",
                                downloadingKey === pdfKey && "animate-pulse"
                              )} />
                              <span>PDF</span>
                            </button>
                          </div>
                        </div>

                        {/* Mini summary if has transactions */}
                        {txData.count > 0 && (
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-octo-gray-100">
                            <div className="flex-1">
                              <p className="text-[10px] text-octo-gray-400 uppercase tracking-wider">Masuk</p>
                              <p className="text-xs font-semibold text-octo-green mt-0.5">
                                +{formatCurrency(txData.income)}
                              </p>
                            </div>
                            <div className="w-px h-6 bg-octo-gray-100" />
                            <div className="flex-1">
                              <p className="text-[10px] text-octo-gray-400 uppercase tracking-wider">Keluar</p>
                              <p className="text-xs font-semibold text-octo-red mt-0.5">
                                -{formatCurrency(txData.expense)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </AppShell>
  );
}
