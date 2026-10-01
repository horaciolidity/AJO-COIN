import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useGame } from '../../context/GameContext';
import { triggerHaptic } from '../../utils/haptics';
import { playCoinSound, playTapSound } from '../../utils/audio';

export interface EnemyTarget {
  id: string;
  name: string;
  type: 'BUG' | 'WORM' | 'MOLD' | 'BOSS';
  emoji: string;
  maxHp: number;
  currentHp: number;
  rewardGc: number;
  rewardTeeth: number;
  xPct: number;
  yPct: number;
}

export interface EnemyTargetsHandle {
  wipeAllEnemies: () => void;
}

const ENEMY_TYPES: { type: 'BUG' | 'WORM' | 'MOLD' | 'BOSS'; name: string; emoji: string; baseHp: number; rewardGc: number; rewardTeeth: number }[] = [
  { type: 'BUG', name: 'Mosca Vampiro', emoji: '🦟', baseHp: 30, rewardGc: 25, rewardTeeth: 2 },
  { type: 'WORM', name: 'Oruga Plaga', emoji: '🐛', baseHp: 20, rewardGc: 15, rewardTeeth: 1 },
  { type: 'MOLD', name: 'Hongo Podrido', emoji: '🍄', baseHp: 50, rewardGc: 40, rewardTeeth: 3 },
  { type: 'BOSS', name: 'SUPER JEFE PLAGA', emoji: '👾', baseHp: 150, rewardGc: 150, rewardTeeth: 10 },
];

export const EnemyTargets = forwardRef<EnemyTargetsHandle, {}>((_, ref) => {
  const { stats, showToast, sellGarlic, handleTap } = useGame();
  const [enemies, setEnemies] = useState<EnemyTarget[]>([]);
  const [defeatedCount, setDefeatedCount] = useState<number>(0);

  // Spawn random enemy
  const spawnEnemy = useCallback(() => {
    setEnemies((prev) => {
      if (prev.length >= 4) return prev; // max 4 enemies on screen at once

      const isBoss = Math.random() < 0.12 && !prev.some((e) => e.type === 'BOSS');
      const template = isBoss
        ? ENEMY_TYPES.find((t) => t.type === 'BOSS')!
        : ENEMY_TYPES[Math.floor(Math.random() * 3)];

      const hpMult = 1 + (stats.level - 1) * 0.2;
      const enemyHp = Math.floor(template.baseHp * hpMult);

      // Random position avoiding direct center (where garlic hero is)
      const side = Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
      const xPct = side === 'LEFT' ? 12 + Math.random() * 26 : 62 + Math.random() * 26;
      const yPct = 25 + Math.random() * 50;

      const newEnemy: EnemyTarget = {
        id: 'enemy_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        name: template.name,
        type: template.type,
        emoji: template.emoji,
        maxHp: enemyHp,
        currentHp: enemyHp,
        rewardGc: template.rewardGc,
        rewardTeeth: template.rewardTeeth,
        xPct,
        yPct,
      };

      if (isBoss) {
        showToast('👾 ¡JEFE PLAGA APARECIÓ!', 'Derrota al jefe para ganar recompensas gigantes.', 'warning');
      }

      return [...prev, newEnemy];
    });
  }, [stats.level, showToast]);

  // Initial & interval spawning & charged attack listener
  useEffect(() => {
    spawnEnemy();
    spawnEnemy();

    const spawnInterval = setInterval(() => {
      spawnEnemy();
    }, 4500);

    const handleWipeoutEvent = () => {
      setEnemies((prev) => {
        if (prev.length === 0) return prev;

        let totalGc = 0;
        let totalTeeth = 0;
        prev.forEach((e) => {
          totalGc += e.rewardGc * 1.5;
          totalTeeth += e.rewardTeeth;
        });

        triggerHaptic('success');
        playCoinSound();
        showToast(
          '🔥 ¡DESTRUCCIÓN SAYAYIN TOTAL! 🔥',
          `¡Enemigos eliminados! +${Math.round(totalGc)} GC  +${totalTeeth} 🦷`,
          'success'
        );

        return []; // clear all screen enemies
      });
    };

    window.addEventListener('CHARGE_WIPEOUT_RELEASE', handleWipeoutEvent);

    return () => {
      clearInterval(spawnInterval);
      window.removeEventListener('CHARGE_WIPEOUT_RELEASE', handleWipeoutEvent);
    };
  }, [spawnEnemy, showToast]);

  // Handle direct tap on an enemy
  const handleEnemyTap = (e: React.MouseEvent | React.TouchEvent, enemyId: string) => {
    e.stopPropagation(); // don't trigger background tap twice
    triggerHaptic('light');
    playTapSound();

    const damage = Math.max(15, stats.powerPerTap * 3);

    setEnemies((prev) =>
      prev
        .map((enemy) => {
          if (enemy.id === enemyId) {
            const nextHp = enemy.currentHp - damage;
            if (nextHp <= 0) {
              // Enemy defeated!
              triggerHaptic('success');
              playCoinSound();
              setDefeatedCount((c) => c + 1);
              showToast(
                `¡${enemy.name} Destruido! 💥`,
                `+${enemy.rewardGc} GC  +${enemy.rewardTeeth} 🦷`,
                'success'
              );
              return null; // remove
            }
            return { ...enemy, currentHp: nextHp };
          }
          return enemy;
        })
        .filter(Boolean) as EnemyTarget[]
    );
  };

  // Expose wipeAllEnemies method for charged hold attack release
  useImperativeHandle(ref, () => ({
    wipeAllEnemies: () => {
      setEnemies((prev) => {
        if (prev.length === 0) return prev;

        let totalGc = 0;
        let totalTeeth = 0;
        prev.forEach((e) => {
          totalGc += e.rewardGc * 1.5;
          totalTeeth += e.rewardTeeth;
        });

        triggerHaptic('success');
        playCoinSound();
        showToast(
          '🔥 ¡DESTRUCCIÓN SAYAYIN TOTAL! 🔥',
          `¡Enemigos eliminados! +${Math.round(totalGc)} GC  +${totalTeeth} 🦷`,
          'success'
        );

        return []; // clear all screen enemies
      });
    },
  }));

  const activeBoss = enemies.find((e) => e.type === 'BOSS');

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Boss Health Bar Header if Boss exists */}
      {activeBoss && (
        <div className="absolute top-2 inset-x-4 pointer-events-auto z-40 bg-black/85 border-2 border-red-500/80 rounded-2xl p-2 shadow-2xl animate-pulse">
          <div className="flex items-center justify-between text-xs font-black text-red-400 mb-1">
            <span className="flex items-center gap-1">
              <span className="text-base">👾</span> {activeBoss.name}
            </span>
            <span>
              {activeBoss.currentHp} / {activeBoss.maxHp} HP
            </span>
          </div>
          <div className="w-full h-3 bg-red-950 rounded-full overflow-hidden border border-red-500/40 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 rounded-full transition-all duration-200"
              style={{ width: `${Math.max(0, (activeBoss.currentHp / activeBoss.maxHp) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Render Active Enemies floating on stage */}
      {enemies.map((enemy) => {
        const hpPct = Math.max(0, Math.floor((enemy.currentHp / enemy.maxHp) * 100));

        return (
          <div
            key={enemy.id}
            onClick={(e) => handleEnemyTap(e, enemy.id)}
            onTouchStart={(e) => handleEnemyTap(e, enemy.id)}
            className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2 animate-enemy-pop hover:scale-110 active:scale-90 transition-transform"
            style={{
              left: `${enemy.xPct}%`,
              top: `${enemy.yPct}%`,
            }}
          >
            {/* Health Bar above enemy */}
            <div className="w-12 h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/30 mb-1 mx-auto">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-emerald-400 transition-all duration-150"
                style={{ width: `${hpPct}%` }}
              />
            </div>

            {/* Enemy Avatar Container */}
            <div
              className={`relative p-2 rounded-2xl border flex items-center justify-center shadow-lg ${
                enemy.type === 'BOSS'
                  ? 'bg-red-950/80 border-red-400 w-16 h-16 text-3xl shadow-red-500/50 animate-bounce'
                  : 'bg-black/70 border-amber-500/50 w-11 h-11 text-2xl hover:border-amber-300'
              }`}
            >
              <span>{enemy.emoji}</span>

              {/* Target indicator ring */}
              <div className="absolute -inset-1 rounded-2xl border border-dashed border-red-400/60 animate-spin" />
            </div>

            {/* Enemy Label */}
            <span className="block text-[9px] font-extrabold text-white text-center mt-0.5 drop-shadow-md bg-black/60 px-1.5 rounded-full border border-white/10">
              {enemy.name}
            </span>
          </div>
        );
      })}
    </div>
  );
});
