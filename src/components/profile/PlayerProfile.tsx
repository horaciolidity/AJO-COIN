import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useWeb3 } from '../../context/Web3Context';
import { useAuth } from '../../context/AuthContext';
import { Referrals } from './Referrals';
import { formatAddress } from '../../utils/format';
import { Wallet, Flame, Package, Award, ShieldCheck, RefreshCw, Star, Send, Mail, LogOut, CheckCircle, Lock, Sparkles } from 'lucide-react';

export const PlayerProfile: React.FC = () => {
  const { user, stats, inventory, currentStage, setIsWalletModalOpen, resetLocalProgress } = useGame();
  const { wallet } = useWeb3();
  const { setIsAuthModalOpen } = useAuth();
  const [tab, setTab] = useState<'profile' | 'referrals'>('profile');

  const activeWalletAddress = wallet.isConnected ? wallet.address : user.walletAddress;

  // ── Dynamic Real-Time Achievements Evaluator ──────────────────────────────
  const dynamicAchievements = [
    {
      id: 'a1',
      code: 'FIRST_GARLIC',
      name: 'Primer Ajo',
      description: 'Cosechaste tu primer ajo crudo',
      icon: '🧄',
      unlocked: stats.totalGarlicHarvested >= 1 || inventory.rawGarlic > 0 || stats.totalTaps >= 10,
    },
    {
      id: 'a2',
      code: 'FIRST_EVOLUTION',
      name: 'Primera Evolución',
      description: 'Evolucionaste tu ajo por primera vez',
      icon: '🌟',
      unlocked: currentStage.order > 1 || stats.currentStageId !== 'COMMON_SMALL',
    },
    {
      id: 'a4',
      code: 'BRONZE_MASTERY',
      name: 'Maestro de Bronce',
      description: 'Alcanzaste la etapa Ajo de Bronce o superior',
      icon: '🥉',
      unlocked: currentStage.rank !== 'COMMON',
    },
    {
      id: 'a5',
      code: 'GOLDEN_LEGEND',
      name: 'Leyenda Dorada',
      description: 'Alcanzaste la etapa Ajo de Oro, Platino o Diamante',
      icon: '🥇',
      unlocked: ['GOLD', 'PLATINUM', 'DIAMOND'].includes(currentStage.rank),
    },
    {
      id: 'a6',
      code: 'TEETH_COLLECTOR',
      name: 'Coleccionista de Dientes',
      description: 'Acumulaste 50 o más Garlic Teeth',
      icon: '🦷',
      unlocked: inventory.garlicTeeth >= 50,
    },
    {
      id: 'a7',
      code: 'BOX_MASTER',
      name: 'Maestro de Cajas',
      description: 'Completaste y canjeaste tu primera caja de ajo',
      icon: '📦',
      unlocked: stats.totalBoxesCompleted >= 1,
    },
    {
      id: 'a8',
      code: 'HIT_POWER_BOOST',
      name: 'Golpe Potenciado',
      description: 'Compraste tu primer aumento de Poder de Golpe con dientes',
      icon: '💥',
      unlocked: (inventory.hitPowerLevel || 0) >= 1 || stats.powerPerTap > 1,
    },
  ];

  const unlockedCount = dynamicAchievements.filter(a => a.unlocked).length;

  const renderAuthBadge = () => {
    switch (user.authMethod) {
      case 'TELEGRAM':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
            <Send className="w-3 h-3" /> Telegram
          </span>
        );
      case 'WEB3':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
            <Wallet className="w-3 h-3" /> Auth Web3
          </span>
        );
      case 'EMAIL':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
            <Mail className="w-3 h-3" /> Correo
          </span>
        );
      default:
        return null;
    }
  };

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
                <ShieldCheck className="w-4 h-4 text-purple-300" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              {renderAuthBadge()}
            </div>
            <h2 className="text-xl font-black text-white">{user.username}</h2>
            {user.email && <p className="text-xs text-gray-400 font-mono">{user.email}</p>}
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-xs bg-sprout-500/20 text-sprout-300 border border-sprout-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase inline-flex items-center gap-1">
                <span>{currentStage.badgeIcon}</span>
                <span>{currentStage.name}</span>
              </span>
            </div>
          </div>

          {/* Wallet Address badge */}
          <div className="space-y-2">
            {user.authMethod === 'WEB3' || activeWalletAddress ? (
              <div className="inline-flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-900/50 border border-purple-500/40 text-xs">
                <div className="flex items-center gap-1.5 text-purple-200 font-mono">
                  <Wallet className="w-3.5 h-3.5 text-purple-300" />
                  <span>{formatAddress(activeWalletAddress || '0x...', 6)}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                </div>
                <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">
                  ✓ Wallet Vinculada al Perfil
                </span>
              </div>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/50 border border-purple-500/40 text-xs font-mono text-purple-200 hover:bg-purple-800/60 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 text-purple-300" />
                <span>Conectar Wallet Web3</span>
              </button>
            )}

            <div className="pt-1">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[11px] text-purple-300 hover:text-white underline font-semibold inline-flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Cambiar Método de Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
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

          {/* Real-Time Achievements & Badges */}
          <div className="glass-panel p-4 rounded-3xl border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-400" /> LOGROS & INSIGNIAS REALES
              </h4>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                {unlockedCount} / {dynamicAchievements.length} Desbloqueados
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {dynamicAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    ach.unlocked
                      ? 'bg-gradient-to-r from-purple-950/50 to-emerald-950/40 border-emerald-500/40 text-white shadow-md'
                      : 'bg-white/5 border-white/5 opacity-50'
                  }`}
                >
                  <span className="text-3xl shrink-0">{ach.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-extrabold text-xs text-white truncate">{ach.name}</h5>
                    <p className="text-[10px] text-gray-300">{ach.description}</p>
                  </div>
                  {ach.unlocked ? (
                    <span className="ml-auto shrink-0 text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> DESBLOQUEADO
                    </span>
                  ) : (
                    <span className="ml-auto shrink-0 text-[9px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase border border-white/10 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-gray-500" /> BLOQUEADO
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
