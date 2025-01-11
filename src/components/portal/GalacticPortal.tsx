// src/components/portal/GalacticPortal.tsx
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ExchangeInterface } from './ExchangeInterface';
import { TokenMetrics } from './TokenMetrics';
import { PortalStatus } from './PortalStatus';
import { PortalAnimation } from '../animations/PortalAnimation';
import { ParticleField } from '../animations/ParticleField';
import { HologramEffect } from '../animations/HologramEffect';
import { useTokenExchange } from '@/hooks/useTokenExchange';
import { usePortalState } from '@/hooks/usePortalState';

const GalacticPortal: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { portalState, activatePortal } = usePortalState();
  const { exchangeTokens, exchangeStatus } = useTokenExchange();
  const [transactionHash, setTransactionHash] = React.useState<string>('');

  React.useEffect(() => {
    if (connected && portalState.status === 'idle') {
      activatePortal();
    }
  }, [connected, portalState.status, activatePortal]);

  const handleExchange = async (xynAmount: string) => {
    try {
      const result = await exchangeTokens(xynAmount);
      setTransactionHash(result.signature);
    } catch (error) {
      console.error('Exchange failed:', error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-space">
      <ParticleField density={50} speed={1} />
      <HologramEffect enabled={portalState.isActive} />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="cyber-grid-bg">
          <header className="text-center mb-12">
            <h1 className="text-6xl font-bold cyberpunk-text">
              Galactic Eden Portal
            </h1>
            <p className="mt-4 text-xl text-blue-300">
              Exchange SOL for XYN • Enter the Future
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ExchangeInterface
              onExchange={handleExchange}
              isProcessing={exchangeStatus.isProcessing}
              connected={connected}
            />
            
            <TokenMetrics
              className="cyber-card-alt"
              publicKey={publicKey}
            />
          </div>

          <PortalStatus
            status={exchangeStatus}
            transactionHash={transactionHash}
          />
        </div>
      </div>

      <PortalAnimation active={portalState.isActive} />
    </div>
  );
};

export default GalacticPortal;