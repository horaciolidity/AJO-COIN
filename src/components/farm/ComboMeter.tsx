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

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center mb-1"
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
    </div>
  );
};
