import React from 'react';

interface HologramEffectProps {
  enabled?: boolean;
}

export const HologramEffect: React.FC<HologramEffectProps> = ({ enabled = true }) => {
  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 animate-pulse" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-scan" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-scan-reverse" />
      </div>
    </div>
  );
};