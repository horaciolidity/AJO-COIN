import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import {
  CombatAttackType,
  CombatEnemy,
  CombatHitEffect,
  CombatRoundStats,
  ComboDefinition,
  EnemyAttackState,
} from '../../types';
import {
  CombatEngine,
  PLAYER_MAX_HP,
  COMBAT_SKIN_BONUSES,
  TAP_STYLE_COMBO_MULT,
} from '../../services/CombatEngine';
import { AnimatedFighterSprite } from './AnimatedFighterSprite';
import { SkinBackground } from './SkinBackground';
import { triggerHaptic } from '../../utils/haptics';
import { playTapSound, playHarvestSound, playCoinSound } from '../../utils/audio';
import { preloadFighterAssets } from '../../utils/assetPreloader';
import { Zap, Flame, Shield, Heart, Swords, Star, Trophy, ChevronRight } from 'lucide-react';

interface CombatArenaProps {
  onHarvestGarlic?: (amount: number) => void;
}

const COMBO_RESET_MS = 1500;
const POSE_LOCK_MS = 160;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function hpColor(pct: number): string {
  if (pct > 60) return 'from-emerald-500 via-green-400 to-lime-400';
  if (pct > 30) return 'from-amber-500 via-yellow-400 to-orange-400';
  return 'from-red-600 via-rose-500 to-red-400';
}

function enemyHpColor(pct: number): string {
  if (pct > 60) return 'from-red-600 via-rose-500 to-amber-400';
  if (pct > 30) return 'from-orange-500 via-amber-400 to-yellow-400';
  return 'from-gray-400 via-gray-300 to-gray-200';
}

// ─────────────────────────────────────────────────────────────────────────────
export const CombatArena: React.FC<CombatArenaProps> = ({ onHarvestGarlic }) => {
  const {
    currentStage,
    stats,
    inventory,
    handleTap,
    showToast,
    combatWinStreak,
    recordCombatVictory,
    resetCombatStreak,
  } = useGame();

  // Resolve active skin/tapStyle combat bonuses
  const skinBonus = COMBAT_SKIN_BONUSES[inventory.equippedSkin] ?? COMBAT_SKIN_BONUSES['DEFAULT'];
  const tapStyleComboMult = TAP_STYLE_COMBO_MULT[inventory.equippedTapStyle ?? 'NORMAL'] ?? 1.0;
  const effectiveCritChance = 0.18 + (skinBonus.critBonus ?? 0);
  const effectiveDodgeCD = Math.round(2500 * (1 - skinBonus.dodgeCDReduction));

  // Preload assets on mount
  useEffect(() => {
    preloadFighterAssets();
  }, []);

  // ── Enemy ────────────────────────────────────────────────────────────────
  const [enemy, setEnemy] = useState<CombatEnemy>(() =>
    CombatEngine.spawnEnemyForRank(currentStage.order)
  );

  // ── Player HP ────────────────────────────────────────────────────────────
  const [playerHp, setPlayerHp] = useState<number>(PLAYER_MAX_HP);
  const [isPlayerDead, setIsPlayerDead] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);

  // ── Special meter ────────────────────────────────────────────────────────
  const [specialMeter, setSpecialMeter] = useState<number>(0);

  // ── Combo state ──────────────────────────────────────────────────────────
  const attackHistoryRef = useRef<CombatAttackType[]>([]);
  const [activeComboNotice, setActiveComboNotice] = useState<ComboDefinition | null>(null);
  const comboChainRef = useRef(0);
  const [comboChainDisplay, setComboChainDisplay] = useState(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Dodge state ──────────────────────────────────────────────────────────
  const [isDodging, setIsDodging] = useState(false);
  const [dodgeCooldown, setDodgeCooldown] = useState(false);
  const DODGE_DURATION_MS = 600;

  // ── Boss wave state ───────────────────────────────────────────────────────
  const [isBossWave, setIsBossWave] = useState(false);
  const [bossWaveNumber, setBossWaveNumber] = useState(0);
  const [showBossCinematic, setShowBossCinematic] = useState(false);

  // ── Victory Persistent State & Next Fight Delay ───────────────────────────
  const [isVictoryState, setIsVictoryState] = useState(false);
  const [canProceedNextBattle, setCanProceedNextBattle] = useState(false);
  const [victoryCountdown, setVictoryCountdown] = useState(3);
  const [defeatedEnemySnapshot, setDefeatedEnemySnapshot] = useState<CombatEnemy | null>(null);

  // ── Special VFX overlay ───────────────────────────────────────────────────
  const [showSpecialVFX, setShowSpecialVFX] = useState(false);

  // ── Combat Help Modal ─────────────────────────────────────────────────────
  const [showCombatHelp, setShowCombatHelp] = useState(false);

  // ── Enemy attack state machine ───────────────────────────────────────────
  const [enemyAttackState, setEnemyAttackState] = useState<EnemyAttackState>('IDLE');
  const enemyAttackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enemyWindupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enemyCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Hit effects ──────────────────────────────────────────────────────────
  const [hitEffects, setHitEffects] = useState<CombatHitEffect[]>([]);

  // ── Player animation poses ───────────────────────────────────────────────
  const [playerAction, setPlayerAction] = useState<'IDLE' | 'PUNCH' | 'KICK' | 'SPECIAL' | 'VICTORY' | 'HIT'>('IDLE');
  const playerPoseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAttackTimeRef = useRef<number>(0);

  // ── Screen shake / flash ─────────────────────────────────────────────────
  const [screenShake, setScreenShake] = useState(false);
  const [comboFlash, setComboFlash] = useState<string | null>(null);

  // ── Round stats ──────────────────────────────────────────────────────────
  const [roundStats, setRoundStats] = useState<CombatRoundStats>({
    combosExecuted: 0,
    perfectDodges: 0,
    damageDealt: 0,
    damageTaken: 0,
    maxComboChain: 0,
    specialsUsed: 0,
  });
  const playerTookDamageThisRound = useRef(false);

  // ── Stable Refs for Enemy AI Timer Loop ──────────────────────────────────
  const isDodgingRef = useRef(isDodging);
  isDodgingRef.current = isDodging;

  const isPlayerDeadRef = useRef(isPlayerDead);
  isPlayerDeadRef.current = isPlayerDead;

  const isVictoryStateRef = useRef(isVictoryState);
  isVictoryStateRef.current = isVictoryState;

  const currentEnemyRef = useRef(enemy);
  currentEnemyRef.current = enemy;

  // ── Circle gesture detection ─────────────────────────────────────────────
  const gesturePointsRef = useRef<{ x: number; y: number }[]>([]);
  const isGesturingRef = useRef(false);

  // ── Arena ref for bounding rect ──────────────────────────────────────────
  const arenaRef = useRef<HTMLDivElement>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const triggerScreenShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  }, []);

  const triggerComboFlash = useCallback((color: string) => {
    setComboFlash(color);
    setTimeout(() => setComboFlash(null), 350);
  }, []);

  const resetComboTimer = useCallback(() => {
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      attackHistoryRef.current = [];
      comboChainRef.current = 0;
      setComboChainDisplay(0);
      setActiveComboNotice(null);
    }, COMBO_RESET_MS);
  }, []);

  const clearAllEnemyTimers = useCallback(() => {
    if (enemyAttackTimerRef.current) clearTimeout(enemyAttackTimerRef.current);
    if (enemyWindupTimerRef.current) clearTimeout(enemyWindupTimerRef.current);
    if (enemyCooldownTimerRef.current) clearTimeout(enemyCooldownTimerRef.current);
  }, []);

  // ─── Enemy Attack AI Loop ─────────────────────────────────────────────────
  const scheduleEnemyAttack = useCallback(() => {
    clearAllEnemyTimers();

    const targetEnemy = currentEnemyRef.current;
    if (
      isPlayerDeadRef.current ||
      isVictoryStateRef.current ||
      targetEnemy.spriteUrl === 'BAG' ||
      targetEnemy.currentHp <= 0
    ) {
      return;
    }

    enemyAttackTimerRef.current = setTimeout(() => {
      if (isPlayerDeadRef.current || isVictoryStateRef.current || currentEnemyRef.current.currentHp <= 0) return;

      // Windup Phase (Telegraph warning)
      setEnemyAttackState('WINDUP');
      triggerHaptic('light');

      enemyWindupTimerRef.current = setTimeout(() => {
        if (isPlayerDeadRef.current || isVictoryStateRef.current || currentEnemyRef.current.currentHp <= 0) return;

        // Strike Phase
        setEnemyAttackState('STRIKING');

        setPlayerHp((prevHp) => {
          if (prevHp <= 0) return prevHp;

          const isPerfect = isDodgingRef.current;
          const damage = CombatEngine.calculateEnemyDamage(currentEnemyRef.current, isPerfect, isPerfect);

          if (isPerfect) {
            triggerHaptic('medium');
            showToast('🛡️ ¡ESQUIVA PERFECTA!', '¡0 daño recibido!', 'success');
            setRoundStats((r) => ({
              ...r,
              perfectDodges: r.perfectDodges + 1,
            }));
            return prevHp;
          }

          if (damage > 0) {
            setIsPlayerHit(true);
            triggerHaptic('heavy');
            triggerScreenShake();
            setTimeout(() => setIsPlayerHit(false), 250);
            playerTookDamageThisRound.current = true;

            const effect: CombatHitEffect = {
              id: `enemy_hit_${Date.now()}`,
              x: 60 + Math.random() * 30,
              y: 50 + Math.random() * 30,
              damage,
              attackType: 'PUNCH',
              isPlayerDamage: true,
            };
            setHitEffects((prev) => (prev.length >= 3 ? [...prev.slice(1), effect] : [...prev, effect]));
            setRoundStats((r) => ({ ...r, damageTaken: r.damageTaken + damage }));
          }

          const nextHp = Math.max(0, prevHp - damage);
          if (nextHp <= 0) {
            setIsPlayerDead(true);
            setPlayerAction('HIT');
            triggerHaptic('heavy');
            showToast('💀 ¡DERROTA!', 'Tu HP llegó a 0. Reviviendo en 3 segundos…', 'error');
            resetCombatStreak();
            playerTookDamageThisRound.current = true;

            setTimeout(() => {
              setIsPlayerDead(false);
              setPlayerHp(PLAYER_MAX_HP);
              setPlayerAction('IDLE');
              playerTookDamageThisRound.current = false;
              attackHistoryRef.current = [];
              comboChainRef.current = 0;
              setComboChainDisplay(0);
              setRoundStats({
                combosExecuted: 0,
                perfectDodges: 0,
                damageDealt: 0,
                damageTaken: 0,
                maxComboChain: 0,
                specialsUsed: 0,
              });
              setEnemy(CombatEngine.spawnEnemyForRank(currentStage.order));
            }, 3000);
          }
          return nextHp;
        });

        enemyCooldownTimerRef.current = setTimeout(() => {
          setEnemyAttackState('COOLDOWN');
          setTimeout(() => {
            setEnemyAttackState('IDLE');
            scheduleEnemyAttack();
          }, 400);
        }, 350);
      }, currentEnemyRef.current.dodgeWindowMs);
    }, currentEnemyRef.current.attackInterval);
  }, [clearAllEnemyTimers, currentStage.order, resetCombatStreak, showToast, triggerScreenShake]);

  useEffect(() => {
    if (isPlayerDead || isVictoryState || enemy.currentHp <= 0) return;
    scheduleEnemyAttack();

    return () => {
      clearAllEnemyTimers();
    };
  }, [enemy.id, isPlayerDead, isVictoryState, scheduleEnemyAttack, clearAllEnemyTimers]);

  useEffect(() => {
    return () => {
      clearAllEnemyTimers();
      if (playerPoseTimerRef.current) clearTimeout(playerPoseTimerRef.current);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    };
  }, [clearAllEnemyTimers]);

  // ─── Main Player Attack Handler ──────────────────────────────────────────
  const handleAttack = useCallback(
    (type: CombatAttackType, e?: React.MouseEvent | React.TouchEvent) => {
      if (e) {
        if (e.cancelable) e.preventDefault();
      }

      const now = performance.now();
      if (now - lastAttackTimeRef.current < 80) return;
      lastAttackTimeRef.current = now;

      if (enemy.currentHp <= 0 || isPlayerDead || isVictoryState) return;

      triggerHaptic(type === 'SPECIAL' ? 'heavy' : 'medium');
      if (type !== 'SPECIAL') playTapSound();

      handleTap(undefined, undefined, 0, true);

      attackHistoryRef.current = [...attackHistoryRef.current, type];
      resetComboTimer();

      const detectedCombo = CombatEngine.detectCombo(attackHistoryRef.current);

      if (detectedCombo) {
        comboChainRef.current += 1;
        const newChain = comboChainRef.current;
        setComboChainDisplay(newChain);
        setActiveComboNotice(detectedCombo);
        triggerHaptic('heavy');
        playCoinSound();
        triggerComboFlash('#f59e0b');
        triggerScreenShake();
        showToast(
          `${detectedCombo.vfxEmoji} ${detectedCombo.announceText}`,
          `x${detectedCombo.damageMultiplier} daño • ${newChain > 1 ? `Cadena x${newChain}!` : ''}`,
          'success'
        );
        setRoundStats((r) => ({
          ...r,
          combosExecuted: r.combosExecuted + 1,
          maxComboChain: Math.max(r.maxComboChain, newChain),
        }));
        attackHistoryRef.current = [];
      }

      const isCrit = Math.random() < effectiveCritChance;
      const damage = CombatEngine.calculateHitDamage(
        type,
        stats.powerPerTap || 1,
        detectedCombo,
        isCrit,
        skinBonus,
        tapStyleComboMult
      );

      if (type === 'SPECIAL') {
        setShowSpecialVFX(true);
        setTimeout(() => setShowSpecialVFX(false), 600);
      }

      if (playerPoseTimerRef.current) clearTimeout(playerPoseTimerRef.current);
      setPlayerAction(type);
      playerPoseTimerRef.current = setTimeout(() => {
        setPlayerAction('IDLE');
      }, POSE_LOCK_MS);

      const rect = arenaRef.current?.getBoundingClientRect();
      const hitX = rect ? rect.width * 0.5 + (Math.random() * 30 - 15) : 160;
      const hitY = rect ? rect.height * 0.35 + (Math.random() * 20 - 10) : 80;

      const newEffect: CombatHitEffect = {
        id: `hit_${Date.now()}_${Math.random()}`,
        x: hitX,
        y: hitY,
        damage,
        attackType: type,
        isCombo: Boolean(detectedCombo),
        comboName: detectedCombo?.announceText,
      };

      setHitEffects((prev) => (prev.length >= 3 ? [...prev.slice(1), newEffect] : [...prev, newEffect]));
      setTimeout(() => {
        setHitEffects((prev) => prev.filter((ef) => ef.id !== newEffect.id));
      }, 350);

      const specialGain = CombatEngine.getSkinSpecialMeterGain(
        type,
        skinBonus.specialMeterBonus,
        detectedCombo ? detectedCombo.specialMeterBonus : 0
      );
      setSpecialMeter((prev) => Math.min(100, prev + specialGain));

      setRoundStats((r) => ({ ...r, damageDealt: r.damageDealt + damage }));
      if (type === 'SPECIAL')
        setRoundStats((r) => ({ ...r, specialsUsed: r.specialsUsed + 1 }));

      setEnemy((prev) => {
        const nextHp = Math.max(0, prev.currentHp - damage);
        if (nextHp <= 0) handleEnemyDefeated(prev);
        return { ...prev, currentHp: nextHp };
      });
    },
    [
      enemy.currentHp,
      isPlayerDead,
      isVictoryState,
      handleTap,
      resetComboTimer,
      effectiveCritChance,
      stats.powerPerTap,
      skinBonus,
      tapStyleComboMult,
      triggerComboFlash,
      triggerScreenShake,
      showToast,
    ]
  );

  // ─── Enemy Defeated (Persistent Victory Screen) ──────────────────────────
  const handleEnemyDefeated = (defeatedEnemy: CombatEnemy) => {
    playHarvestSound();
    triggerHaptic('success');
    setPlayerAction('VICTORY');
    clearAllEnemyTimers();
    setEnemyAttackState('IDLE');
    triggerComboFlash('#10b981');
    setDefeatedEnemySnapshot(defeatedEnemy);

    const snap = { ...roundStats };
    const wasPerfect = !playerTookDamageThisRound.current;

    recordCombatVictory({
      rewardGarlic: defeatedEnemy.rewardGarlic,
      rewardGc: defeatedEnemy.rewardGc,
      rewardTeeth: defeatedEnemy.rewardTeeth,
      combosExecuted: snap.combosExecuted,
      perfectDodges: snap.perfectDodges,
      isBoss: enemy.type === 'BOSS' || Boolean(enemy.isBoss),
    } as any);

    const newStreak = combatWinStreak + 1;
    const streakBonus = newStreak >= 10 ? '🔥x2' : newStreak >= 5 ? '🔥x1.5' : newStreak >= 3 ? '🔥x1.25' : '';

    const isBossSpawn = newStreak % 5 === 0;
    if (isBossSpawn) {
      const waveNum = Math.floor(newStreak / 5);
      setBossWaveNumber(waveNum);
      setIsBossWave(true);
      setShowBossCinematic(true);
      setTimeout(() => setShowBossCinematic(false), 2500);
    } else {
      setIsBossWave(false);
    }

    showToast(
      `🏆 ¡ENEMIGO DERROTADO! ${streakBonus}`,
      `+${defeatedEnemy.rewardGarlic} Ajos 🧄  •  +${defeatedEnemy.rewardGc} GC${wasPerfect ? '  •  ✨ ¡RONDA PERFECTA!' : ''}`,
      'success'
    );

    if (onHarvestGarlic) {
      onHarvestGarlic(defeatedEnemy.rewardGarlic);
    }

    setIsVictoryState(true);
    setCanProceedNextBattle(false);
    setVictoryCountdown(3);

    let count = 3;
    const victoryTimer = setInterval(() => {
      count -= 1;
      setVictoryCountdown(count);
      if (count <= 0) {
        clearInterval(victoryTimer);
        setCanProceedNextBattle(true);
      }
    }, 1000);
  };

  const handleProceedToNextFight = () => {
    if (!canProceedNextBattle) return;
    triggerHaptic('heavy');
    setIsVictoryState(false);
    setCanProceedNextBattle(false);
    setPlayerAction('IDLE');

    playerTookDamageThisRound.current = false;
    attackHistoryRef.current = [];
    comboChainRef.current = 0;
    setComboChainDisplay(0);
    setRoundStats({
      combosExecuted: 0,
      perfectDodges: 0,
      damageDealt: 0,
      damageTaken: 0,
      maxComboChain: 0,
      specialsUsed: 0,
    });

    const nextEnemy = isBossWave
      ? CombatEngine.spawnBossWave(bossWaveNumber, currentStage.order)
      : CombatEngine.spawnEnemyForRank(currentStage.order);
    setEnemy(nextEnemy);
  };

  // ─── Special Attack ───────────────────────────────────────────────────────
  const handleSpecialAttack = () => {
    if (specialMeter < 100) {
      showToast('⚡ Especial Cargando', 'Llena la barra al 100% atacando.', 'info');
      return;
    }
    setSpecialMeter(0);
    handleAttack('SPECIAL');
  };

  // ─── Dodge ────────────────────────────────────────────────────────────────
  const handleDodge = () => {
    if (dodgeCooldown || isDodging || isPlayerDead || isVictoryState) return;
    setIsDodging(true);
    triggerHaptic('medium');
    setTimeout(() => setIsDodging(false), DODGE_DURATION_MS);
    setDodgeCooldown(true);
    setTimeout(() => setDodgeCooldown(false), effectiveDodgeCD);
  };

  // ─── Circular gesture for SPECIAL ────────────────────────────────────────
  const handleTouchStartGesture = (e: React.TouchEvent) => {
    isGesturingRef.current = true;
    gesturePointsRef.current = [{ x: e.touches[0].clientX, y: e.touches[0].clientY }];
  };

  const handleTouchMoveGesture = (e: React.TouchEvent) => {
    if (!isGesturingRef.current) return;
    gesturePointsRef.current.push({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEndGesture = () => {
    if (!isGesturingRef.current) return;
    isGesturingRef.current = false;
    if (CombatEngine.detectCircleGesture(gesturePointsRef.current) && specialMeter >= 100) {
      handleSpecialAttack();
    }
    gesturePointsRef.current = [];
  };

  // ─── Derived values ───────────────────────────────────────────────────────
  const hpPct = Math.max(0, Math.min(100, Math.round((enemy.currentHp / enemy.maxHp) * 100)));
  const playerHpPct = Math.max(0, Math.min(100, Math.round((playerHp / PLAYER_MAX_HP) * 100)));
  const isEnemyLow = hpPct <= 25;
  const isWindup = enemyAttackState === 'WINDUP';
  const isDualAttacking = playerAction !== 'IDLE' && enemyAttackState === 'STRIKING';

  return (
    <div
      className={`w-full flex flex-col items-center space-y-2 select-none no-touch-scroll transition-transform duration-75 ${
        screenShake ? 'animate-[shake_0.35s_ease-in-out]' : ''
      }`}
    >
      {/* ── Combo Flash Overlay ── */}
      {comboFlash && (
        <div
          className="absolute inset-0 pointer-events-none z-50 opacity-15 rounded-3xl transition-opacity duration-150"
          style={{ backgroundColor: comboFlash }}
        />
      )}

      {/* ── SPECIAL Attack VFX Full-Screen ── */}
      {showSpecialVFX && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 via-amber-500/40 to-purple-900/60 animate-pulse" />
          <div className="relative z-10 text-center animate-bounce">
            <div className="text-7xl drop-shadow-[0_0_30px_rgba(245,158,11,1)] animate-spin">✨</div>
            <div className="text-xl font-black text-amber-300 uppercase tracking-widest mt-2 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]">
              ¡ATAQUE ESPECIAL!
            </div>
          </div>
        </div>
      )}

      {/* ── BOSS WAVE Cinematic Banner ── */}
      {showBossCinematic && (
        <div className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 animate-pulse" />
          <div className="relative z-10 text-center px-6">
            <div className="text-6xl animate-bounce mb-2">💀</div>
            <div className="text-2xl font-black text-red-400 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse">
              ⚠️ BOSS WAVE {bossWaveNumber} ⚠️
            </div>
            <div className="text-sm font-bold text-red-300 mt-2 animate-bounce">
              ¡Un enemigo poderoso se acerca!
            </div>
            <div className="mt-3 flex justify-center gap-2">
              {['🔥', '💀', '⚡', '🔥', '💀'].map((e, i) => (
                <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Skin Combat Bonus Label ── */}
      {skinBonus.label && (
        <div className="w-full flex items-center justify-center gap-1 text-[9px] font-bold text-gray-400 bg-black/20 rounded-xl py-1 border border-white/5">
          <Star className="w-2.5 h-2.5 text-amber-400" />
          <span>{skinBonus.label}</span>
        </div>
      )}

      {/* ── TOP HUD: Fighter Cards & HP Bars ── */}
      <div className="w-full glass-panel rounded-2xl p-2.5 border border-purple-500/30 bg-black/60 shadow-xl">
        {/* Row 1: Fighter names + VS */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 flex items-center justify-center text-base border border-white/20">
              {currentStage.badgeIcon}
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-white uppercase truncate max-w-[80px]">
                {currentStage.name}
              </div>
              <div className="text-[9px] text-emerald-400 font-bold">LVL {currentStage.order}</div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-400 font-black text-[10px] uppercase tracking-wider animate-pulse">
              VS
            </div>
            {comboChainDisplay > 1 && (
              <div className="text-[9px] text-amber-300 font-black mt-0.5 animate-bounce">
                ⚡CADENA x{comboChainDisplay}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-right">
            <div>
              <div
                className={`text-[10px] font-extrabold truncate max-w-[90px] uppercase ${
                  isEnemyLow ? 'text-red-300 animate-pulse' : 'text-red-300'
                }`}
              >
                {enemy.name}
              </div>
              <div className="text-[9px] font-mono text-gray-300 font-bold">
                {enemy.currentHp} / {enemy.maxHp} HP
              </div>
            </div>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xl border shadow-lg transition-all duration-150 ${
                isWindup ? 'animate-bounce scale-110 border-red-400' : ''
              }`}
              style={{ backgroundColor: `${enemy.color}33`, borderColor: enemy.color }}
            >
              {enemy.emoji}
            </div>
          </div>
        </div>

        {/* Row 2: Player HP bar */}
        <div className="flex items-center gap-1.5 mb-1">
          <Heart className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <div className="flex-1 h-2.5 bg-black/60 rounded-full overflow-hidden border border-emerald-500/30">
            <div
              className={`h-full rounded-full transition-[width] duration-150 ease-out bg-gradient-to-r ${hpColor(
                playerHpPct
              )} ${isPlayerHit ? 'brightness-150' : ''}`}
              style={{ width: `${playerHpPct}%` }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-emerald-400 w-12 text-right">
            {playerHp}/{PLAYER_MAX_HP} HP
          </span>
        </div>

        {/* Row 3: Enemy HP bar */}
        <div className="flex items-center gap-1.5">
          <Swords className="w-3 h-3 text-red-400 flex-shrink-0" />
          <div className="flex-1 h-2.5 bg-black/60 rounded-full overflow-hidden border border-red-500/30">
            <div
              className={`h-full rounded-full transition-[width] duration-100 ease-out bg-gradient-to-r ${enemyHpColor(
                hpPct
              )}`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-red-400 w-12 text-right">
            {enemy.currentHp}HP
          </span>
        </div>
      </div>

      {/* ── Enemy Attack Warning (WINDUP) ── */}
      {isWindup && (
        <div className="w-full flex items-center justify-center gap-2 animate-pulse">
          <div className="px-4 py-1.5 rounded-full bg-red-600/80 border-2 border-red-400 text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.9)] flex items-center gap-1.5">
            <span className="text-lg animate-bounce">⚠️</span>
            <span>¡ENEMIGO ATACANDO! — ESQUIVA AHORA</span>
            <span className="text-lg animate-bounce">⚠️</span>
          </div>
        </div>
      )}

      {/* ── Special Meter ── */}
      <div className="w-full flex items-center gap-2 px-1">
        <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-amber-500/40">
          <div
            className={`h-full rounded-full transition-[width] duration-150 ease-out bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] ${
              specialMeter >= 100 ? 'animate-pulse' : ''
            }`}
            style={{ width: `${specialMeter}%` }}
          />
        </div>
        <span className="text-[9px] font-mono font-bold text-amber-400 w-8 text-right">
          {specialMeter}%
        </span>
      </div>

      {/* ── Combo Banner ── */}
      {activeComboNotice && (
        <div className="animate-bounce bg-gradient-to-r from-amber-500 to-orange-400 text-black px-4 py-1 rounded-full font-black text-xs shadow-lg uppercase tracking-wider flex items-center gap-1.5 border-2 border-yellow-300">
          <span className="text-base">{activeComboNotice.vfxEmoji}</span>
          <span>{activeComboNotice.announceText}</span>
          {comboChainDisplay > 1 && (
            <span className="bg-black/30 rounded-full px-1.5 text-white">x{comboChainDisplay}</span>
          )}
        </div>
      )}

      {/* ── 2D ARENA FIELD WITH FULL UNSEEN BACKGROUND STAGE ── */}
      <div
        ref={arenaRef}
        className="relative w-full h-64 rounded-3xl overflow-hidden border border-purple-500/30 flex flex-col justify-between shadow-2xl z-0"
        onTouchStart={handleTouchStartGesture}
        onTouchMove={handleTouchMoveGesture}
        onTouchEnd={handleTouchEndGesture}
      >
        {/* Full Unobstructed High-Res Background Stage Image */}
        <SkinBackground skinId={inventory.equippedSkin} />

        {/* INVISIBLE UPPER TOUCH/CLICK ZONE: PUNCH */}
        <div
          onClick={(e) => handleAttack('PUNCH', e)}
          onTouchStart={(e) => handleAttack('PUNCH', e)}
          style={{ touchAction: 'none' }}
          className="w-full h-1/2 bg-transparent cursor-pointer relative z-10 active:bg-white/5 transition-colors"
        />

        {/* Floating damage effects layer */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {hitEffects.map((effect) => (
            <div
              key={effect.id}
              className={`absolute text-sm font-black animate-floatUp drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${
                effect.isPlayerDamage
                  ? 'text-red-400'
                  : effect.isCombo
                  ? 'text-amber-300 text-base'
                  : 'text-yellow-400'
              }`}
              style={{ left: `${effect.x}px`, top: `${effect.y}px` }}
            >
              {effect.isPlayerDamage ? `-${effect.damage}` : `+${effect.damage}`}
              {effect.comboName ? ` ${effect.comboName}` : ''}
            </div>
          ))}
        </div>

        {/* Dual Attack Clash Flash Effect */}
        {isDualAttacking && (
          <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
            <div className="px-3 py-1 bg-amber-500 text-black font-black text-sm uppercase rounded-full animate-ping border-2 border-white shadow-[0_0_30px_rgba(245,158,11,1)]">
              💥 COLISIÓN DE ATAQUES! 💥
            </div>
          </div>
        )}

        {/* 2D ARCADE FIGHTERS DISPLAY */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-6 pb-2 z-20">
          {/* Player AJO Fighter (Left Side) */}
          <div className="relative flex items-center justify-center">
            <AnimatedFighterSprite
              pose={playerAction as any}
              facing="right"
              isHit={isPlayerHit}
              isLowHp={playerHp <= 100}
              size="md"
            />
          </div>

          {/* Impact Hit Spark Effect (Center) */}
          {(playerAction === 'PUNCH' || playerAction === 'KICK' || playerAction === 'SPECIAL') && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none animate-ping text-5xl drop-shadow-[0_0_20px_rgba(245,158,11,1)]">
              {playerAction === 'SPECIAL' ? '✨' : playerAction === 'KICK' ? '⚡' : '💥'}
            </div>
          )}

          {/* Enemy Fighter (Right Side) */}
          <div className="relative flex items-center justify-center">
            <AnimatedFighterSprite
              pose={
                enemy.currentHp <= 0
                  ? 'DEFEAT'
                  : enemyAttackState === 'STRIKING'
                  ? 'PUNCH'
                  : enemyAttackState === 'WINDUP'
                  ? 'WINDUP'
                  : 'IDLE'
              }
              facing="left"
              isEnemy={true}
              isHit={enemy.currentHp <= 0}
              isLowHp={hpPct <= 25}
              customSpriteUrl={enemy.spriteUrl}
              size="md"
            />
          </div>
        </div>

        {/* Persistent Victory Overlay */}
        {isVictoryState && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md rounded-3xl z-40 p-4 space-y-3 animate-fade-in">
            <div className="flex flex-col items-center text-center space-y-1">
              <Trophy className="w-14 h-14 text-amber-400 animate-bounce drop-shadow-[0_0_25px_rgba(245,158,11,0.9)]" />
              <div className="text-xl font-black text-amber-300 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                ¡VICTORIA ÉPICA! 🏆
              </div>
              <p className="text-xs text-emerald-400 font-bold uppercase">
                {defeatedEnemySnapshot?.name} DERROTADO
              </p>
              <div className="flex gap-3 text-[11px] text-gray-300 font-medium bg-black/50 px-3 py-1.5 rounded-xl border border-white/10 mt-1">
                <span>🧄 +{defeatedEnemySnapshot?.rewardGarlic} Ajos</span>
                <span>💎 +{defeatedEnemySnapshot?.rewardGc} GC</span>
              </div>
            </div>

            {canProceedNextBattle ? (
              <button
                onClick={handleProceedToNextFight}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-xs rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-bounce hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <span>¡SIGUIENTE PELEA! 🥊</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-4 py-2 bg-black/60 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-xl flex items-center gap-1.5 animate-pulse">
                <span>Preparando siguiente contrincante en {victoryCountdown}s…</span>
              </div>
            )}
          </div>
        )}

        {/* Player dead overlay */}
        {isPlayerDead && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/80 rounded-3xl z-20 pointer-events-none">
            <div className="text-center">
              <div className="text-3xl mb-1">💀</div>
              <div className="text-[11px] font-black text-red-300 uppercase tracking-widest">
                REVIVIENDO…
              </div>
            </div>
          </div>
        )}

        {/* INVISIBLE LOWER TOUCH/CLICK ZONE: KICK */}
        <div
          onClick={(e) => handleAttack('KICK', e)}
          onTouchStart={(e) => handleAttack('KICK', e)}
          style={{ touchAction: 'none' }}
          className="w-full h-1/2 bg-transparent cursor-pointer relative z-10 active:bg-white/5 transition-colors"
        />
      </div>

      {/* ── ACTION BUTTONS ROW ── */}
      <div className="w-full flex gap-2">
        {/* Dodge Button */}
        <button
          onClick={handleDodge}
          disabled={dodgeCooldown || isDodging || isPlayerDead || isVictoryState}
          className={`flex-1 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 transition-all duration-200 ${
            isDodging
              ? 'bg-blue-500/40 border-blue-400 text-blue-200 scale-95'
              : dodgeCooldown
              ? 'bg-gray-800/60 border-gray-600 text-gray-500 cursor-not-allowed opacity-60'
              : isWindup
              ? 'bg-blue-600 border-blue-300 text-white shadow-[0_0_20px_rgba(59,130,246,0.9)] animate-bounce'
              : 'bg-blue-600/30 border-blue-500/60 text-blue-300 hover:bg-blue-600/50 active:scale-95'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          {isDodging ? '¡ESQUIVANDO!' : dodgeCooldown ? 'CD…' : 'ESQUIVAR'}
        </button>

        {/* Special Attack Button */}
        <button
          onClick={handleSpecialAttack}
          disabled={specialMeter < 100 || isPlayerDead || isVictoryState}
          className={`flex-1 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 transition-all duration-200 ${
            specialMeter >= 100
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black border-white shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-bounce'
              : 'bg-gray-800/60 border-gray-600 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          {specialMeter >= 100 ? '¡ESPECIAL! 🔥' : `ESPECIAL ${specialMeter}%`}
        </button>
      </div>

      {/* ── Round Stats Strip ── */}
      <div className="w-full flex items-center justify-around text-[9px] font-bold text-gray-400 bg-black/30 rounded-xl py-1.5 border border-white/5">
        <span>💥 {roundStats.combosExecuted} combos</span>
        <span>🛡️ {roundStats.perfectDodges} esquivas</span>
        <span className={combatWinStreak >= 3 ? 'text-amber-400 font-extrabold animate-pulse' : ''}>
          🔥 Racha: {combatWinStreak}
        </span>
        <button
          onClick={() => setShowCombatHelp(true)}
          className="text-amber-400 hover:text-white bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 font-black"
        >
          ❓ Ayuda
        </button>
      </div>

      {/* ── COMBAT HELP MODAL ── */}
      {showCombatHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-gray-900/95 border-2 border-amber-500/40 rounded-3xl p-5 max-w-xs w-full text-white shadow-2xl space-y-4 text-xs relative">
            <button
              onClick={() => setShowCombatHelp(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-base font-bold bg-white/10 w-7 h-7 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-amber-400 flex items-center justify-center gap-1.5">
                🥊 GUÍA DE COMBATE — AJO FIGHTER
              </h3>
              <p className="text-[10px] text-gray-400">Domina los controles y derrota a los enemigos</p>
            </div>
            <div className="space-y-2.5 bg-black/40 p-3 rounded-2xl border border-white/5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-lg border border-amber-500/30">👊 PUÑO</span>
                <span className="text-gray-300 text-[10px]">Toca la mitad superior de la arena.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-lg border border-red-500/30">🦶 PATADA</span>
                <span className="text-gray-300 text-[10px]">Toca la mitad inferior de la arena.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-lg border border-blue-500/30">🛡️ ESQUIVAR</span>
                <span className="text-gray-300 text-[10px]">Toca cuando el enemigo parpadee en amarillo.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400/20 text-yellow-300 font-bold px-2 py-0.5 rounded-lg border border-yellow-400/30">✨ ESPECIAL</span>
                <span className="text-gray-300 text-[10px]">Se carga atacando. ¡Daño masivo!</span>
              </div>
            </div>
            <button
              onClick={() => setShowCombatHelp(false)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black uppercase text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              ¡ENTENDIDO, A PELEAR! 🥊
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
