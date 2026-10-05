import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useWeb3 } from '../../context/Web3Context';
import { formatNumber, formatAddress } from '../../utils/format';
import { Wallet, ShieldCheck, Zap, Star, Timer, Coins } from 'lucide-react';

export const TopPlayerBar: React.FC = () => {
  const { user, stats, inventory, currentStage, setIsWalletModalOpen, setActiveTab } = useGame();
  const { wallet } = useWeb3();

  // ── Airdrop Countdown State ──────────────────────────────────────────────
  const [airdropTimeLeft, setAirdropTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const savedDate = localStorage.getItem('ajo_airdrop_target_date');
      const targetTime = savedDate
        ? new Date(savedDate).getTime()
        : new Date(Date.now() + 30 * 86400000).getTime();

      const diff = Math.max(0, targetTime - Date.now());

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setAirdropTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-purple-500/20 px-3 py-1.5 shadow-lg backdrop-blur-md">
      <div className="max-w-md mx-auto space-y-1.5">

        {/* Banner 1: Ajo Coin Balance & Pre-configured Airdrop Countdown */}
        <div className="flex items-center justify-between bg-black/60 border border-purple-500/30 rounded-xl px-2.5 py-1 text-[11px]">
          {/* Ajo Coin counter */}
          <div className="flex items-center gap-1.5" title="AJO Tokens reclamados (Balance de Inventario)">
            <Coins className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-extrabold text-white">
              {(inventory.ajoBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] font-black bg-purple-500/30 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/40">
              $AJO
            </span>
          </div>

          {/* Airdrop Live Countdown */}
          <div className="flex items-center gap-1 text-amber-300 font-mono font-extrabold text-[10px]" title="Cuenta regresiva del Airdrop AJO">
            <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span className="text-gray-400 font-bold text-[9px] uppercase mr-0.5">Airdrop en:</span>
            <span className="bg-amber-950/80 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded-md">
              {airdropTimeLeft.days}d {String(airdropTimeLeft.hours).padStart(2, '0')}h {String(airdropTimeLeft.minutes).padStart(2, '0')}m {String(airdropTimeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>

        {/* User Info & Stats Pills */}
        <div className="flex items-center justify-between gap-2">
          {/* User Info & Evolution Stage */}
          <div
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="relative">
              <img
                src={user.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150'}
                alt={user.username}
                className="w-9 h-9 rounded-full border-2 border-sprout-500 object-cover shadow-sm"
              />
              {user.isAdmin && (
                <span className="absolute -bottom-1 -right-1 bg-purpleAjo-700 text-white rounded-full p-[2px]" title="SuperAdmin">
                  <ShieldCheck className="w-3 h-3 text-purple-300" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white truncate max-w-[85px]">{user.username}</span>
                <span className="text-[9px] bg-sprout-500/20 text-sprout-400 border border-sprout-500/30 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                  <span>{currentStage.badgeIcon}</span>
                  <span className="truncate max-w-[60px]">{currentStage.name}</span>
                </span>
              </div>
              <p className="text-[9px] text-gray-400 font-medium tracking-wide uppercase flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span>{stats.xp.toLocaleString()} XP</span>
              </p>
            </div>
          </div>

          {/* Stats Grid Compact Pills */}
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {/* Energy */}
            <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 px-1.5 py-0.5 rounded-lg text-xs font-semibold text-yellow-400" title="Energía">
              <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400 animate-pulse" />
              <span>{stats.energy}</span>
            </div>

            {/* Garlic Teeth */}
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/50 px-1.5 py-0.5 rounded-lg text-xs font-extrabold text-amber-300 shadow-sm" title="Garlic Teeth">
              <span className="text-xs">🧄</span>
              <span>{formatNumber(inventory.garlicTeeth)}</span>
            </div>

            {/* GC Coins */}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-lg text-xs font-semibold text-amber-200" title="Garlic Coins (GC)">
              <span className="text-xs">🪙</span>
              <span>{formatNumber(inventory.gcBalance)}</span>
            </div>

            {/* Wallet Button */}
            {(() => {
              const activeWallet = wallet.isConnected ? wallet.address : user.walletAddress;
              return (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                    activeWallet
                      ? 'bg-purple-900/60 text-purple-200 border border-purple-500/40 hover:bg-purple-800/70'
                      : 'bg-gradient-to-r from-sprout-600 to-emerald-500 text-white shadow-md hover:brightness-110'
                  }`}
                >
                  <Wallet className="w-3 h-3" />
                  <span>{activeWallet ? formatAddress(activeWallet, 3) : 'WALLET'}</span>
                </button>
              );
            })()}
          </div>
        </div>

      </div>
    </header>
  );
};
