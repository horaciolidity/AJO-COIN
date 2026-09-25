import React from 'react';
import { Flame } from 'lucide-react';

interface ComboMeterProps {
  comboCount: number;
}

export const ComboMeter: React.FC<ComboMeterProps> = ({ comboCount }) => {
  if (comboCount < 5) return null;

  let title = 'GARLIC COMBO';
  let badgeColor = 'from-amber-500 to-yellow-400';

  if (comboCount >= 50) {
    title = '⚡ GARLIC FRENZY ⚡';
    badgeColor = 'from-purple-600 via-pink-500 to-red-500';
  } else if (comboCount >= 25) {
    title = '🔥 GARLIC COMBO 🔥';
    badgeColor = 'from-orange-500 to-amber-500';
  }

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 animate-bounce-short">
      <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${badgeColor} text-white font-black text-xs tracking-wider shadow-lg flex items-center gap-1.5 border border-white/30`}>
        <Flame className="w-4 h-4 fill-white animate-pulse" />
        <span>{title} x{comboCount}</span>
      </div>
    </div>
  );
};
