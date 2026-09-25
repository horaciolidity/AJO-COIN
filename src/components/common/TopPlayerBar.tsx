import React from 'react';
import { useGame } from '../../context/GameContext';
import { useWeb3 } from '../../context/Web3Context';
import { formatNumber, formatAddress } from '../../utils/format';
import { Wallet, ShieldCheck, Zap } from 'lucide-react';

export const TopPlayerBar: React.FC = () => {
  const { user, stats, inventory, boxes, setIsWalletModalOpen, setActiveTab } = useGame();
  const { wallet } = useWeb3();

  const totalBoxesCount = boxes.length;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-purple-500/20 px-3 py-2 shadow-lg backdrop-blur-md">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* User Info & Level */}
        <div 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="relative">
            <img
              src={user.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150'}
              alt={user.username}
              className="w-10 h-10 rounded-full border-2 border-sprout-500 object-cover shadow-sm"
            />
            {user.isAdmin && (
              <span className="absolute -bottom-1 -right-1 bg-purpleAjo-700 text-white rounded-full p-[2px]" title="Admin">
                <ShieldCheck className="w-3 h-3" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white truncate max-w-[90px]">{user.username}</span>
              <span className="text-[10px] bg-sprout-500/20 text-sprout-400 border border-sprout-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                LVL {stats.level}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
              Garlic Farmer
            </p>
          </div>
        </div>

        {/* Stats Grid Compact Pills */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Energy */}
          <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded-lg text-xs font-semibold text-yellow-400">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-pulse" />
            <span>{stats.energy}</span>
          </div>

          {/* Raw Garlic */}
          <div className="flex items-center gap-1 bg-garlic-100/10 border border-garlic-200/30 px-2 py-1 rounded-lg text-xs font-semibold text-garlic-100">
            <span className="text-sm">🧄</span>
            <span>{formatNumber(inventory.rawGarlic)}</span>
          </div>

          {/* GC Coins */}
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg text-xs font-semibold text-amber-300">
            <span className="text-sm">🪙</span>
            <span>{formatNumber(inventory.gcBalance)}</span>
          </div>

          {/* Boxes */}
          <div className="flex items-center gap-1 bg-amber-800/20 border border-amber-700/40 px-2 py-1 rounded-lg text-xs font-semibold text-amber-200">
            <span className="text-sm">📦</span>
            <span>{totalBoxesCount}</span>
          </div>

          {/* AJO Token */}
          <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/50 px-2 py-1 rounded-lg text-xs font-bold text-emerald-300 shadow-sm">
            <span className="text-sm">💰</span>
            <span>{inventory.ajoBalance.toFixed(2)} AJO</span>
          </div>

          {/* Wallet Button */}
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              wallet.isConnected
                ? 'bg-purple-900/60 text-purple-200 border border-purple-500/40 hover:bg-purple-800/70'
                : 'bg-gradient-to-r from-sprout-600 to-emerald-500 text-white shadow-md hover:brightness-110'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{wallet.isConnected ? formatAddress(wallet.address, 3) : 'CONNECT'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
