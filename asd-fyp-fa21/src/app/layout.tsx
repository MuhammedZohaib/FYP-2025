import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASD Detections",
  description: "AI Based Multimodal Solution for Austism Screening",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
