// src/components/monitoring/FeeVisualizer.tsx
"use client";

import React from 'react';

export function FeeVisualizer() {
  return (
    <div className="cyber-card p-4 mt-4">
      <h3 className="text-lg font-bold mb-4">SOL Fee Breakdown</h3>
      <div className="space-y-4">
        {/* Token Account Creation */}
        <div className="relative">
          <div className="h-8 bg-blue-500/20 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: '40%' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span>Token Account Creation</span>
            <span>~0.00204428 SOL</span>
          </div>
        </div>

        {/* Rent */}
        <div className="relative">
          <div className="h-8 bg-purple-500/20 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-purple-500" 
              style={{ width: '20%' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span>Account Rent</span>
            <span>~0.00089776 SOL</span>
          </div>
        </div>

        {/* ATA */}
        <div className="relative">
          <div className="h-8 bg-green-500/20 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-green-500" 
              style={{ width: '15%' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span>Associated Token Account (ATA)</span>
            <span>~0.00061280 SOL</span>
          </div>
        </div>
      </div>
    </div>
  );
}