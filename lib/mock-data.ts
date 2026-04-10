import type {
  User,
  InquiryResponse,
  PaymentResponse,
  BalanceResponse,
  Transaction,
  HistoryResponse,
  TransactionStatistics,
  PeriodFilter,
} from "./types";

// ============ Mock User ============
export const MOCK_USERS: { email: string; password: string; user: User }[] = [
  {
    email: "rafli@octo.id",
    password: "password123",
    user: {
      id: "USR001",
      name: "Rafli Ahmad",
      email: "rafli@octo.id",
      phone: "081234567890",
      accountNumber: "800123456789",
    },
  },
  {
    email: "demo@octo.id",
    password: "demo123",
    user: {
      id: "USR002",
      name: "Demo User",
      email: "demo@octo.id",
      phone: "089876543210",
      accountNumber: "800987654321",
    },
  },
];

// ============ Mock Inquiry Response ============
export function getMockInquiry(qrData: string): InquiryResponse {
  const merchants = [
    {
      merchantId: "MRC001",
      merchantName: "Warung Makan Barokah",
      merchantCity: "Jakarta",
      merchantCategory: "Food & Beverage",
      terminalId: "TRM001",
      postalCode: "12345",
      countryCode: "ID",
    },
    {
      merchantId: "MRC002",
      merchantName: "Toko Serba Ada Makmur",
      merchantCity: "Bandung",
      merchantCategory: "Retail",
      terminalId: "TRM002",
      postalCode: "40123",
      countryCode: "ID",
    },
    {
      merchantId: "MRC003",
      merchantName: "Kopi Nusantara",
      merchantCity: "Surabaya",
      merchantCategory: "Café",
      terminalId: "TRM003",
      postalCode: "60123",
      countryCode: "ID",
    },
  ];

  const idx = Math.floor(Math.random() * merchants.length);
  const isDynamic = Math.random() > 0.5;

  return {
    success: true,
    transactionId: `TXN${Date.now()}`,
    merchant: merchants[idx],
    amount: isDynamic ? null : Math.floor(Math.random() * 500000) + 10000,
    currency: "IDR",
    fee: 0,
    isDynamic,
  };
}

// ============ Mock Payment Response ============
export function getMockPayment(
  transactionId: string,
  amount: number,
  merchantName: string
): PaymentResponse {
  return {
    success: true,
    transactionId,
    referenceNumber: `REF${Date.now()}`,
    amount,
    fee: 0,
    totalAmount: amount,
    merchantName,
    timestamp: new Date().toISOString(),
    status: "SUCCESS",
    message: "Pembayaran berhasil",
  };
}

// ============ Mock Balance ============
export function getMockBalance(user: User): BalanceResponse {
  return {
    success: true,
    accountNumber: user.accountNumber,
    accountName: user.name,
    availableBalance: 15750000,
    effectiveBalance: 15750000,
    currency: "IDR",
    lastUpdated: new Date().toISOString(),
  };
}

// ============ Mock Transactions (expanded ~50 entries over 12 months) ============
let MOCK_TRANSACTIONS: Transaction[] = [
  // === April 2026 ===
  { id: "TRX001", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Warung Makan Barokah", amount: 35000, fee: 0, balance: 15750000, timestamp: "2026-04-01T12:30:00Z", referenceNumber: "REF20260401001", status: "SUCCESS" },
  { id: "TRX002", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "John Doe", amount: 500000, fee: 0, balance: 15785000, timestamp: "2026-04-01T10:15:00Z", referenceNumber: "REF20260401002", status: "SUCCESS" },

  // === Maret 2026 ===
  { id: "TRX003", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Kopi Nusantara", amount: 45000, fee: 0, balance: 15285000, timestamp: "2026-03-31T18:45:00Z", referenceNumber: "REF20260331001", status: "SUCCESS" },
  { id: "TRX004", type: "OUT", category: "PAYMENT", description: "Pembayaran Listrik", merchantName: "PLN Prepaid", amount: 200000, fee: 2500, balance: 15330000, timestamp: "2026-03-31T14:20:00Z", referenceNumber: "REF20260331002", status: "SUCCESS" },
  { id: "TRX005", type: "IN", category: "TOPUP", description: "Top Up Saldo", amount: 1000000, fee: 0, balance: 15530000, timestamp: "2026-03-30T09:00:00Z", referenceNumber: "REF20260330001", status: "SUCCESS" },
  { id: "TRX006", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Toko Serba Ada Makmur", amount: 125000, fee: 0, balance: 14530000, timestamp: "2026-03-30T07:30:00Z", referenceNumber: "REF20260330002", status: "SUCCESS" },
  { id: "TRX007", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Apotek Sehat", amount: 85000, fee: 0, balance: 14655000, timestamp: "2026-03-29T16:00:00Z", referenceNumber: "REF20260329001", status: "SUCCESS" },
  { id: "TRX008", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "PT ABC Corp", amount: 5000000, fee: 0, balance: 14740000, timestamp: "2026-03-28T08:00:00Z", referenceNumber: "REF20260328001", status: "SUCCESS" },
  { id: "TRX009", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Indomaret Sudirman", amount: 67500, fee: 0, balance: 9740000, timestamp: "2026-03-27T20:15:00Z", referenceNumber: "REF20260327001", status: "SUCCESS" },
  { id: "TRX010", type: "OUT", category: "PAYMENT", description: "Pembayaran Internet", merchantName: "Telkom IndiHome", amount: 350000, fee: 2500, balance: 9807500, timestamp: "2026-03-27T10:00:00Z", referenceNumber: "REF20260327002", status: "PENDING" },
  { id: "TRX011", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Alfamart Gatot Subroto", amount: 52000, fee: 0, balance: 10157500, timestamp: "2026-03-25T19:30:00Z", referenceNumber: "REF20260325001", status: "SUCCESS" },
  { id: "TRX012", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "Salary PT XYZ", amount: 8500000, fee: 0, balance: 10209500, timestamp: "2026-03-25T08:00:00Z", referenceNumber: "REF20260325002", status: "SUCCESS" },
  { id: "TRX013", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "McDonald's Kemang", amount: 89000, fee: 0, balance: 1709500, timestamp: "2026-03-22T12:10:00Z", referenceNumber: "REF20260322001", status: "SUCCESS" },
  { id: "TRX014", type: "OUT", category: "PAYMENT", description: "Pembayaran BPJS", merchantName: "BPJS Kesehatan", amount: 150000, fee: 1000, balance: 1798500, timestamp: "2026-03-20T09:00:00Z", referenceNumber: "REF20260320001", status: "SUCCESS" },
  { id: "TRX015", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Starbucks Pacific Place", amount: 72000, fee: 0, balance: 1948500, timestamp: "2026-03-18T15:30:00Z", referenceNumber: "REF20260318001", status: "SUCCESS" },
  { id: "TRX016", type: "IN", category: "TOPUP", description: "Top Up Saldo", amount: 500000, fee: 0, balance: 2020500, timestamp: "2026-03-15T11:00:00Z", referenceNumber: "REF20260315001", status: "SUCCESS" },
  { id: "TRX017", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Bakso Pak Kumis", amount: 25000, fee: 0, balance: 1520500, timestamp: "2026-03-12T13:00:00Z", referenceNumber: "REF20260312001", status: "SUCCESS" },
  { id: "TRX018", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "GrabFood", amount: 45000, fee: 0, balance: 1545500, timestamp: "2026-03-10T20:00:00Z", referenceNumber: "REF20260310001", status: "SUCCESS" },

  // === Februari 2026 ===
  { id: "TRX019", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "Salary PT XYZ", amount: 8500000, fee: 0, balance: 1590500, timestamp: "2026-02-25T08:00:00Z", referenceNumber: "REF20260225001", status: "SUCCESS" },
  { id: "TRX020", type: "OUT", category: "PAYMENT", description: "Pembayaran Listrik", merchantName: "PLN Prepaid", amount: 180000, fee: 2500, balance: 1590500, timestamp: "2026-02-28T10:30:00Z", referenceNumber: "REF20260228001", status: "SUCCESS" },
  { id: "TRX021", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "J.CO Donuts", amount: 98000, fee: 0, balance: 1770500, timestamp: "2026-02-22T14:00:00Z", referenceNumber: "REF20260222001", status: "SUCCESS" },
  { id: "TRX022", type: "OUT", category: "PAYMENT", description: "Pembayaran Internet", merchantName: "Telkom IndiHome", amount: 350000, fee: 2500, balance: 1868500, timestamp: "2026-02-20T09:00:00Z", referenceNumber: "REF20260220001", status: "SUCCESS" },
  { id: "TRX023", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "KFC Sudirman", amount: 65000, fee: 0, balance: 2218500, timestamp: "2026-02-18T12:30:00Z", referenceNumber: "REF20260218001", status: "SUCCESS" },
  { id: "TRX024", type: "IN", category: "TOPUP", description: "Top Up Saldo", amount: 2000000, fee: 0, balance: 2283500, timestamp: "2026-02-15T11:00:00Z", referenceNumber: "REF20260215001", status: "SUCCESS" },
  { id: "TRX025", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Tokopedia Merchant", amount: 250000, fee: 0, balance: 283500, timestamp: "2026-02-10T16:00:00Z", referenceNumber: "REF20260210001", status: "SUCCESS" },
  { id: "TRX026", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Es Teler 77", amount: 42000, fee: 0, balance: 533500, timestamp: "2026-02-05T13:00:00Z", referenceNumber: "REF20260205001", status: "SUCCESS" },

  // === Januari 2026 ===
  { id: "TRX027", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "Salary PT XYZ", amount: 8500000, fee: 0, balance: 575500, timestamp: "2026-01-25T08:00:00Z", referenceNumber: "REF20260125001", status: "SUCCESS" },
  { id: "TRX028", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Pizza Hut Delivery", amount: 135000, fee: 0, balance: 575500, timestamp: "2026-01-28T19:00:00Z", referenceNumber: "REF20260128001", status: "SUCCESS" },
  { id: "TRX029", type: "OUT", category: "PAYMENT", description: "Pembayaran Listrik", merchantName: "PLN Prepaid", amount: 210000, fee: 2500, balance: 710500, timestamp: "2026-01-27T10:00:00Z", referenceNumber: "REF20260127001", status: "SUCCESS" },
  { id: "TRX030", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Superindo", amount: 320000, fee: 0, balance: 920500, timestamp: "2026-01-22T17:00:00Z", referenceNumber: "REF20260122001", status: "SUCCESS" },
  { id: "TRX031", type: "IN", category: "TRANSFER", description: "THR Bonus", merchantName: "PT ABC Corp", amount: 3000000, fee: 0, balance: 1240500, timestamp: "2026-01-15T08:00:00Z", referenceNumber: "REF20260115001", status: "SUCCESS" },
  { id: "TRX032", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Martabak San Francisco", amount: 55000, fee: 0, balance: 1240500, timestamp: "2026-01-12T21:00:00Z", referenceNumber: "REF20260112001", status: "SUCCESS" },
  { id: "TRX033", type: "OUT", category: "PAYMENT", description: "Pembayaran Internet", merchantName: "Telkom IndiHome", amount: 350000, fee: 2500, balance: 1295500, timestamp: "2026-01-10T09:00:00Z", referenceNumber: "REF20260110001", status: "SUCCESS" },

  // === Desember 2025 ===
  { id: "TRX034", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "Salary PT XYZ", amount: 8500000, fee: 0, balance: 1645500, timestamp: "2025-12-25T08:00:00Z", referenceNumber: "REF20251225001", status: "SUCCESS" },
  { id: "TRX035", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Solaria", amount: 78000, fee: 0, balance: 1645500, timestamp: "2025-12-28T12:00:00Z", referenceNumber: "REF20251228001", status: "SUCCESS" },
  { id: "TRX036", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Cinema XXI", amount: 100000, fee: 0, balance: 1723500, timestamp: "2025-12-24T19:00:00Z", referenceNumber: "REF20251224001", status: "SUCCESS" },
  { id: "TRX037", type: "IN", category: "TOPUP", description: "Top Up Saldo", amount: 1000000, fee: 0, balance: 1823500, timestamp: "2025-12-20T11:00:00Z", referenceNumber: "REF20251220001", status: "SUCCESS" },
  { id: "TRX038", type: "OUT", category: "PAYMENT", description: "Pembayaran Listrik", merchantName: "PLN Prepaid", amount: 195000, fee: 2500, balance: 823500, timestamp: "2025-12-18T10:00:00Z", referenceNumber: "REF20251218001", status: "SUCCESS" },

  // === November 2025 ===
  { id: "TRX039", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "Salary PT XYZ", amount: 8500000, fee: 0, balance: 1018500, timestamp: "2025-11-25T08:00:00Z", referenceNumber: "REF20251125001", status: "SUCCESS" },
  { id: "TRX040", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Burger King", amount: 62000, fee: 0, balance: 1018500, timestamp: "2025-11-28T12:30:00Z", referenceNumber: "REF20251128001", status: "SUCCESS" },
  { id: "TRX041", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Gramedia", amount: 185000, fee: 0, balance: 1080500, timestamp: "2025-11-22T15:00:00Z", referenceNumber: "REF20251122001", status: "SUCCESS" },
  { id: "TRX042", type: "OUT", category: "PAYMENT", description: "Pembayaran Internet", merchantName: "Telkom IndiHome", amount: 350000, fee: 2500, balance: 1265500, timestamp: "2025-11-20T09:00:00Z", referenceNumber: "REF20251120001", status: "SUCCESS" },

  // === Oktober 2025 ===
  { id: "TRX043", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "Salary PT XYZ", amount: 8500000, fee: 0, balance: 1615500, timestamp: "2025-10-25T08:00:00Z", referenceNumber: "REF20251025001", status: "SUCCESS" },
  { id: "TRX044", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Nasi Goreng Kebon Sirih", amount: 30000, fee: 0, balance: 1615500, timestamp: "2025-10-28T20:00:00Z", referenceNumber: "REF20251028001", status: "SUCCESS" },
  { id: "TRX045", type: "OUT", category: "PAYMENT", description: "Pembayaran Listrik", merchantName: "PLN Prepaid", amount: 175000, fee: 2500, balance: 1645500, timestamp: "2025-10-18T10:00:00Z", referenceNumber: "REF20251018001", status: "SUCCESS" },

  // === September 2025 ===
  { id: "TRX046", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "Salary PT XYZ", amount: 8500000, fee: 0, balance: 1820500, timestamp: "2025-09-25T08:00:00Z", referenceNumber: "REF20250925001", status: "SUCCESS" },
  { id: "TRX047", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Hokben", amount: 55000, fee: 0, balance: 1820500, timestamp: "2025-09-22T12:00:00Z", referenceNumber: "REF20250922001", status: "SUCCESS" },
  { id: "TRX048", type: "IN", category: "TOPUP", description: "Top Up Saldo", amount: 500000, fee: 0, balance: 1875500, timestamp: "2025-09-15T11:00:00Z", referenceNumber: "REF20250915001", status: "SUCCESS" },

  // === Agustus 2025 ===
  { id: "TRX049", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "Salary PT XYZ", amount: 8500000, fee: 0, balance: 1375500, timestamp: "2025-08-25T08:00:00Z", referenceNumber: "REF20250825001", status: "SUCCESS" },
  { id: "TRX050", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Mixue Ice Cream", amount: 28000, fee: 0, balance: 1375500, timestamp: "2025-08-20T14:00:00Z", referenceNumber: "REF20250820001", status: "SUCCESS" },

  // === Juli 2025 ===
  { id: "TRX051", type: "IN", category: "TRANSFER", description: "Transfer Masuk", merchantName: "Salary PT XYZ", amount: 8500000, fee: 0, balance: 1403500, timestamp: "2025-07-25T08:00:00Z", referenceNumber: "REF20250725001", status: "SUCCESS" },
  { id: "TRX052", type: "OUT", category: "QRIS", description: "Pembayaran QRIS", merchantName: "Chatime", amount: 35000, fee: 0, balance: 1403500, timestamp: "2025-07-18T16:00:00Z", referenceNumber: "REF20250718001", status: "SUCCESS" },
];

// ============ Add new transaction (for payment results) ============
export function addTransaction(tx: Transaction) {
  MOCK_TRANSACTIONS = [tx, ...MOCK_TRANSACTIONS];
}

// ============ Period helpers ============
export function getPeriodDates(period: PeriodFilter): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "7D":
      start.setDate(end.getDate() - 7);
      break;
    case "1M":
      start.setMonth(end.getMonth() - 1);
      break;
    case "3M":
      start.setMonth(end.getMonth() - 3);
      break;
    case "6M":
      start.setMonth(end.getMonth() - 6);
      break;
    case "1Y":
      start.setFullYear(end.getFullYear() - 1);
      break;
  }

  return { start, end };
}

// ============ Get mock history with date filter ============
export function getMockHistory(
  page: number = 1,
  limit: number = 50,
  type: "ALL" | "IN" | "OUT" = "ALL",
  period?: PeriodFilter
): HistoryResponse {
  let filtered = MOCK_TRANSACTIONS;

  // Filter by period
  if (period) {
    const { start, end } = getPeriodDates(period);
    filtered = filtered.filter((t) => {
      const txDate = new Date(t.timestamp);
      return txDate >= start && txDate <= end;
    });
  }

  // Filter by type
  if (type !== "ALL") {
    filtered = filtered.filter((t) => t.type === type);
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);

  return {
    success: true,
    transactions: paginated,
    totalCount: filtered.length,
    page,
    limit,
    hasMore: end < filtered.length,
  };
}

// ============ Get transaction statistics ============
const CATEGORY_LABELS: Record<Transaction["category"], string> = {
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  TOPUP: "Top Up",
  PAYMENT: "Pembayaran",
};

export function getMockStatistics(
  period: PeriodFilter,
  type: "ALL" | "IN" | "OUT" = "ALL"
): TransactionStatistics {
  const { start, end } = getPeriodDates(period);

  let filtered = MOCK_TRANSACTIONS.filter((t) => {
    const txDate = new Date(t.timestamp);
    return txDate >= start && txDate <= end;
  });

  if (type !== "ALL") {
    filtered = filtered.filter((t) => t.type === type);
  }

  const totalIncome = filtered
    .filter((t) => t.type === "IN")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filtered
    .filter((t) => t.type === "OUT")
    .reduce((sum, t) => sum + t.amount + t.fee, 0);

  // Category breakdown
  const categoryMap = new Map<
    Transaction["category"],
    { amount: number; count: number }
  >();

  filtered.forEach((t) => {
    const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
    existing.amount += t.amount;
    existing.count += 1;
    categoryMap.set(t.category, existing);
  });

  const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      label: CATEGORY_LABELS[category],
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly trend
  const monthMap = new Map<string, { income: number; expense: number }>();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];

  filtered.forEach((t) => {
    const d = new Date(t.timestamp);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;

    const existing = monthMap.get(key) || { income: 0, expense: 0 };
    if (t.type === "IN") {
      existing.income += t.amount;
    } else {
      existing.expense += t.amount + t.fee;
    }
    monthMap.set(key, existing);
  });

  // Sort by chronological order
  const monthlyTrend = Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
    }))
    .reverse(); // oldest first

  return {
    totalIncome,
    totalExpense,
    netFlow: totalIncome - totalExpense,
    transactionCount: filtered.length,
    categoryBreakdown,
    monthlyTrend,
  };
}
