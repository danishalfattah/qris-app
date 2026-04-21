# QRIS UI — API Spec Alignment Design

**Date:** 2026-04-21  
**Status:** Approved

## Context

Project QRIS UI saat ini menggunakan mock data dari `lib/mock-data.ts` untuk semua data (auth, inquiry, payment, balance, history). Tidak ada API call nyata. Tujuan perubahan ini adalah menyesuaikan seluruh project agar strukturnya sesuai dengan `qris-api-spec.md` (base URL: `http://localhost:3000`).

**Catatan penting:** Backend belum selesai. `lib/api.ts` akan dibuat dengan mock data internal (bukan fetch nyata) yang strukturnya sudah sesuai API spec. Ketika backend siap, hanya implementasi di dalam fungsi-fungsi `lib/api.ts` yang perlu diganti — halaman dan komponen tidak perlu diubah.

Perubahan ini meliputi: pembuatan API service layer dengan mock, penyesuaian UI agar sesuai field response API spec, penambahan halaman register, dan penghapusan halaman yang tidak memiliki endpoint API pendukung.

---

## Arsitektur

### Pendekatan: API Service Layer Terpusat

Semua API call dikumpulkan dalam satu file `lib/api.ts`. Halaman-halaman tidak memanggil `fetch` langsung — semuanya melalui fungsi dari `lib/api.ts`. JWT token dikelola di `lib/auth.tsx` dan diteruskan ke fungsi API sebagai parameter.

### Diagram Dependency

```
app/login        → lib/auth.tsx → lib/api.ts (mock → nanti: http://localhost:3000)
app/register     → lib/auth.tsx → lib/api.ts
app/scan/result  → lib/api.ts (inquiry, payment, status)
app/page         → lib/auth.tsx (balance dari context)
app/profile      → lib/auth.tsx (account_id, balance)
```

---

## File Changes

### Dibuat Baru

#### `lib/api.ts`
Berisi semua fungsi berikut, **sementara diimplementasikan dengan mock data** (simulasi delay + return data hardcoded yang sesuai API spec). Ketika backend siap, ganti isi fungsi dengan `fetch()` ke endpoint yang sesuai.

| Fungsi | Target Endpoint | Mock behavior |
|--------|-----------------|---------------|
| `login(username, password)` | POST `/api/auth/login` | Return token dummy + account_id + balance |
| `register(username, password, initial_balance)` | POST `/api/auth/register` | Return token dummy + account_id + initial_balance |
| `inquiryByPayload(qris_payload, token)` | GET `/api/qris/inquiry/{qris_payload}` | Return merchant mock sesuai format API |
| `inquiryByImage(imageFile, token)` | POST `/api/qris/inquiry/image` | Return merchant mock yang sama |
| `createPayment(inquiry_id, amount, pincode, token)` | POST `/api/qris/payment` | Return transaction_id dummy + status PENDING |
| `getTransactionStatus(transaction_id, token)` | GET `/api/qris/status/{transaction_id}` | Return SUCCESS setelah 1x poll, dengan final_balance |

Semua fungsi async dengan simulasi delay maksimal 100ms. Signature dan return type sudah final sesuai API spec — tidak perlu diubah saat migrasi ke backend nyata.

#### `app/register/page.tsx`
Form register dengan field:
- `username` (alphanumeric, required)
- `password` (min 8 karakter, required)
- `initial_balance` (number ≥ 0, required)

Pada sukses: simpan token + account_id + balance ke auth context, redirect ke `/`. Sertakan link "Sudah punya akun? Login" → `/login`.

---

### Dimodifikasi

#### `lib/types.ts`
Hapus semua tipe yang bergantung pada mock data. Definisikan ulang tipe sesuai response API spec:

```typescript
// Auth
type AuthResponse = { token: string; account_id: string; balance: number }

// QRIS Inquiry
type InquiryResponse = {
  merchant_id: string; merchant_name: string; terminal_id: string;
  city: string; fixed_amount: number; inquiry_id: string;
}

// Payment
type PaymentResponse = {
  status: string; transaction_id: string; message: string; estimated_completion: string;
}

// Transaction Status
type TransactionStatusResponse = {
  transaction_id: string; status: 'PENDING' | 'SUCCESS' | 'FAILED';
  final_balance: number; timestamp: string;
}
```

#### `lib/auth.tsx`
- Ganti mock login dengan `api.login(username, password)`
- Tambah `register(username, password, initial_balance)` menggunakan `api.register()`
- State yang disimpan: `{ token, account_id, balance }`
- Tambah method `updateBalance(newBalance: number)` untuk dipakai setelah transaksi sukses
- Hapus semua referensi ke `MOCK_USERS` dan `mock-data.ts`
- localStorage key tetap `qris_user`, simpan `{ token, account_id, balance }`

#### `app/login/page.tsx`
- Ganti field `email` → `username`
- Tambah link "Daftar sekarang" → `/register`
- Hapus tampilan demo credentials

#### `app/scan/result/page.tsx`
Flow baru end-to-end:

1. **Inquiry stage:**
   - Dari kamera: decode QR payload → `inquiryByPayload(payload, token)`
   - Dari gallery: upload file → `inquiryByImage(file, token)`
   - Tampilkan: `merchant_name`, `city`, `terminal_id`
   - Jika `fixed_amount > 0`: tampilkan nominal tetap
   - Jika `fixed_amount === 0`: tampilkan input nominal (dynamic QR)
   - Simpan `inquiry_id` di state untuk langkah berikutnya

2. **Confirm stage:**
   - Tampilkan summary: merchant, nominal, `payment_method: "balance"`
   - Input PIN 6 digit

3. **Processing stage:**
   - Panggil `createPayment(inquiry_id, amount, pincode, token)` → dapat `transaction_id`
   - Polling `getTransactionStatus(transaction_id, token)` setiap 2 detik
   - Hentikan polling jika status bukan `PENDING`

4. **Result stage:**
   - Jika `SUCCESS`: tampilkan sukses + update balance di auth context via `updateBalance(final_balance)`
   - Jika `FAILED`: tampilkan pesan gagal

#### `app/page.tsx` (Home)
- Ambil `balance` dan `account_id` dari `useAuth()` context (bukan dari mock)
- Hapus tampilan "3 transaksi terkini" (tidak ada history endpoint)
- Pertahankan UI lain (greeting, scan button, promo banner)

#### `app/profile/page.tsx`
- Tampilkan hanya: `account_id` dan `balance` dari auth context
- Pertahankan tombol logout
- Hapus field `name`, `email`, `phone`, `avatarUrl` yang tidak ada di API

---

### Dihapus

| File/Folder | Alasan |
|-------------|--------|
| `lib/mock-data.ts` | Mock data dipindahkan ke dalam `lib/api.ts` per-fungsi |
| `app/history/` | Tidak ada user-facing transaction history endpoint |
| `app/balance/` | Tidak ada dedicated balance endpoint |
| `app/e-statement/` | Bergantung sepenuhnya pada mock data, tidak ada API pendukung |

BottomNav perlu diupdate: hapus link ke `/history` dan `/balance`, sesuaikan navigasi.

---

## Error Handling

- Semua API error menampilkan pesan ke user (toast atau inline error message)
- Jika token expired/invalid (401 response): auto-logout dan redirect ke `/login`
- Polling status dibatasi maksimal 30 detik (15 kali × 2 detik), jika timeout tampilkan error

---

## Verification

1. **Register:** Buka `/register`, isi form, submit → redirect ke home dengan balance sesuai `initial_balance`
2. **Login:** Logout, buka `/login`, masukkan username/password → redirect ke home
3. **Scan kamera:** Scan QR nyata → tampil merchant info → input PIN → processing → result sukses/gagal
4. **Scan gambar:** Tap gallery, upload gambar QR → flow sama seperti kamera
5. **Balance update:** Setelah transaksi sukses, balance di home dan profile terupdate sesuai `final_balance`
6. **Profile:** Cek halaman profile menampilkan `account_id` dan balance yang benar
7. **Navigasi:** Pastikan link ke `/history`, `/balance`, `/e-statement` sudah dihapus dari BottomNav
