// src/app/layout.tsx
"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import BaseLayout from "@/components/layout/BaseLayout";
import '@solana/wallet-adapter-react-ui/styles.css'; // Add this import

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <BaseLayout>{children}</BaseLayout>
        </Providers>
      </body>
    </html>
  );
}