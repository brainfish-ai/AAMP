import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets:  ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets:  ["latin"],
});

export const metadata: Metadata = {
  title:       "AAMP — Agent-to-Agent Messaging Protocol",
  description: "Live demo of cross-company agent communication via NATS JetStream, DID identity, and federated relays.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="antialiased font-[family-name:var(--font-geist)]">
        {children}
      </body>
    </html>
  );
}
