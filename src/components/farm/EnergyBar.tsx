import React from 'react';
import { useGame } from '../../context/GameContext';
import { Zap, Clock } from 'lucide-react';

export const EnergyBar: React.FC = () => {
  const { stats } = useGame();
  const percentage = Math.min(100, Math.max(0, (stats.energy / stats.maxEnergy) * 100));

  return (
    <div className="w-full glass-panel rounded-2xl p-3 border border-yellow-500/20 shadow-lg">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
          <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
          <span>ENERGY</span>
        </div>
        <div className="font-extrabold text-white">
          <span>{stats.energy}</span>
          <span className="text-gray-400 text-[10px]"> / {stats.maxEnergy}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-1.5 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-yellow-500/70" />
          +1 Energy every {stats.energyRegenSeconds}s
        </span>
        <span className="text-yellow-400/80 font-semibold">{percentage.toFixed(0)}% FULL</span>
      </div>
    </div>
  );
};
