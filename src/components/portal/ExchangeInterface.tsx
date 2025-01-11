import React from 'react';

interface ExchangeInterfaceProps {
  onExchange: (amount: string) => Promise<void>;
  isProcessing: boolean;
  connected: boolean;
}

export const ExchangeInterface: React.FC<ExchangeInterfaceProps> = ({
  onExchange,
  isProcessing,
  connected,
}) => {
  const [xynAmount, setXynAmount] = React.useState('');
  const solAmount = Number(xynAmount) * 0.001;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!xynAmount || isProcessing) return;
    await onExchange(xynAmount);
  };

  return (
    <form onSubmit={handleSubmit} className="cyber-card p-6 space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <input
            type="number"
            value={xynAmount}
            onChange={(e) => setXynAmount(e.target.value)}
            className="w-full bg-black/50 border border-blue-500/30 rounded-lg p-4 text-white"
            placeholder="Enter XYN amount"
            disabled={!connected || isProcessing}
          />
        </div>
        
        <div className="text-right text-sm text-blue-400">
          ≈ {solAmount.toFixed(4)} SOL
        </div>
      </div>

      <button
        type="submit"
        disabled={!connected || isProcessing || !xynAmount}
        className={`w-full p-4 rounded-lg cyber-button
          ${isProcessing ? 'opacity-50' : 'hover:bg-blue-600/50'}`}
      >
        {isProcessing ? 'Processing...' : 'Enter Portal'}
      </button>
    </form>
  );
};