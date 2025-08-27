import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { AdminReduxProvider } from "@/components/providers/AdminReduxProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Encreasl Admin Dashboard",
  description: "Admin dashboard for Encreasl ecommerce marketing agency",
  robots: "noindex, nofollow", // Prevent search engine indexing
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <AdminReduxProvider>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {children as any}
        </AdminReduxProvider>
      </body>
    </html>
  );
}
