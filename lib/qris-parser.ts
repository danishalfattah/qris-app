import type { InquiryResponse } from "./types";

type TLVMap = Map<string, string>;

function parseTLV(payload: string): TLVMap {
  const map: TLVMap = new Map();
  let i = 0;
  while (i + 4 <= payload.length) {
    const tag = payload.slice(i, i + 2);
    const len = parseInt(payload.slice(i + 2, i + 4), 10);
    if (isNaN(len) || i + 4 + len > payload.length) break;
    const value = payload.slice(i + 4, i + 4 + len);
    map.set(tag, value);
    i += 4 + len;
  }
  return map;
}

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function parseQris(payload: string): InquiryResponse {
  const trimmed = payload.trim();

  if (!trimmed || trimmed.length < 20) {
    throw new Error("QR tidak valid atau bukan QRIS");
  }

  // CRC validation: tag 63 is always last, "6304" + 4 hex chars
  const crcIndex = trimmed.lastIndexOf("6304");
  if (crcIndex === -1) {
    throw new Error("QR tidak valid atau bukan QRIS");
  }
  const dataForCrc = trimmed.slice(0, crcIndex + 4);
  const crcValue = trimmed.slice(crcIndex + 4, crcIndex + 8);
  const computed = crc16(dataForCrc);
  if (computed !== crcValue.toUpperCase()) {
    throw new Error("QR rusak atau tidak valid (CRC gagal)");
  }

  const root = parseTLV(trimmed);

  // Tag 59: Merchant Name (required)
  const merchantName = root.get("59");
  if (!merchantName) {
    throw new Error("Merchant tidak ditemukan dalam QR ini");
  }

  // Tag 60: Merchant City
  const city = root.get("60") ?? "Indonesia";

  // Tag 54: Transaction Amount (optional — 0 means user inputs amount)
  const amountStr = root.get("54");
  const fixedAmount = amountStr ? Math.round(parseFloat(amountStr)) : 0;

  // Tag 62: Additional data — sub-tag 05 is Reference Label (terminal id)
  const additionalData = root.get("62");
  const terminalId = additionalData
    ? parseTLV(additionalData).get("05") ?? "-"
    : "-";

  const randomHex = (len: number) =>
    Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join("");

  return {
    merchant_id: "MRC-" + randomHex(8),
    merchant_name: merchantName,
    terminal_id: "TRM-" + randomHex(6),
    city,
    fixed_amount: fixedAmount,
    inquiry_id: "INQ-" + Date.now(),
  };
}
