// src/components/ui/CyberButton.tsx
import React from 'react';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  loading,
  variant = 'primary',
  fullWidth,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        relative overflow-hidden
        ${variant === 'primary' ? 'cyber-button-primary' : 'cyber-button-secondary'}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'animate-pulse' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10" />
      <span className="relative z-10">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            {children}
          </div>
        ) : (
          children
        )}
      </span>
    </button>
  );
};