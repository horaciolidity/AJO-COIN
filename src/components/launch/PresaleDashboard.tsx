import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useWeb3 } from '../../context/Web3Context';
import { formatTimeRemaining, formatAddress } from '../../utils/format';
import { Rocket, ShieldCheck, ExternalLink, Copy, Check, Wallet, ArrowRight, Clock } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export const PresaleDashboard: React.FC = () => {
  const { presale, showToast, setIsWalletModalOpen } = useGame();
  const { wallet } = useWeb3();
  const [copied, setCopied] = useState(false);
  const [buyAmountEth, setBuyAmountEth] = useState<string>('0.1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(214320); // 2 days 11 hours

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressPercentage = Math.min(100, (presale.raisedEth / presale.targetEth) * 100);

  const handleCopyContract = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(presale.contractAddress);
    setCopied(true);
    showToast('Address Copied!', 'Contract address copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuy = async () => {
    if (!wallet.isConnected) {
      triggerHaptic('warning');
      setIsWalletModalOpen(true);
      return;
    }

    const eth = parseFloat(buyAmountEth);
    if (isNaN(eth) || eth <= 0) {
      showToast('Invalid Amount', 'Please enter a valid ETH contribution amount.', 'error');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('medium');

    // Simulate Web3 wallet transaction popup & confirmation
    await new Promise((r) => setTimeout(r, 1500));

    const purchasedAjo = eth * presale.presaleRate;
    triggerHaptic('success');
    showToast('🎉 Presale Contribution Successful!', `Purchased ${purchasedAjo.toLocaleString()} AJO for ${eth} ETH!`, 'success');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
          FAIR LAUNCH PRESALE
        </span>
        <h2 className="text-2xl font-black text-white text-glow-gold flex items-center justify-center gap-2">
          <span>🚀</span> AJO LAUNCH <span>🚀</span>
        </h2>
        <p className="text-xs text-gray-300">
          The official community fair launch token of the AJO Garlic Farming ecosystem.
        </p>
      </div>

      {/* Countdown Card */}
      <div className="glass-panel p-4 rounded-3xl border border-yellow-500/40 text-center space-y-2 shadow-xl bg-gradient-to-b from-yellow-950/20 to-purple-950/40">
        <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center justify-center gap-1">
          <Clock className="w-4 h-4 text-yellow-400 animate-pulse" /> FAIR LAUNCH IN
        </span>
        <div className="text-2xl font-mono font-black text-white text-glow-gold tracking-widest">
          {formatTimeRemaining(timeRemainingSeconds)}
        </div>
        <p className="text-[10px] text-gray-400">Official listing date announced on Telegram community channel.</p>
      </div>

      {/* Presale Raised Progress */}
      <div className="glass-panel p-4 rounded-3xl border border-sprout-500/30 space-y-3 shadow-xl">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-sprout-400 uppercase">Presale Raising Progress</span>
          <span className="text-white font-mono">
            {presale.raisedEth} ETH / {presale.targetEth} ETH
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden p-0.5 border border-sprout-500/30">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-sprout-400 to-yellow-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.7)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-gray-300 pt-1">
          <span>Rate: 1 ETH = {presale.presaleRate.toLocaleString()} AJO</span>
          <span className="text-emerald-400 font-extrabold">{progressPercentage.toFixed(1)}% RAISED</span>
        </div>
      </div>

      {/* Buy AJO Presale Card */}
      <div className="glass-card-gold p-4 rounded-3xl border border-yellow-500/40 space-y-3 shadow-xl">
        <h3 className="text-sm font-extrabold text-white flex items-center justify-between">
          <span>BUY AJO TOKENS</span>
          <span className="text-[10px] text-yellow-300 font-normal">Min 0.01 ETH - Max 5 ETH</span>
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-2xl border border-white/10">
            <span className="text-xs font-bold text-gray-300 pl-1">ETH</span>
            <input
              type="number"
              step="0.05"
              value={buyAmountEth}
              onChange={(e) => setBuyAmountEth(e.target.value)}
              className="bg-transparent text-right w-full font-mono text-sm font-bold text-white outline-none"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-gray-300 px-1">
            <span>You will receive:</span>
            <span className="font-extrabold text-emerald-300">
              {((parseFloat(buyAmountEth) || 0) * presale.presaleRate).toLocaleString()} AJO
            </span>
          </div>

          <button
            disabled={isSubmitting}
            onClick={handleBuy}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-yellow-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>PROCESSING TRANSACTION...</span>
            ) : wallet.isConnected ? (
              <>
                <Rocket className="w-4 h-4" />
                <span>BUY AJO NOW</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>CONNECT WALLET TO BUY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Token Contract & Social Links */}
      <div className="glass-panel p-4 rounded-3xl border border-purple-500/30 space-y-3 text-xs">
        <h4 className="font-extrabold text-white text-sm">AJO TOKEN METRICS</h4>

        <div className="space-y-2 text-gray-300">
          <div className="flex justify-between items-center">
            <span>Network:</span>
            <span className="font-semibold text-purple-300">{presale.network}</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Total Supply:</span>
            <span className="font-semibold text-white">{presale.totalSupply}</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Presale Allocation:</span>
            <span className="font-semibold text-emerald-400">{presale.presaleAllocation}</span>
          </div>

          {/* Contract address copy */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-[10px] text-gray-400 block mb-1">Contract Address</span>
            <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/10">
              <span className="font-mono text-[11px] text-purple-200 truncate mr-2">
                {presale.contractAddress}
              </span>
              <button
                onClick={handleCopyContract}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
