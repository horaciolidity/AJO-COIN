/**
 * CombatProgressPanel — Phase 3
 * Shows the current win streak, next streak bonus milestone, and session combat stats.
 * Placed in TapGame above the CombatArena.
 */
import React from 'react';
import { useGame } from '../../context/GameContext';
import { Flame, Trophy, Zap } from 'lucide-react';


interface StreakTier {
  minWins: number;
  label: string;
  mult: string;
  color: string;
  glow: string;
}

const STREAK_TIERS: StreakTier[] = [
  { minWins: 1,  label: 'Calentando',    mult: 'x1',    color: 'text-gray-400',   glow: '' },
  { minWins: 3,  label: '¡En Racha!',    mult: 'x1.25', color: 'text-amber-300',  glow: 'shadow-[0_0_8px_rgba(251,191,36,0.6)]' },
  { minWins: 5,  label: '¡Imparable!',   mult: 'x1.5',  color: 'text-orange-400', glow: 'shadow-[0_0_12px_rgba(249,115,22,0.7)]' },
  { minWins: 10, label: '¡MODO FRENZY!', mult: 'x2',    color: 'text-red-400',    glow: 'shadow-[0_0_18px_rgba(239,68,68,0.9)]' },
];

function getCurrentTier(streak: number): StreakTier {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streak >= STREAK_TIERS[i].minWins) return STREAK_TIERS[i];
  }
  return STREAK_TIERS[0];
}

function getNextTier(streak: number): StreakTier | null {
  for (const tier of STREAK_TIERS) {
    if (streak < tier.minWins) return tier;
  }
  return null;
}

export const CombatProgressPanel: React.FC = () => {
  const { combatWinStreak, stats } = useGame();

  const tier = getCurrentTier(combatWinStreak);
  const next = getNextTier(combatWinStreak);
  const progressToNext = next
    ? Math.min(100, Math.round((combatWinStreak / next.minWins) * 100))
    : 100;

  if (combatWinStreak === 0) return null;

  return (
    <div
      className={`w-full rounded-2xl border bg-black/50 px-3 py-2 flex items-center gap-3 transition-all duration-300 ${
        combatWinStreak >= 10
          ? 'border-red-500/60 animate-pulse'
          : combatWinStreak >= 5
          ? 'border-orange-500/50'
          : combatWinStreak >= 3
          ? 'border-amber-500/40'
          : 'border-white/10'
      } ${tier.glow}`}
    >
      {/* Streak Icon + Count */}
      <div className="flex flex-col items-center shrink-0">
        <Flame
          className={`w-5 h-5 ${tier.color} ${combatWinStreak >= 5 ? 'animate-bounce' : ''}`}
        />
        <span className={`text-base font-black leading-none ${tier.color}`}>
          {combatWinStreak}
        </span>
      </div>

      {/* Middle: label + progress bar to next tier */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${tier.color}`}>
            {tier.label} — Bonus {tier.mult}
          </span>
          {next && (
            <span className="text-[9px] text-gray-400 font-bold">
              {next.minWins - combatWinStreak} vic. → {next.mult}
            </span>
          )}
        </div>
        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              combatWinStreak >= 10
                ? 'bg-gradient-to-r from-red-500 to-rose-400'
                : combatWinStreak >= 5
                ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400'
            }`}
            style={{ width: `${progressToNext}%` }}
          />
        </div>
      </div>

      {/* Right: quick stat pills */}
      <div className="flex flex-col items-end gap-0.5 shrink-0 text-[9px] font-bold">
        <div className="flex items-center gap-1 text-emerald-400">
          <Zap className="w-2.5 h-2.5" />
          <span>{stats.xp.toLocaleString()} XP</span>
        </div>
        <div className="flex items-center gap-1 text-purple-300">
          <Trophy className="w-2.5 h-2.5" />
          <span>LVL {stats.level || 1}</span>
        </div>
      </div>
    </div>
  );
};
