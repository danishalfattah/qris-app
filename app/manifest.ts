import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QRIS Pay",
    short_name: "QRIS Pay",
    description: "Scan & Pay dengan QRIS - Pembayaran digital cepat dan aman",
    start_url: "/",
    display: "standalone",
    background_color: "#B71C1C",
    theme_color: "#B71C1C",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
