"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import { getMockHistory } from "@/lib/mock-data";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  ArrowRightLeft,
  CreditCard,
  Smartphone,
  Filter,
  FileText,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

const filterTabs = [
  { value: "ALL" as const, label: "Semua" },
  { value: "IN" as const, label: "Masuk" },
  { value: "OUT" as const, label: "Keluar" },
];

function getCategoryIcon(category: Transaction["category"]) {
  switch (category) {
    case "QRIS": return QrCode;
    case "TRANSFER": return ArrowRightLeft;
    case "TOPUP": return Smartphone;
    case "PAYMENT": return CreditCard;
    default: return CreditCard;
  }
}

function getStatusColor(status: Transaction["status"]) {
  switch (status) {
    case "SUCCESS": return "bg-octo-green-light text-octo-green";
    case "PENDING": return "bg-amber-50 text-amber-600";
    case "FAILED": return "bg-red-50 text-red-600";
    default: return "bg-octo-gray-100 text-octo-gray-600";
  }
}

function getStatusLabel(status: Transaction["status"]) {
  switch (status) {
    case "SUCCESS": return "Berhasil";
    case "PENDING": return "Pending";
    case "FAILED": return "Gagal";
    default: return status;
  }
}

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "IN" | "OUT">("ALL");

  const history = useMemo(() => {
    return getMockHistory(1, 50, activeFilter);
  }, [activeFilter]);

  // Group transactions by date
  const groupedTx = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    history.transactions.forEach((tx) => {
      const date = formatDate(tx.timestamp);
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return groups;
  }, [history]);

  return (
    <AppShell>
      <Header title="Riwayat Transaksi" />

      <div className="px-5 py-4">
        {/* e-Statement Link */}
        <Link
          href="/e-statement"
          className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-octo-gray-100 px-4 py-3 mb-4 hover:bg-octo-gray-50 transition-colors active:scale-[0.98] fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-octo-gray-900">e-Statement</p>
              <p className="text-[11px] text-octo-gray-500">Unduh mutasi rekening bulanan</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-octo-gray-400" />
        </Link>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.97]",
                activeFilter === tab.value
                  ? "bg-octo-red text-white shadow-md shadow-octo-red/20"
                  : "bg-white text-octo-gray-600 border border-octo-gray-200 hover:bg-octo-gray-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        {Object.keys(groupedTx).length === 0 ? (
          <div className="text-center py-16 fade-in">
            <div className="w-16 h-16 bg-octo-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Filter className="w-7 h-7 text-octo-gray-400" />
            </div>
            <p className="text-sm font-medium text-octo-gray-600">Tidak ada transaksi</p>
            <p className="text-xs text-octo-gray-400 mt-1">
              Belum ada transaksi untuk filter ini
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(groupedTx).map(([date, transactions]) => (
              <div key={date} className="fade-in">
                <p className="text-xs font-semibold text-octo-gray-500 mb-2 uppercase tracking-wider">
                  {date}
                </p>
                <div className="bg-white rounded-2xl shadow-sm border border-octo-gray-100 divide-y divide-octo-gray-100 overflow-hidden">
                  {transactions.map((tx) => {
                    const Icon = getCategoryIcon(tx.category);
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-octo-gray-50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            tx.type === "IN"
                              ? "bg-octo-green-light text-octo-green"
                              : "bg-octo-red-light text-octo-red"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-octo-gray-900 truncate">
                              {tx.merchantName || tx.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-octo-gray-500">
                              {formatTime(tx.timestamp)}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                                getStatusColor(tx.status)
                              )}
                            >
                              {getStatusLabel(tx.status)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-0.5 justify-end">
                            {tx.type === "IN" ? (
                              <ArrowDownLeft className="w-3 h-3 text-octo-green" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-octo-red" />
                            )}
                            <p
                              className={cn(
                                "text-sm font-semibold",
                                tx.type === "IN"
                                  ? "text-octo-green"
                                  : "text-octo-gray-900"
                              )}
                            >
                              {tx.type === "IN" ? "+" : "-"}
                              {formatCurrency(tx.amount)}
                            </p>
                          </div>
                          {tx.fee > 0 && (
                            <p className="text-[10px] text-octo-gray-400 mt-0.5">
                              Fee: {formatCurrency(tx.fee)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
