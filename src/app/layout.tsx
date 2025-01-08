'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopMenuBar from "@/components/TopMenuBar";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const WalletContextProvider = dynamic(
  () => import('@/components/WalletContextProvider'),
  { 
    ssr: false,
    loading: () => null
  }
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}
      >
        <Suspense fallback={null}>
          <WalletContextProvider>
            <TopMenuBar />
            <main className="flex-grow">{children}</main>
          </WalletContextProvider>
        </Suspense>
      </body>
    </html>
  );
}
