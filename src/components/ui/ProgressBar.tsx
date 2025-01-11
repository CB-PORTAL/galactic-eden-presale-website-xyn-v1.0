// src/components/ui/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  color?: 'blue' | 'purple';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  color = 'blue'
}) => {
  const baseColor = color === 'blue' ? 'blue' : 'purple';
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-blue-400">{label}</span>
        <span className="text-blue-300">{value}%</span>
      </div>
      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500`}
          style={{ 
            width: `${value}%`,
            backgroundColor: color === 'blue' ? '#3B82F6' : '#8B5CF6'
          }}
        />
      </div>
    </div>
  );
};