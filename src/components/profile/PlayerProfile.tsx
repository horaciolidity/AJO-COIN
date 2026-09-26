import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useWeb3 } from '../../context/Web3Context';
import { Referrals } from './Referrals';
import { formatAddress } from '../../utils/format';
import { User, Wallet, Trophy, Flame, Package, Coins, Award, ShieldCheck, RefreshCw, Star } from 'lucide-react';

export const PlayerProfile: React.FC = () => {
  const { user, stats, inventory, currentStage, achievements, setIsWalletModalOpen, resetLocalProgress } = useGame();
  const { wallet } = useWeb3();
  const [tab, setTab] = useState<'profile' | 'referrals'>('profile');

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">
      {/* Profile Header Card */}
      <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 text-center space-y-3 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-purple-900/40 via-sprout-950/30 to-purple-900/40" />

        <div className="relative z-10 space-y-2">
          <div className="relative inline-block">
            <img
              src={user.photoUrl || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150'}
              alt={user.username}
              className="w-20 h-20 rounded-full border-4 border-sprout-500 mx-auto object-cover shadow-xl"
            />
            {user.isAdmin && (
              <span className="absolute bottom-0 right-0 bg-purpleAjo-700 text-white rounded-full p-1 border-2 border-black" title="Admin">
                <ShieldCheck className="w-4 h-4" />
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-black text-white">{user.username}</h2>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-xs bg-sprout-500/20 text-sprout-300 border border-sprout-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase inline-flex items-center gap-1">
                <span>{currentStage.badgeIcon}</span>
                <span>{currentStage.name}</span>
              </span>
            </div>
          </div>

          {/* Wallet Address badge */}
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-900/50 border border-purple-500/40 text-xs font-mono text-purple-200 hover:bg-purple-800/60 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-purple-300" />
            <span>{wallet.isConnected ? formatAddress(wallet.address, 4) : 'Conectar Wallet Web3'}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Stats & Achievements vs Referrals */}
      <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-bold">
        <button
          onClick={() => setTab('profile')}
          className={`flex-1 py-2 rounded-xl uppercase transition-all ${
            tab === 'profile'
              ? 'bg-gradient-to-r from-sprout-500 to-emerald-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Estadísticas & Logros
        </button>
        <button
          onClick={() => setTab('referrals')}
          className={`flex-1 py-2 rounded-xl uppercase transition-all ${
            tab === 'referrals'
              ? 'bg-gradient-to-r from-sprout-500 to-emerald-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Referidos
        </button>
      </div>

      {tab === 'profile' ? (
        <div className="space-y-4">
          {/* Lifetime Game Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="glass-panel p-3 rounded-2xl border border-amber-500/20 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                <span className="text-sm">🧄</span> Garlic Teeth
              </span>
              <span className="text-base font-extrabold text-amber-300">{inventory.garlicTeeth.toLocaleString()}</span>
            </div>

            <div className="glass-panel p-3 rounded-2xl border border-purple-500/20 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Total XP
              </span>
              <span className="text-base font-extrabold text-yellow-300">{stats.xp.toLocaleString()}</span>
            </div>

            <div className="glass-panel p-3 rounded-2xl border border-purple-500/20 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Total Taps
              </span>
              <span className="text-base font-extrabold text-white">{stats.totalTaps.toLocaleString()}</span>
            </div>

            <div className="glass-panel p-3 rounded-2xl border border-purple-500/20 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase font-semibold flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-amber-400" /> Cajas Llenas
              </span>
              <span className="text-base font-extrabold text-amber-300">{stats.totalBoxesCompleted}</span>
            </div>
          </div>

          {/* Achievements Badges */}
          <div className="glass-panel p-4 rounded-3xl border border-purple-500/30 space-y-3">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-400" /> LOGROS & INSIGNIAS
            </h4>

            <div className="grid grid-cols-1 gap-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    ach.unlocked
                      ? 'bg-purple-900/30 border-purple-500/40 text-white'
                      : 'bg-white/5 border-white/5 opacity-50'
                  }`}
                >
                  <span className="text-3xl">{ach.icon}</span>
                  <div>
                    <h5 className="font-extrabold text-xs text-white">{ach.name}</h5>
                    <p className="text-[10px] text-gray-300">{ach.description}</p>
                  </div>
                  {ach.unlocked && (
                    <span className="ml-auto text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/30">
                      DESBLOQUEADO
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dev/Testing Reset Option */}
          <div className="pt-2 text-center">
            <button
              onClick={resetLocalProgress}
              className="text-[10px] text-gray-400 hover:text-rose-400 flex items-center justify-center gap-1 mx-auto font-semibold uppercase tracking-wider transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Reiniciar Progreso Local (Modo Pruebas)
            </button>
          </div>
        </div>
      ) : (
        <Referrals />
      )}
    </div>
  );
};
