import React, { useEffect, useRef } from 'react';
import { Flame, Zap } from 'lucide-react';

interface ComboMeterProps {
  comboCount: number;
}

export const ComboMeter: React.FC<ComboMeterProps> = ({ comboCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Screen shake on extreme combos
  useEffect(() => {
    if (comboCount > 0 && comboCount % 10 === 0 && comboCount >= 20) {
      const el = document.body;
      el.classList.add('combo-shake');
      setTimeout(() => el.classList.remove('combo-shake'), 400);
    }
  }, [comboCount]);

  if (comboCount < 5) return null;

  const isFrenzy = comboCount >= 50;
  const isFire = comboCount >= 25;
  const isHot = comboCount >= 15;

  let title = 'GARLIC COMBO';
  let badgeColor = 'from-amber-500 to-yellow-400';
  let glowColor = 'shadow-amber-500/50';
  let textSize = 'text-xs';

  if (isFrenzy) {
    title = '⚡ GARLIC FRENZY ⚡';
    badgeColor = 'from-purple-600 via-pink-500 to-red-500';
    glowColor = 'shadow-purple-500/70';
    textSize = 'text-sm';
  } else if (isFire) {
    title = '🔥 ON FIRE 🔥';
    badgeColor = 'from-orange-600 to-red-500';
    glowColor = 'shadow-orange-500/60';
    textSize = 'text-xs';
  } else if (isHot) {
    title = '💥 COMBO 💥';
    badgeColor = 'from-amber-500 to-orange-500';
    glowColor = 'shadow-amber-500/50';
  }

  // Calculate next frenzy milestone countdown
  const MILESTONES = [50, 100, 250, 500, 1000, 2000, 3000, 5000, 10000];
  const nextMilestone = MILESTONES.find((m) => m > comboCount) || (comboCount + 1000);
  const remainingTaps = nextMilestone - comboCount;

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center mb-1 space-y-1"
    >
      <div
        className={`
          px-4 py-1.5 rounded-full bg-gradient-to-r ${badgeColor} text-white font-black ${textSize}
          tracking-wider flex items-center gap-1.5 border border-white/30
          shadow-lg ${glowColor}
          ${isFrenzy ? 'animate-pulse scale-110' : isFire ? 'animate-bounce' : ''}
          transition-all duration-200
        `}
      >
        {isFrenzy ? (
          <Zap className="w-4 h-4 fill-white animate-spin" />
        ) : (
          <Flame className="w-4 h-4 fill-white animate-pulse" />
        )}
        <span>{title} x{comboCount}</span>
        {isFrenzy && <Zap className="w-4 h-4 fill-white animate-spin" />}
      </div>

      {/* Countdown to Next Frenzy Milestone Bonus */}
      {isFrenzy && (
        <div className="bg-purple-950/90 border border-pink-500/40 px-3 py-0.5 rounded-full text-[10px] font-black text-pink-300 flex items-center gap-1 shadow-md animate-pulse">
          <span>🎯 Próximo Hito ({nextMilestone}):</span>
          <span className="text-yellow-300 font-extrabold">¡Faltan {remainingTaps} taps!</span>
          <span className="text-emerald-400 font-bold">(+500 GC & +1 🦷)</span>
        </div>
      )}
    </div>
  );
};
