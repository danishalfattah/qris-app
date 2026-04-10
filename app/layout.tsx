import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "QRIS Pay - Mobile Payment",
  description: "Scan & Pay dengan QRIS - Pembayaran digital cepat dan aman",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#B71C1C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col items-center bg-[#1a1a2e] overflow-x-hidden">
        <AuthProvider>
          <div className="mobile-shell">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
