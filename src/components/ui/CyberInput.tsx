// src/components/ui/CyberInput.tsx
import React from 'react';

interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const CyberInput: React.FC<CyberInputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-blue-400">{label}</label>
      )}
      <div className="relative">
        <input
          className={`
            w-full bg-black/50 border border-blue-500/30
            rounded-lg p-4 text-white placeholder-blue-300/50
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
            transition-all duration-300
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};