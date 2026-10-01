import React from 'react';
import { useGame } from '../../context/GameContext';
import { GarlicCharacter } from './GarlicCharacter';
import { EnemyTargets } from './EnemyTargets';
import { EnergyBar } from './EnergyBar';
import { ComboMeter } from './ComboMeter';
import { EvolutionCelebrationModal } from './EvolutionCelebrationModal';
import { getNextStage, checkEvolutionRequirements, TAP_STYLES_CATALOG } from '../../config/gameBalance';
import { RhythmBar } from './RhythmBar';
import { Sparkles, ArrowRight, Trophy, ChevronRight, Zap, Palette, Swords } from 'lucide-react';

export const TapGame: React.FC = () => {
  const {
    stats,
    inventory,
    quests,
    comboCount,
    setActiveTab,
    currentStage,
    attemptEvolution,
    isEvolutionModalOpen,
    setIsEvolutionModalOpen,
    justEvolvedStage,
    showToast,
  } = useGame();

  // Rhythm quest detection
  const rhythmQuest = quests.find((q) => q.mechanicType === 'RHYTHM' && !q.isCompleted && !q.isClaimed);
  const rhythmActive = Boolean(rhythmQuest) && comboCount >= 3;

  const completedQuestsCount = quests.filter((q) => q.isCompleted).length;
  const nextStage = getNextStage(currentStage.id);

  const evalResult = checkEvolutionRequirements(
    currentStage.id,
    {
      xp: stats.xp,
      totalTaps: stats.totalTaps,
      completedQuestsCount,
    },
    inventory.garlicTeeth
  );

  // Progress towards next stage
  let evolutionProgress = 100;
  if (nextStage) {
    const xpRatio = Math.min(1, stats.xp / (nextStage.requiredXp || 1));
    const tapsRatio = Math.min(1, stats.totalTaps / (nextStage.requiredTaps || 1));
    const teethRatio = Math.min(1, inventory.garlicTeeth / (nextStage.requiredGarlicTeeth || 1));
    evolutionProgress = Math.floor(((xpRatio + tapsRatio + teethRatio) / 3) * 100);
  }

  // Active tap style info
  const activeTapStyle = TAP_STYLES_CATALOG.find((s) => s.id === (inventory.equippedTapStyle || 'NORMAL')) || TAP_STYLES_CATALOG[0];

  return (
    <div className="relative flex flex-col items-center justify-between h-[calc(100vh-130px)] p-3 max-w-md mx-auto overflow-hidden">
      {/* Evolution Celebration Modal */}
      {isEvolutionModalOpen && justEvolvedStage && (
        <EvolutionCelebrationModal
          stage={justEvolvedStage}
          onClose={() => setIsEvolutionModalOpen(false)}
        />
      )}

      {/* Top: Stage Badge + Combo + Buttons */}
      <div className="w-full space-y-2">
        <ComboMeter comboCount={comboCount} />

        <div className="flex items-center justify-between px-1">
          {/* Stage Badge */}
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-md">
            <span>{currentStage.badgeIcon}</span>
            <span className="uppercase text-amber-300">{currentStage.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tap Style Quick Button */}
            <button
              onClick={() => setActiveTab('skins')}
              className="flex items-center gap-1 rounded-full text-xs font-bold px-2.5 py-1.5 border transition-colors"
              style={{
                backgroundColor: `${activeTapStyle.color}22`,
                borderColor: `${activeTapStyle.color}55`,
                color: activeTapStyle.color,
              }}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{activeTapStyle.particleEmoji}</span>
            </button>

            {/* Skins Button */}
            <button
              onClick={() => setActiveTab('skins')}
              className="flex items-center gap-1.5 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 px-3 py-1.5 rounded-full text-xs font-bold text-purple-200 transition-colors"
            >
              <Palette className="w-3.5 h-3.5 text-purple-300" />
              <span>SKINS</span>
            </button>
          </div>
        </div>

        {/* Evolution Progress Card */}
        <div className="glass-panel rounded-2xl p-3 border border-sprout-500/30 space-y-2 shadow-xl text-left">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-sprout-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              {nextStage ? `PROGRESO A: ${nextStage.name}` : '¡ETAPA MÁXIMA!'}
            </span>
            <span className="text-amber-300 font-extrabold">{evolutionProgress}%</span>
          </div>

          <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden p-0.5 border border-sprout-500/20">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-sprout-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.7)]"
              style={{ width: `${evolutionProgress}%` }}
            />
          </div>

          {nextStage && (
            <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-300 font-medium pt-1 border-t border-white/10">
              <div className="text-center">
                <span className="block text-gray-400">XP</span>
                <span className={stats.xp >= nextStage.requiredXp ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                  {stats.xp} / {nextStage.requiredXp}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-gray-400">TAPs</span>
                <span className={stats.totalTaps >= nextStage.requiredTaps ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                  {stats.totalTaps} / {nextStage.requiredTaps}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-gray-400">Dientes 🦷</span>
                <span className={inventory.garlicTeeth >= nextStage.requiredGarlicTeeth ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                  {inventory.garlicTeeth} / {nextStage.requiredGarlicTeeth}
                </span>
              </div>
            </div>
          )}

          {evalResult.canEvolve && (
            <button
              onClick={attemptEvolution}
              className="w-full py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wide"
            >
              <Sparkles className="w-4 h-4" />
              <span>¡EVOLUCIONAR AHORA!</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tap Hints bar: hold to charge */}
        <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 font-medium">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Toca para tapear</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Mantén para cargar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeTapStyle.color }} />
            <span>Crit {Math.round(activeTapStyle.criticalChance * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Main Character Stage & Interactive Enemy Targets */}
      <div className="relative w-full flex-1 flex items-center justify-center" style={{ minHeight: '220px', maxHeight: '320px' }}>
        <EnemyTargets />
        <GarlicCharacter comboCount={comboCount} />
      </div>

      {/* Rhythm Bar */}
      {rhythmActive && (
        <div className="w-full px-2">
          <RhythmBar
            isActive={rhythmActive}
            onPerfectHit={() => showToast('⚡ PERFECT HIT!', '+2x XP bonus de ritmo activado', 'success')}
            onMissedHit={() => {}}
          />
        </div>
      )}

      {/* Bottom Controls */}
      <div className="w-full space-y-1.5 pb-1">
        <EnergyBar />

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className="glass-card-gold p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-200 hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📦</span>
              <div className="text-left">
                <span className="block text-[10px] text-amber-400/80 uppercase">Inventario</span>
                <span>{inventory.rawGarlic} Ajos</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => setActiveTab('skins')}
            className="glass-card p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold hover:scale-[1.02] transition-transform border"
            style={{
              borderColor: `${activeTapStyle.color}40`,
              color: activeTapStyle.color,
            }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg border" style={{ backgroundColor: `${activeTapStyle.color}22`, borderColor: `${activeTapStyle.color}44` }}>
                <Swords className="w-3.5 h-3.5" style={{ color: activeTapStyle.color }} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] opacity-70 uppercase">Ataque</span>
                <span className="text-[10px] truncate max-w-[60px] block">{activeTapStyle.name.split(' ').slice(0, 2).join(' ')}</span>
              </div>
            </div>
            <span className="text-lg">{activeTapStyle.particleEmoji}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
