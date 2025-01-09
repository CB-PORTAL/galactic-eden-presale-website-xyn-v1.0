"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function TokenNavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-transparent">
          <img
            src="/images/xyn-logo.png"
            alt="XYN Token"
            className="w-full h-full object-contain"
          />
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-300 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-48 rounded-lg bg-gray-900/95 
                      backdrop-blur-sm border border-blue-500/20 shadow-xl"
        >
          <div className="py-2">
            <a
              href="#presale"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-blue-500/10"
            >
              Presale Details
            </a>
            <a
              href="#wallet"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-blue-500/10"
            >
              Connect Wallet
            </a>
            <a
              href="#about"
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-blue-500/10"
            >
              About XYN
            </a>
          </div>
        </div>
      )}
    </div>
  );
}