// src/components/layout/BaseLayout.tsx
"use client";

import { ConnectButton } from "@/components/wallet/ConnectButton";

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0d1f]">
      <header className="fixed top-0 right-0 left-0 h-16 bg-[#0a0d1f]/90 backdrop-blur border-b border-blue-500/20">
        <div className="h-full max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">XYN Presale</span>
          </div>
          <ConnectButton />
        </div>
      </header>
      
      <main className="pt-20 px-6">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}