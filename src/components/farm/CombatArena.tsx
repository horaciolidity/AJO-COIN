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
import { GarlicCharacter } from './GarlicCharacter';
import { AnimatedFighterSprite } from './AnimatedFighterSprite';
import { triggerHaptic } from '../../utils/haptics';
import { playTapSound, playHarvestSound, playCoinSound } from '../../utils/audio';
import { Zap, Flame, Shield, Heart, Swords, Star } from 'lucide-react';

interface CombatArenaProps {
  onHarvestGarlic?: (amount: number) => void;
}

const COMBO_RESET_MS = 1500;
const ROUND_WIN_PAUSE_MS = 700;

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
  const { currentStage, stats, inventory, handleTap, showToast, combatWinStreak, recordCombatVictory, resetCombatStreak } = useGame();

  // Resolve active skin/tapStyle combat bonuses
  const skinBonus = COMBAT_SKIN_BONUSES[inventory.equippedSkin] ?? COMBAT_SKIN_BONUSES['DEFAULT'];
  const tapStyleComboMult = TAP_STYLE_COMBO_MULT[inventory.equippedTapStyle ?? 'NORMAL'] ?? 1.0;
  // Effective crit chance = base 18% + skin bonus
  const effectiveCritChance = 0.18 + (skinBonus.critBonus ?? 0);
  // Effective dodge cooldown
  const effectiveDodgeCD = Math.round(2500 * (1 - skinBonus.dodgeCDReduction));

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
  const [attackHistory, setAttackHistory] = useState<CombatAttackType[]>([]);
  const [activeComboNotice, setActiveComboNotice] = useState<ComboDefinition | null>(null);
  const [comboChain, setComboChain] = useState(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Dodge state ──────────────────────────────────────────────────────────
  const [isDodging, setIsDodging] = useState(false);
  const [dodgeCooldown, setDodgeCooldown] = useState(false);
  const DODGE_DURATION_MS = 600;
  const getDodgeCD = () => effectiveDodgeCD;

  // ── Boss wave state ───────────────────────────────────────────────────────
  const [isBossWave, setIsBossWave] = useState(false);
  const [bossWaveNumber, setBossWaveNumber] = useState(0);
  const [showBossCinematic, setShowBossCinematic] = useState(false);

  // ── Special VFX overlay ───────────────────────────────────────────────────
  const [showSpecialVFX, setShowSpecialVFX] = useState(false);

  // ── Combat Help Modal ─────────────────────────────────────────────────────
  const [showCombatHelp, setShowCombatHelp] = useState(false);

  // ── Intermission / Training Punching Bag state ───────────────────────────
  const [isIntermission, setIsIntermission] = useState(false);
  const [intermissionCountdown, setIntermissionCountdown] = useState(0);

  // ── Enemy attack state machine ───────────────────────────────────────────
  const [enemyAttackState, setEnemyAttackState] = useState<EnemyAttackState>('IDLE');
  const enemyAttackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enemyWindupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Hit effects ──────────────────────────────────────────────────────────
  const [hitEffects, setHitEffects] = useState<CombatHitEffect[]>([]);

  // ── Player animation poses ───────────────────────────────────────────────
  const [playerAction, setPlayerAction] = useState<'IDLE' | 'PUNCH' | 'KICK' | 'SPECIAL' | 'VICTORY' | 'HIT'>('IDLE');
  const playerPoseTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  // Track if player took any damage this round (for perfect run bonus)
  const playerTookDamageThisRound = useRef(false);

  // ── Circle gesture detection ─────────────────────────────────────────────
  const gesturePointsRef = useRef<{ x: number; y: number }[]>([]);
  const isGesturingRef = useRef(false);

  // ── Arena ref for bounding rect ──────────────────────────────────────────
  const arenaRef = useRef<HTMLDivElement>(null);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 350);
  };

  const triggerComboFlash = (color: string) => {
    setComboFlash(color);
    setTimeout(() => setComboFlash(null), 400);
  };

  const resetComboTimer = useCallback(() => {
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setAttackHistory([]);
      setActiveComboNotice(null);
      setComboChain(0);
    }, COMBO_RESET_MS);
  }, []);

  // ─── Enemy Attack AI Loop ─────────────────────────────────────────────────
  const scheduleEnemyAttack = useCallback(
    (currentEnemy: CombatEnemy) => {
      if (enemyAttackTimerRef.current) clearTimeout(enemyAttackTimerRef.current);
      if (isPlayerDead || isIntermission || currentEnemy.spriteUrl === 'BAG') return;

      enemyAttackTimerRef.current = setTimeout(() => {
        // Start windup phase
        setEnemyAttackState('WINDUP');
        triggerHaptic('light');

        // After dodgeWindow, strike
        enemyWindupTimerRef.current = setTimeout(() => {
          setEnemyAttackState('STRIKING');

          // Only deal damage if player isn't already dead
          setPlayerHp((prev) => {
            if (prev <= 0) return prev;
            const isPerfect = isDodging;
            const damage = CombatEngine.calculateEnemyDamage(currentEnemy, false, isPerfect);

            if (isPerfect) {
              triggerHaptic('medium');
              showToast('🛡️ ¡ESQUIVA PERFECTA!', '¡0 daño recibido!', 'success');
              setRoundStats((r) => ({
                ...r,
                perfectDodges: r.perfectDodges + 1,
              }));
              return prev;
            }

            if (damage > 0) {
              setIsPlayerHit(true);
              triggerHaptic('heavy');
              triggerScreenShake();
              setTimeout(() => setIsPlayerHit(false), 300);
              playerTookDamageThisRound.current = true;

              // Floating damage on player side
              const effect: CombatHitEffect = {
                id: `enemy_hit_${Date.now()}`,
                x: 60 + Math.random() * 40,
                y: 50 + Math.random() * 40,
                damage,
                attackType: 'PUNCH',
                isPlayerDamage: true,
              };
              setHitEffects((p) => [...p.slice(-5), effect]);

              setRoundStats((r) => ({ ...r, damageTaken: r.damageTaken + damage }));
            }

            const nextHp = Math.max(0, prev - damage);
            if (nextHp <= 0) {
              setIsPlayerDead(true);
              setPlayerAction('HIT');
              triggerHaptic('heavy');
              showToast('💀 ¡DERROTA!', 'Tu HP llegó a 0. Reviviendo en 3 segundos…', 'error');
              // Reset streak on KO
              resetCombatStreak();
              playerTookDamageThisRound.current = true;
              setTimeout(() => {
                setIsPlayerDead(false);
                setPlayerHp(PLAYER_MAX_HP);
                setPlayerAction('IDLE');
                playerTookDamageThisRound.current = false;
                setRoundStats({ combosExecuted: 0, perfectDodges: 0, damageDealt: 0, damageTaken: 0, maxComboChain: 0, specialsUsed: 0 });
                setEnemy(CombatEngine.spawnEnemyForRank(currentStage.order));
              }, 3000);
            }
            return nextHp;
          });

          // Cooldown then back to idle
          setTimeout(() => {
            setEnemyAttackState('COOLDOWN');
            setTimeout(() => {
              setEnemyAttackState('IDLE');
              // Re-schedule
              setEnemy((e) => {
                scheduleEnemyAttack(e);
                return e;
              });
            }, 500);
          }, 400);
        }, currentEnemy.dodgeWindowMs);
      }, currentEnemy.attackInterval);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDodging, currentStage.order]
  );

  // Re-schedule whenever a new enemy spawns
  useEffect(() => {
    if (isPlayerDead) return;
    scheduleEnemyAttack(enemy);

    return () => {
      if (enemyAttackTimerRef.current) clearTimeout(enemyAttackTimerRef.current);
      if (enemyWindupTimerRef.current) clearTimeout(enemyWindupTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemy.id, isPlayerDead]);

  // ─── Main Player Attack Handler ──────────────────────────────────────────
  const handleAttack = useCallback(
    (type: CombatAttackType, e?: React.MouseEvent | React.TouchEvent) => {
      if (enemy.currentHp <= 0 || isPlayerDead) return;

      triggerHaptic(type === 'SPECIAL' ? 'heavy' : 'medium');
      if (type !== 'SPECIAL') playTapSound();

      // Feed into base tap economy (marked as combat tap)
      handleTap(undefined, undefined, 0, true);

      // Update attack sequence & check combos
      const newSeq = [...attackHistory, type];
      setAttackHistory(newSeq);
      resetComboTimer();

      const detectedCombo = CombatEngine.detectCombo(newSeq);
      let newChain = comboChain;

      if (detectedCombo) {
        newChain += 1;
        setComboChain(newChain);
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
        // Reset sequence after successful combo
        setAttackHistory([]);
      }

      // Calculate damage (now with skin bonus + tap style combo mult)
      const isCrit = Math.random() < effectiveCritChance;
      const damage = CombatEngine.calculateHitDamage(
        type,
        stats.powerPerTap || 1,
        detectedCombo,
        isCrit,
        skinBonus,
        tapStyleComboMult
      );

      // Trigger SPECIAL VFX
      if (type === 'SPECIAL') {
        setShowSpecialVFX(true);
        setTimeout(() => setShowSpecialVFX(false), 700);
      }

      // Player animation with instant response Pose Lock Timer (130ms for lightning fast taps)
      if (playerPoseTimerRef.current) clearTimeout(playerPoseTimerRef.current);
      setPlayerAction(type);
      playerPoseTimerRef.current = setTimeout(() => {
        setPlayerAction('IDLE');
      }, 130);

      // Floating hit effect on enemy side
      const rect = arenaRef.current?.getBoundingClientRect();
      const hitX = rect ? rect.width * 0.6 + (Math.random() * 40 - 20) : 160;
      const hitY = rect ? rect.height * 0.35 + (Math.random() * 30 - 15) : 80;

      const newEffect: CombatHitEffect = {
        id: `hit_${Date.now()}_${Math.random()}`,
        x: hitX,
        y: hitY,
        damage,
        attackType: type,
        isCombo: Boolean(detectedCombo),
        comboName: detectedCombo?.announceText,
      };
      setHitEffects((prev) => [...prev.slice(-2), newEffect]);
      setTimeout(() => {
        setHitEffects((prev) => prev.filter((e) => e.id !== newEffect.id));
      }, 450);

      // Special meter gain (with skin bonus applied)
      const specialGain = CombatEngine.getSkinSpecialMeterGain(
        type,
        skinBonus.specialMeterBonus,
        detectedCombo ? detectedCombo.specialMeterBonus : 0
      );
      setSpecialMeter((prev) => Math.min(100, prev + specialGain));

      // Round stats
      setRoundStats((r) => ({ ...r, damageDealt: r.damageDealt + damage }));
      if (type === 'SPECIAL')
        setRoundStats((r) => ({ ...r, specialsUsed: r.specialsUsed + 1 }));

      // Apply damage to enemy
      setEnemy((prev) => {
        const nextHp = Math.max(0, prev.currentHp - damage);
        if (nextHp <= 0) handleEnemyDefeated(prev);
        return { ...prev, currentHp: nextHp };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enemy.currentHp, isPlayerDead, attackHistory, comboChain, stats.powerPerTap]
  );

  // ─── Enemy Defeated ───────────────────────────────────────────────────────
  const handleEnemyDefeated = (defeatedEnemy: CombatEnemy) => {
    playHarvestSound();
    triggerHaptic('success');
    setPlayerAction('VICTORY');
    if (enemyAttackTimerRef.current) clearTimeout(enemyAttackTimerRef.current);
    if (enemyWindupTimerRef.current) clearTimeout(enemyWindupTimerRef.current);
    setEnemyAttackState('IDLE');
    triggerComboFlash('#10b981');

    // ── Capture round snapshot before reset ──
    const snap = { ...roundStats };
    const wasPerfect = !playerTookDamageThisRound.current;

    // Record victory with streak + quest integration
    recordCombatVictory({
      rewardGarlic: defeatedEnemy.rewardGarlic,
      rewardGc:     defeatedEnemy.rewardGc,
      rewardTeeth:  defeatedEnemy.rewardTeeth,
      combosExecuted: snap.combosExecuted,
      perfectDodges:  snap.perfectDodges,
      isBoss: enemy.type === 'BOSS' || Boolean(enemy.isBoss),
    } as any);

    const newStreak = combatWinStreak + 1;
    const streakBonus = newStreak >= 10 ? '🔥x2' : newStreak >= 5 ? '🔥x1.5' : newStreak >= 3 ? '🔥x1.25' : '';

    // Check if this is a boss wave (every 5 victories)
    const isBossSpawn = newStreak % 5 === 0;
    if (isBossSpawn) {
      const waveNum = Math.floor(newStreak / 5);
      setBossWaveNumber(waveNum);
      setIsBossWave(true);
      setShowBossCinematic(true);
      setTimeout(() => setShowBossCinematic(false), 2800);
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

    // Reset round stats for next fight
    playerTookDamageThisRound.current = false;
    setRoundStats({ combosExecuted: 0, perfectDodges: 0, damageDealt: 0, damageTaken: 0, maxComboChain: 0, specialsUsed: 0 });

    // Enter Intermission / Punching Bag Training Mode (4 seconds)
    setIsIntermission(true);
    setIntermissionCountdown(4);
    setEnemy({
      id: 'bag_' + Date.now(),
      name: 'BOLSA DE ENTRENAMIENTO 🥊',
      type: 'BUG',
      emoji: '🥊',
      maxHp: 99999,
      currentHp: 99999,
      rewardGarlic: 2,
      rewardGc: 5,
      rewardTeeth: 0,
      color: '#ef4444',
      attackDamage: 0,
      attackInterval: 999999,
      dodgeWindowMs: 0,
      spriteUrl: 'BAG',
    });

    let count = 4;
    const countTimer = setInterval(() => {
      count -= 1;
      setIntermissionCountdown(count);
      if (count <= 0) {
        clearInterval(countTimer);
        setIsIntermission(false);
        setPlayerAction('IDLE');
        const nextEnemy = isBossWave
          ? CombatEngine.spawnBossWave(bossWaveNumber, currentStage.order)
          : CombatEngine.spawnEnemyForRank(currentStage.order);
        setEnemy(nextEnemy);
      }
    }, 1000);
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
    if (dodgeCooldown || isDodging) return;
    setIsDodging(true);
    triggerHaptic('medium');
    setTimeout(() => setIsDodging(false), DODGE_DURATION_MS);
    setDodgeCooldown(true);
    setTimeout(() => setDodgeCooldown(false), getDodgeCD());
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`w-full flex flex-col items-center space-y-2 select-none no-touch-scroll transition-transform duration-75 ${
        screenShake ? 'animate-[shake_0.35s_ease-in-out]' : ''
      }`}
    >
      {/* ── INTERMISSION TRAINING BAG BANNER ── */}
      {isIntermission && (
        <div className="w-full flex items-center justify-center gap-2 animate-pulse z-40">
          <div className="px-4 py-1.5 rounded-full bg-amber-500/90 border-2 border-amber-300 text-black font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.9)] flex items-center gap-1.5">
            <span>🥊 ENTRENAMIENTO — PRÓXIMO RIVAL EN {intermissionCountdown}s</span>
          </div>
        </div>
      )}
      {/* ── Combo Flash Overlay ── */}
      {comboFlash && (
        <div
          className="fixed inset-0 pointer-events-none z-50 opacity-20 transition-opacity duration-300"
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
              {['🔥','💀','⚡','🔥','💀'].map((e, i) => (
                <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>{e}</span>
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
            {comboChain > 1 && (
              <div className="text-[9px] text-amber-300 font-black mt-0.5 animate-bounce">
                ⚡CADENA x{comboChain}
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
              className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${hpColor(playerHpPct)} ${
                isPlayerHit ? 'animate-ping opacity-80' : ''
              }`}
              style={{ width: `${playerHpPct}%` }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-emerald-400 w-8 text-right">
            {playerHp}HP
          </span>
        </div>

        {/* Row 3: Enemy HP bar */}
        <div className="flex items-center gap-1.5">
          <Swords className="w-3 h-3 text-red-400 flex-shrink-0" />
          <div className="flex-1 h-2.5 bg-black/60 rounded-full overflow-hidden border border-red-500/30">
            <div
              className={`h-full rounded-full transition-all duration-200 bg-gradient-to-r ${enemyHpColor(hpPct)}`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-red-400 w-8 text-right">
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
            className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] ${
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
          {comboChain > 1 && (
            <span className="bg-black/30 rounded-full px-1.5 text-white">x{comboChain}</span>
          )}
        </div>
      )}

      {/* ── 2D ARENA FIELD ── */}
      <div
        ref={arenaRef}
        className="relative w-full h-64 rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-b from-purple-950/40 via-black to-emerald-950/40 flex flex-col justify-between p-2 shadow-2xl"
        onTouchStart={handleTouchStartGesture}
        onTouchMove={handleTouchMoveGesture}
        onTouchEnd={handleTouchEndGesture}
      >
        {/* UPPER ZONE: PUNCH */}
        <div
          onClick={(e) => handleAttack('PUNCH', e)}
          onTouchStart={(e) => { e.preventDefault(); handleAttack('PUNCH', e); }}
          style={{ touchAction: 'none' }}
          className="w-full h-1/2 rounded-2xl bg-purple-500/5 hover:bg-purple-500/15 border border-purple-500/20 active:bg-purple-500/30 transition-all flex flex-col items-center justify-center cursor-pointer relative group"
        >
          <span className="text-[10px] font-black text-purple-300/50 uppercase tracking-widest group-hover:text-purple-300 group-active:scale-95 transition-transform">
            👆 ZONA SUPERIOR — PUÑETAZO (PUNCH)
          </span>
        </div>

        {/* 2D ARCADE FIGHTERS DISPLAY */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-around px-2 pb-2">
          {/* Player AJO Fighter (Left) */}
          <div className="relative z-10 flex items-center justify-center">
            <AnimatedFighterSprite
              pose={playerAction as any}
              facing="right"
              isHit={isPlayerHit}
              isLowHp={playerHp <= 25}
              size="md"
            />
          </div>

          {/* Impact Hit Spark Effect (Center) */}
          {(playerAction === 'PUNCH' || playerAction === 'KICK' || playerAction === 'SPECIAL') && (
            <div className="absolute z-30 pointer-events-none animate-ping text-5xl drop-shadow-[0_0_20px_rgba(245,158,11,1)]">
              {playerAction === 'SPECIAL' ? '✨' : playerAction === 'KICK' ? '⚡' : '💥'}
            </div>
          )}

          {/* Enemy Fighter (Right) */}
          <div className="relative z-10 flex items-center justify-center">
            <AnimatedFighterSprite
              pose={
                enemy.currentHp <= 0
                  ? 'DEFEAT'
                  : enemyAttackState === 'STRIKING'
                  ? 'PUNCH'
                  : enemyAttackState === 'WINDUP'
                  ? 'SPECIAL'
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

        {/* Enemy defeated overlay */}
        {enemy.currentHp <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl z-20 pointer-events-none">
            <div className="text-4xl animate-bounce">🏆</div>
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

        {/* LOWER ZONE: KICK */}
        <div
          onClick={(e) => handleAttack('KICK', e)}
          onTouchStart={(e) => { e.preventDefault(); handleAttack('KICK', e); }}
          style={{ touchAction: 'none' }}
          className="w-full h-1/2 rounded-2xl bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 active:bg-rose-500/30 transition-all flex flex-col items-center justify-center cursor-pointer relative group"
        >
          <span className="text-[10px] font-black text-rose-300/50 uppercase tracking-widest group-hover:text-rose-300 group-active:scale-95 transition-transform">
            👇 ZONA INFERIOR — PATADA (KICK)
          </span>
        </div>
      </div>

      {/* ── ACTION BUTTONS ROW ── */}
      <div className="w-full flex gap-2">
        {/* Dodge Button */}
        <button
          onClick={handleDodge}
          disabled={dodgeCooldown || isDodging || isPlayerDead}
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
          disabled={specialMeter < 100 || isPlayerDead}
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
                <span className="text-gray-300 text-[10px]">Ataque frontal rápido y preciso.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-lg border border-red-500/30">🦶 PATADA</span>
                <span className="text-gray-300 text-[10px]">Ataque de mayor potencia.</span>
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
