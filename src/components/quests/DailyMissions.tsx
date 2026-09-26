import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { RefreshCw, Gift, CheckCircle2, Clock } from 'lucide-react';

// Daily mission templates
const DAILY_TEMPLATES = [
  { code: 'DAILY_TAPS_50', title: '50 TAPS HOY', description: 'Toca el ajo 50 veces hoy', targetValue: 50, rewardGarlicTeeth: 20, rewardXp: 150, rewardGc: 200, icon: '🔥', difficulty: 'EASY' as const },
  { code: 'DAILY_TAPS_200', title: '200 TAPS HOY', description: 'Toca el ajo 200 veces en el día', targetValue: 200, rewardGarlicTeeth: 60, rewardXp: 400, rewardGc: 600, icon: '💪', difficulty: 'NORMAL' as const },
  { code: 'DAILY_HARVEST_10', title: 'COSECHA x10', description: 'Cosecha 10 ajos hoy', targetValue: 10, rewardGarlicTeeth: 30, rewardXp: 200, rewardGc: 350, icon: '🧄', difficulty: 'EASY' as const },
  { code: 'DAILY_HARVEST_30', title: 'COSECHA x30', description: 'Cosecha 30 ajos en el día', targetValue: 30, rewardGarlicTeeth: 80, rewardXp: 500, rewardGc: 800, icon: '🌾', difficulty: 'HARD' as const },
  { code: 'DAILY_COMBO_20', title: 'COMBO x20', description: 'Alcanza un combo de 20+ taps sin parar', targetValue: 20, rewardGarlicTeeth: 40, rewardXp: 300, rewardGc: 400, icon: '⚡', difficulty: 'NORMAL' as const },
  { code: 'DAILY_COMBO_50', title: 'FRENZY x50', description: '¡Llega a un combo de 50 taps seguidos!', targetValue: 50, rewardGarlicTeeth: 120, rewardXp: 800, rewardGc: 1200, icon: '🌪️', difficulty: 'HELL' as const },
];

const DIFFICULTY_STYLES = {
  EASY: { label: '🟢 EASY', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  NORMAL: { label: '🟡 NORMAL', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  HARD: { label: '🔴 HARD', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  HELL: { label: '☠️ HELL', bg: 'bg-purple-950/60', text: 'text-purple-300 font-black animate-pulse', border: 'border-purple-500/60' },
};

function getSeededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDailyMissions() {
  const today = new Date();
  // Seed based on YYYYMMDD so missions refresh daily
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  // Pick 3 unique missions using seeded randomness
  const shuffled = [...DAILY_TEMPLATES].sort((a, b) => {
    const ia = DAILY_TEMPLATES.indexOf(a);
    const ib = DAILY_TEMPLATES.indexOf(b);
    return getSeededRandom(seed + ia) - getSeededRandom(seed + ib);
  });

  return shuffled.slice(0, 3);
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

export const DailyMissions: React.FC = () => {
  const { stats, inventory, comboCount, showToast } = useGame();
  const missions = useMemo(() => getDailyMissions(), []);
  const timeLeft = getTimeUntilMidnight();

  // Track local progress from live game stats
  const getMissionProgress = (code: string, targetValue: number): number => {
    switch (code) {
      case 'DAILY_TAPS_50':
      case 'DAILY_TAPS_200':
        // Use today's session taps (approximated from current session)
        return Math.min(targetValue, stats.totalTaps > 0 ? stats.totalTaps % Math.max(targetValue * 2, 1000) : 0);
      case 'DAILY_HARVEST_10':
      case 'DAILY_HARVEST_30':
        return Math.min(targetValue, stats.totalGarlicHarvested % Math.max(targetValue * 2, 100));
      case 'DAILY_COMBO_20':
        return Math.min(targetValue, comboCount);
      case 'DAILY_COMBO_50':
        return Math.min(targetValue, comboCount);
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
          <span>📅</span> MISIONES DIARIAS
        </h3>
        <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-black/40 px-2 py-1 rounded-full border border-white/10">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Resetea en <span className="text-amber-300 font-bold">{timeLeft}</span></span>
        </div>
      </div>

      {/* Mission Cards */}
      {missions.map((m) => {
        const progress = getMissionProgress(m.code, m.targetValue);
        const progressPct = Math.min(100, Math.floor((progress / m.targetValue) * 100));
        const isCompleted = progressPct >= 100;
        const diff = DIFFICULTY_STYLES[m.difficulty];

        return (
          <div
            key={m.code}
            className={`glass-panel p-3.5 rounded-2xl border transition-all space-y-2 ${
              isCompleted
                ? 'border-amber-500/60 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                : 'border-purple-500/20'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xl shrink-0">
                  {m.icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-xs text-white">{m.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase ${diff.bg} ${diff.text} ${diff.border}`}>
                      {diff.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-300 mt-0.5">{m.description}</p>
                </div>
              </div>

              {isCompleted ? (
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  <span className="text-[9px] text-amber-300 font-bold">¡DONE!</span>
                </div>
              ) : (
                <span className="text-xs font-bold text-gray-400 shrink-0 mt-1">
                  {progress}/{m.targetValue}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span>🧄 +{m.rewardGarlicTeeth}</span>
              <span>⭐ +{m.rewardXp} XP</span>
              <span>💰 +{m.rewardGc} GC</span>
            </div>
          </div>
        );
      })}

      {/* Refresh note */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
        <RefreshCw className="w-3 h-3" />
        <span>Las misiones diarias se renuevan a medianoche automáticamente</span>
      </div>
    </div>
  );
};
