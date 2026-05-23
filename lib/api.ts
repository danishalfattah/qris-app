import type {
  AuthResponse,
  InquiryResponse,
  PaymentResponse,
  TransactionStatusResponse,
} from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const DEMO_ACCOUNT: AuthResponse = {
  token: "mock-jwt-token-demo",
  account_id: "ACC-DEMO",
  balance: 2500000,
};

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  await delay(80);
  if (!username || !password) {
    throw new Error("Username dan password wajib diisi");
  }
  if (username === "demo" && password === "demo1234") {
    return DEMO_ACCOUNT;
  }
  return {
    token: "mock-jwt-token-" + username,
    account_id: "ACC-" + username.toUpperCase(),
    balance: 1000000,
  };
}

export async function register(
  username: string,
  password: string,
  initial_balance: number
): Promise<AuthResponse> {
  await delay(80);
  if (!username || !password) {
    throw new Error("Username dan password wajib diisi");
  }
  if (initial_balance < 0) {
    throw new Error("Saldo awal tidak boleh negatif");
  }
  return {
    token: "mock-jwt-token-" + username,
    account_id: "ACC-" + username.toUpperCase(),
    balance: initial_balance,
  };
}

export async function inquiryByPayload(
  qris_payload: string,
  _token: string
): Promise<InquiryResponse> {
  await delay(80);
  return {
    merchant_id: "MRC001",
    merchant_name: "Warung Makan Sederhana",
    terminal_id: "TRM001",
    city: "Jakarta",
    fixed_amount: 25000,
    inquiry_id: "INQ-" + Date.now(),
  };
}

export async function inquiryByImage(
  _imageFile: File,
  _token: string
): Promise<InquiryResponse> {
  await delay(100);
  return {
    merchant_id: "MRC002",
    merchant_name: "Toko Serba Ada",
    terminal_id: "TRM002",
    city: "Bandung",
    fixed_amount: 0,
    inquiry_id: "INQ-" + Date.now(),
  };
}

export async function createPayment(
  inquiry_id: string,
  amount: number,
  pincode: string,
  _token: string
): Promise<PaymentResponse> {
  await delay(80);
  if (pincode.length !== 6) {
    throw new Error("PIN harus 6 digit");
  }
  if (amount <= 0) {
    throw new Error("Jumlah pembayaran harus lebih dari 0");
  }
  return {
    status: "PENDING",
    transaction_id: "TRX-" + Date.now(),
    message: "Pembayaran sedang diproses",
    estimated_completion: new Date(Date.now() + 5000).toISOString(),
  };
}

export async function getTransactionStatus(
  transaction_id: string,
  _token: string,
  currentBalance: number,
  amount: number
): Promise<TransactionStatusResponse> {
  await delay(80);
  return {
    transaction_id,
    status: "SUCCESS",
    final_balance: currentBalance - amount,
    timestamp: new Date().toISOString(),
  };
}
