import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useWeb3 } from '../../context/Web3Context';
import { GarlicBoxItem } from '../../types';
import { X, Sparkles, Wallet, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface ClaimAjoModalProps {
  box: GarlicBoxItem | null;
  onClose: () => void;
}

export const ClaimAjoModal: React.FC<ClaimAjoModalProps> = ({ box, onClose }) => {
  const { claimAjoFromBox, showToast } = useGame();
  const { wallet, connectWallet } = useWeb3();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!box) return null;

  const handleClaim = async () => {
    setIsProcessing(true);
    triggerHaptic('medium');

    // Simulate Web3 transaction / off-chain verification delay
    await new Promise((r) => setTimeout(r, 1200));

    claimAjoFromBox(box.id);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl border border-emerald-500/40 p-6 shadow-2xl relative text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-6xl animate-bounce">📦🧄</div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-sprout-400 uppercase tracking-widest bg-sprout-500/20 px-3 py-1 rounded-full border border-sprout-500/30 inline-block">
            BOX COMPLETE!
          </span>
          <h3 className="text-xl font-extrabold text-white">GARLIC BOX FULL</h3>
          <p className="text-xs text-gray-300">
            You successfully filled a <span className="text-amber-300 font-bold">{box.boxType}</span> Garlic Box with {box.capacity} Garlics!
          </p>
        </div>

        {/* Reward Card */}
        <div className="glass-card-green p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-emerald-300/80 uppercase font-semibold block">Earned Reward</span>
            <span className="text-lg font-black text-emerald-300">+1.0 AJO TOKEN</span>
          </div>
          <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>

        {/* Web3 status info */}
        <div className="glass-card p-3 rounded-xl text-left space-y-1 text-xs border border-white/10">
          <div className="flex justify-between items-center text-gray-300">
            <span>Destination Wallet:</span>
            <span className="font-mono text-purple-300 font-semibold">
              {wallet.isConnected ? `${wallet.address?.substring(0, 6)}...` : 'Off-Chain Balance'}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-400 text-[11px]">
            <span>Network:</span>
            <span>{wallet.isConnected ? wallet.chainName : 'Virtual In-Game'}</span>
          </div>
        </div>

        <button
          disabled={isProcessing}
          onClick={handleClaim}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sprout-500 to-emerald-600 hover:from-sprout-400 hover:to-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-sprout-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>CONFIRMING CLAIM...</span>
            </>
          ) : (
            <>
              <span>CLAIM 1 AJO</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-[10px] text-gray-400">
          Rule: 1 Full Garlic Box = 1 AJO. Confirm to record progress off-chain/on-chain.
        </p>
      </div>
    </div>
  );
};
