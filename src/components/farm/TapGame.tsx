import React from 'react';
import { useGame } from '../../context/GameContext';
import { GarlicCharacter } from './GarlicCharacter';
import { EnergyBar } from './EnergyBar';
import { ComboMeter } from './ComboMeter';
import { Sparkles, ArrowRight, Zap, ShoppingBag } from 'lucide-react';

export const TapGame: React.FC = () => {
  const { stats, handleTap, comboCount, setActiveTab, inventory } = useGame();

  const tapsNeeded = stats.tapsPerGarlic;
  const progressPercentage = Math.min(100, (stats.currentGarlicTaps / tapsNeeded) * 100);
  const remainingTaps = Math.max(0, tapsNeeded - stats.currentGarlicTaps);

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[calc(100vh-140px)] p-4 max-w-md mx-auto">
      {/* Top Banner: Tap Instruction & Progress */}
      <div className="w-full text-center space-y-2 relative">
        <ComboMeter comboCount={comboCount} />

        <h2 className="text-2xl font-black tracking-tight text-white uppercase text-glow-green flex items-center justify-center gap-2">
          <span>🧄</span>
          <span>TAP THE GARLIC</span>
          <span>🧄</span>
        </h2>

        {/* Harvest Progress Bar */}
        <div className="glass-panel rounded-2xl p-3 border border-sprout-500/30 space-y-1.5 shadow-xl">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-sprout-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sprout-400" />
              GARLIC PROGRESS
            </span>
            <span className="text-white">
              {stats.currentGarlicTaps} / {tapsNeeded} TAPS
            </span>
          </div>

          {/* Bar */}
          <div className="w-full h-3.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-sprout-500/20">
            <div
              className="h-full bg-gradient-to-r from-sprout-500 to-emerald-400 rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-400 pt-0.5 font-medium">
            <span>Harvest 1 Garlic every {tapsNeeded} Taps</span>
            <span className="text-sprout-300 font-bold">{remainingTaps} taps left</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Garlic Character */}
      <GarlicCharacter onTap={handleTap} comboCount={comboCount} />

      {/* Bottom Controls: Energy & Quick Actions */}
      <div className="w-full space-y-3">
        <EnergyBar />

        {/* Quick shortcut to Garlic Lab Upgrades & Inventory */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className="glass-card-gold p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-200 hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📦</span>
              <div className="text-left">
                <span className="block text-[10px] text-amber-400/80 uppercase">Garlic Inventory</span>
                <span>{inventory.rawGarlic} Garlic</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="glass-card p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold text-purple-200 hover:scale-[1.02] transition-transform border border-purple-500/30"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🧪</span>
              <div className="text-left">
                <span className="block text-[10px] text-purple-300/80 uppercase">Garlic Lab</span>
                <span>Upgrades</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
