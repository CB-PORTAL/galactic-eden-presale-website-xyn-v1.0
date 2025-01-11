// src/hooks/usePortalState.ts
import { useState, useCallback } from 'react';

export interface PortalState {
  status: 'idle' | 'active' | 'processing';
  isActive: boolean;
}

export function usePortalState() {
  const [portalState, setPortalState] = useState<PortalState>({
    status: 'idle',
    isActive: false
  });

  const activatePortal = useCallback(() => {
    setPortalState({
      status: 'active',
      isActive: true
    });
  }, []);

  return { portalState, activatePortal };
}