// ============ Auth Types ============
export interface AuthResponse {
  token: string;
  account_id: string;
  balance: number;
}

// ============ QRIS Inquiry Types ============
export interface InquiryResponse {
  merchant_id: string;
  merchant_name: string;
  terminal_id: string;
  city: string;
  fixed_amount: number;
  inquiry_id: string;
}

// ============ Payment Types ============
export interface PaymentResponse {
  status: string;
  transaction_id: string;
  message: string;
  estimated_completion: string;
}

// ============ Transaction Status Types ============
export interface TransactionStatusResponse {
  transaction_id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  final_balance: number;
  timestamp: string;
}
