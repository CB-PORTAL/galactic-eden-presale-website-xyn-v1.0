// src/components/ui/MetricCard.tsx
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext }) => {
  return (
    <div className="cyber-card p-4 text-center">
      <div className="text-sm text-blue-400 mb-2">{label}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtext && <div className="text-xs text-blue-300">{subtext}</div>}
    </div>
  );
};