import React from 'react';
import { useGame } from '../../context/GameContext';
import { FlaskConical, ArrowUpRight, Zap, Shield, Sparkles } from 'lucide-react';

export const GarlicLab: React.FC = () => {
  const { upgrades, buyUpgrade, inventory } = useGame();

  const getUpgradeIcon = (code: string) => {
    switch (code) {
      case 'STRONGER_FINGERS': return '👆';
      case 'BIGGER_HANDS': return '🤲';
      case 'FAST_REGEN': return '⚡';
      case 'GARLIC_MULTIPLIER': return '✨';
      case 'BIGGER_BOXES': return '📦';
      default: return '🧪';
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto min-h-[calc(100vh-140px)] pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <span>🧪</span> GARLIC LAB UPGRADES
        </h2>
        <p className="text-xs text-gray-400">Upgrade your finger power, energy capacity & garlic multipliers</p>
      </div>

      {/* Upgrades List */}
      <div className="space-y-3">
        {upgrades.map((up) => {
          const canAfford = inventory.gcBalance >= up.nextCost;
          const isMaxed = up.currentLevel >= up.maxLevel;

          return (
            <div
              key={up.id}
              className="glass-panel p-4 rounded-2xl border border-purple-500/30 flex items-center justify-between gap-3 shadow-lg hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0">
                  {getUpgradeIcon(up.code)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-white">{up.name}</h4>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-bold">
                      LVL {up.currentLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 mt-0.5">{up.description}</p>
                  <span className="text-[10px] text-sprout-400 font-semibold block mt-1">
                    Effect: {up.effectText}
                  </span>
                </div>
              </div>

              {/* Upgrade Action Button */}
              <button
                disabled={!canAfford || isMaxed}
                onClick={() => buyUpgrade(up.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold shrink-0 transition-all flex flex-col items-center justify-center gap-0.5 ${
                  isMaxed
                    ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                    : canAfford
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 active:scale-95'
                    : 'bg-white/5 text-gray-400 border border-white/10 cursor-not-allowed'
                }`}
              >
                {isMaxed ? (
                  <span>MAX LEVEL</span>
                ) : (
                  <>
                    <span className="flex items-center gap-1">
                      <span>UPGRADE</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] text-amber-300 font-extrabold">
                      🪙 {up.nextCost.toLocaleString()} GC
                    </span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
