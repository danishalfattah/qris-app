// ============ Auth Types ============
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
}

// ============ QRIS Inquiry Types ============
export interface InquiryRequest {
  qrData: string;
}

export interface MerchantInfo {
  merchantId: string;
  merchantName: string;
  merchantCity: string;
  merchantCategory: string;
  terminalId: string;
  postalCode: string;
  countryCode: string;
}

export interface InquiryResponse {
  success: boolean;
  transactionId: string;
  merchant: MerchantInfo;
  amount: number | null; // null for dynamic QR
  currency: string;
  fee: number;
  isDynamic: boolean;
}

// ============ Payment Types ============
export interface PaymentRequest {
  transactionId: string;
  amount: number;
  pin: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  referenceNumber: string;
  amount: number;
  fee: number;
  totalAmount: number;
  merchantName: string;
  timestamp: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  message: string;
}

// ============ Balance Types ============
export interface BalanceResponse {
  success: boolean;
  accountNumber: string;
  accountName: string;
  availableBalance: number;
  effectiveBalance: number;
  currency: string;
  lastUpdated: string;
}

// ============ Transaction History Types ============
export interface HistoryParams {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  type?: "ALL" | "IN" | "OUT";
}

export interface Transaction {
  id: string;
  type: "IN" | "OUT";
  category: "QRIS" | "TRANSFER" | "TOPUP" | "PAYMENT";
  description: string;
  merchantName?: string;
  amount: number;
  fee: number;
  balance: number;
  timestamp: string;
  referenceNumber: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
}

export interface HistoryResponse {
  success: boolean;
  transactions: Transaction[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============ Statistics Types ============
export type PeriodFilter = "7D" | "1M" | "3M" | "6M" | "1Y";

export interface CategoryBreakdown {
  category: Transaction["category"];
  label: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface TransactionStatistics {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
}
