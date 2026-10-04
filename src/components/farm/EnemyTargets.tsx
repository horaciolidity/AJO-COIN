import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { triggerHaptic } from '../../utils/haptics';
import { playCoinSound, playTapSound } from '../../utils/audio';

// ── Types ──────────────────────────────────────────────────────────────────
interface Enemy {
  id: string;
  type: 'BUG' | 'WORM' | 'MOLD' | 'BOSS';
  name: string;
  emoji: string;
  maxHp: number;
  currentHp: number;
  rewardGc: number;
  rewardTeeth: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  phase: number;
  speed: number;
  hitting: boolean;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  progress: number;
  color: string;
}

interface DeathEffect {
  id: string;
  x: number;
  y: number;
  name: string;
  emoji: string;
  rewardGc: number;
  rewardTeeth: number;
}

// Wave state machine
type WavePhase = 'IDLE' | 'SPAWNING' | 'FIGHTING' | 'COOLDOWN';

// ── Config per type ────────────────────────────────────────────────────────
const ENEMY_DEFS = {
  BUG:  { name: 'Mosca Plaga',  emoji: '🦟', baseHp: 18,  gc: 25,  teeth: 2,  speed: 0.35, color: '#ef4444' },
  WORM: { name: 'Oruga Veneno', emoji: '🐛', baseHp: 12,  gc: 15,  teeth: 1,  speed: 0.25, color: '#a16207' },
  MOLD: { name: 'Hongo Tóxico', emoji: '🍄', baseHp: 25,  gc: 40,  teeth: 3,  speed: 0.20, color: '#7e22ce' },
  BOSS: { name: 'JEFE PLAGA',   emoji: '👾', baseHp: 75,  gc: 150, teeth: 10, speed: 0.30, color: '#dc2626' },
} as const;

// ── Wave helpers ──────────────────────────────────────────────────────────
// XP milestones that trigger a new wave
const XP_MILESTONES = [50, 150, 300, 500, 800, 1200, 1800, 2600, 3600, 5000];

// Stagger between each enemy spawn inside a wave (ms)
const SPAWN_STAGGER_MS = 1800;

function enemiesForMilestone(idx: number): number {
  if (idx <= 1) return 1;
  if (idx <= 3) return 2;
  if (idx <= 6) return 3;
  return Math.min(4, 2 + Math.floor(idx / 3));
}

function shouldSpawnBoss(idx: number, level: number): boolean {
  if (idx === 2 || idx === 5) return true;
  if (idx >= 8) return Math.random() < 0.6;
  return Math.random() < 0.05 + level * 0.008;
}

// Cooldown after wave is cleared (ms) — between 6s and 14s
function waveCooldownMs(idx: number): number {
  return Math.max(6000, 14000 - idx * 800);
}

function buildWaveEnemies(idx: number, level: number): Omit<Enemy, 'id'>[] {
  const count = enemiesForMilestone(idx);
  const withBoss = shouldSpawnBoss(idx, level);
  const result: Omit<Enemy, 'id'>[] = [];
  const hpMult = 1 + (level - 1) * 0.08;
  for (let i = 0; i < count; i++) {
    let type: Enemy['type'];
    if (i === 0 && withBoss) {
      type = 'BOSS';
    } else {
      const roll = Math.random();
      if (roll < 0.50) type = 'BUG';
      else if (roll < 0.80) type = 'WORM';
      else type = 'MOLD';
    }
    const def = ENEMY_DEFS[type];
    const edge = Math.floor(Math.random() * 4);
    let x = 50, y = 50, dx = 0, dy = 0;
    const speed = def.speed + Math.random() * 0.1;
    if (edge === 0) { x = Math.random() * 80 + 10; y = 5;  dx = (Math.random() - 0.5) * 0.25; dy = speed; }
    if (edge === 1) { x = Math.random() * 80 + 10; y = 90; dx = (Math.random() - 0.5) * 0.25; dy = -speed; }
    if (edge === 2) { x = 5;  y = Math.random() * 70 + 10; dx = speed; dy = (Math.random() - 0.5) * 0.25; }
    if (edge === 3) { x = 90; y = Math.random() * 70 + 10; dx = -speed; dy = (Math.random() - 0.5) * 0.25; }
    result.push({
      type, name: def.name, emoji: def.emoji,
      maxHp: Math.floor(def.baseHp * hpMult),
      currentHp: Math.floor(def.baseHp * hpMult),
      rewardGc: def.gc, rewardTeeth: def.teeth,
      x, y, dx, dy,
      phase: Math.random() * Math.PI * 2,
      speed, hitting: false,
    });
  }
  return result;
}

function enemyShotXpDrain(type: Enemy['type']): number {
  const base = { BUG: 1, WORM: 1, MOLD: 2, BOSS: 4 };
  return base[type];
}

// ── Component ──────────────────────────────────────────────────────────────
export const EnemyTargets: React.FC = () => {
  const { stats, showToast, addEnemyReward } = useGame();

  // ── All state hooks at top level (fixes React error #185) ────────────
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [deathEffects, setDeathEffects] = useState<DeathEffect[]>([]);
  const [hitFlash, setHitFlash] = useState(false);
  const [wavePhase, setWavePhase] = useState<WavePhase>('IDLE');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [currentMilestoneIdx, setCurrentMilestoneIdx] = useState(0);

  // ── Refs ────────────────────────────────────────────────────────────
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const shotTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const wavePhaseRef = useRef<WavePhase>('IDLE');
  const milestoneIdxRef = useRef<number>(0);
  const prevXpRef = useRef<number>(stats.xp);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnQueueRef = useRef<Omit<Enemy, 'id'>[]>([]);
  const spawnStaggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync with state
  useEffect(() => { wavePhaseRef.current = wavePhase; }, [wavePhase]);
  useEffect(() => { milestoneIdxRef.current = currentMilestoneIdx; }, [currentMilestoneIdx]);

  // Dispatch active enemy count event so GarlicCharacter can trigger cover/block stance
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('GARLIC_ENEMY_COUNT_CHANGED', { detail: { count: enemies.length } }));
  }, [enemies.length]);

  // ── Death effect helper ──────────────────────────────────────────────
  const triggerDeathEffect = useCallback((enemy: Enemy) => {
    const effect: DeathEffect = {
      id: 'd_' + Date.now() + Math.random().toString(36).slice(2, 5),
      x: enemy.x, y: enemy.y, name: enemy.name, emoji: enemy.emoji,
      rewardGc: enemy.rewardGc, rewardTeeth: enemy.rewardTeeth,
    };
    setDeathEffects(prev => [...prev.slice(-6), effect]);
    setTimeout(() => { setDeathEffects(prev => prev.filter(d => d.id !== effect.id)); }, 850);
  }, []);

  // ── Spawn next enemy from queue (staggered) ──────────────────────────
  const spawnNextFromQueue = useCallback(() => {
    const queue = spawnQueueRef.current;
    if (queue.length === 0) return;
    const def = queue.shift()!;
    const enemy: Enemy = { ...def, id: 'e_' + Date.now() + Math.random().toString(36).slice(2, 5) };
    if (enemy.type === 'BOSS') showToast('👾 ¡JEFE PLAGA!', 'Elimínalo antes de que destruya tu ajo', 'warning');
    setEnemies(prev => [...prev, enemy]);
    if (queue.length > 0) {
      spawnStaggerTimerRef.current = setTimeout(spawnNextFromQueue, SPAWN_STAGGER_MS);
    } else {
      setWavePhase('FIGHTING');
    }
  }, [showToast]);

  // ── Start cooldown after wave cleared ────────────────────────────────
  const startCooldown = useCallback((idx: number) => {
    const cd = waveCooldownMs(idx);
    setCooldownRemaining(cd);
    setWavePhase('COOLDOWN');
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownRemaining(prev => {
        const next = prev - 500;
        if (next <= 0) { if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current); return 0; }
        return next;
      });
    }, 500);
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => {
      setWavePhase('IDLE');
      showToast('😮‍💨 Zona tranquila', 'Sigue tapeando para el siguiente hito', 'info');
    }, cd);
  }, [showToast]);

  // ── Start a wave ─────────────────────────────────────────────────────
  const startWave = useCallback((milestoneIdx: number, level: number) => {
    if (wavePhaseRef.current === 'SPAWNING' || wavePhaseRef.current === 'FIGHTING') return;
    const waveDefs = buildWaveEnemies(milestoneIdx, level);
    const hasBoss = waveDefs.some(e => e.type === 'BOSS');
    const count = waveDefs.length;
    showToast(
      hasBoss ? '👾 ¡OLEADA CON JEFE!' : `⚔️ ¡OLEADA ${milestoneIdx + 1}!`,
      `${count} enemigo${count > 1 ? 's' : ''} en camino...`,
      'warning'
    );
    spawnQueueRef.current = waveDefs;
    setWavePhase('SPAWNING');
    spawnStaggerTimerRef.current = setTimeout(spawnNextFromQueue, 600);
  }, [showToast, spawnNextFromQueue]);

  // ── Detect XP milestone crossover → trigger wave ──────────────────────
  useEffect(() => {
    const prevXp = prevXpRef.current;
    const currXp = stats.xp;
    prevXpRef.current = currXp;

    const phase = wavePhaseRef.current;
    if (phase === 'SPAWNING' || phase === 'FIGHTING' || phase === 'COOLDOWN') return;

    let nextIdx = milestoneIdxRef.current;

    // Initial mount check: if no wave has ever run, find current milestone
    if (nextIdx === 0 && enemies.length === 0) {
      let targetIdx = XP_MILESTONES.findIndex(m => currXp < m);
      if (targetIdx === -1) targetIdx = XP_MILESTONES.length - 1;
      milestoneIdxRef.current = targetIdx + 1;
      setCurrentMilestoneIdx(targetIdx + 1);
      startWave(targetIdx, stats.level);
      return;
    }

    if (nextIdx >= XP_MILESTONES.length) return;
    const threshold = XP_MILESTONES[nextIdx];

    // Trigger next wave only when player crosses the XP threshold by tapping
    if (prevXp < threshold && currXp >= threshold) {
      milestoneIdxRef.current = nextIdx + 1;
      setCurrentMilestoneIdx(nextIdx + 1);
      startWave(nextIdx, stats.level);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.xp, stats.level, startWave]);

  // ── Auto-detect wave cleared ─────────────────────────────────────────
  useEffect(() => {
    if (wavePhase === 'FIGHTING' && enemies.length === 0) {
      triggerHaptic('success');
      showToast('🎉 ¡Oleada eliminada!', 'Zona tranquila activada. Sigue tapeando para alcanzar la próxima oleada.', 'success');
      startCooldown(Math.max(0, milestoneIdxRef.current - 1));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies.length, wavePhase]);

  // ── Global cleanup on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      shotTimersRef.current.forEach(t => clearTimeout(t));
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
      if (spawnStaggerTimerRef.current) clearTimeout(spawnStaggerTimerRef.current);
    };
  }, []);

  // ── Movement loop (rAF) ───────────────────────────────────────────────────
  useEffect(() => {
    const tick = (now: number) => {
      const dt = Math.min(now - (lastTimeRef.current || now), 50); // cap at 50ms
      lastTimeRef.current = now;
      const t = now / 1000;

      setEnemies(prev => prev.map(e => {
        // Gentle drift toward center with wandering
        const cx = 50, cy = 50;
        const distX = cx - e.x, distY = cy - e.y;
        const dist = Math.sqrt(distX * distX + distY * distY) || 1;

        const homingStrength = e.type === 'BOSS' ? 0.005 : 0.002;
        let ndx = e.dx + (distX / dist) * homingStrength * dt;
        let ndy = e.dy + (distY / dist) * homingStrength * dt;

        // Gentle floating bob
        const bob = Math.sin(t * 1.5 + e.phase) * 0.008;
        ndy += bob;

        // Clamp speed
        const len = Math.sqrt(ndx * ndx + ndy * ndy);
        if (len > e.speed) { ndx = (ndx / len) * e.speed; ndy = (ndy / len) * e.speed; }

        // Bounce off bounds
        let nx = e.x + ndx * dt * 0.04;
        let ny = e.y + ndy * dt * 0.04;
        if (nx < 5 || nx > 90) { ndx *= -1; nx = Math.max(5, Math.min(90, nx)); }
        if (ny < 5 || ny > 90) { ndy *= -1; ny = Math.max(5, Math.min(90, ny)); }

        // Slow down near center
        if (dist < 18) { ndx *= 0.3; ndy *= 0.3; }

        return { ...e, x: nx, y: ny, dx: ndx, dy: ndy };
      }));

      // Update projectile progress
      setProjectiles(prev =>
        prev
          .map(p => ({ ...p, progress: p.progress + dt * 0.0025 }))
          .filter(p => p.progress < 1)
      );

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ── Enemy shooting logic ──────────────────────────────────────────────────
  const enemiesRef = useRef<Enemy[]>([]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  const scheduleShotForEnemy = useCallback((enemy: Enemy) => {
    if (shotTimersRef.current.has(enemy.id)) return;

    const fire = () => {
      const live = enemiesRef.current.find(e => e.id === enemy.id);
      if (!live) { shotTimersRef.current.delete(enemy.id); return; }

      const proj: Projectile = {
        id: 'p_' + Date.now() + Math.random().toString(36).slice(2),
        x: live.x, y: live.y,
        tx: 50, ty: 52,
        progress: 0,
        color: ENEMY_DEFS[live.type].color,
      };
      setProjectiles(prev => [...prev.slice(-8), proj]);

      setTimeout(() => {
        const drain = enemyShotXpDrain(live.type);
        window.dispatchEvent(new CustomEvent('ENEMY_HIT_GARLIC', { detail: { drain } }));
        setHitFlash(true);
        setTimeout(() => setHitFlash(false), 200);
        triggerHaptic('light');
      }, 350);

      // Re-schedule next shot with longer delay
      const delay = live.type === 'BOSS' ? 4000 : 6000 + Math.random() * 4000;
      shotTimersRef.current.set(enemy.id, setTimeout(fire, delay));
    };

    const initialDelay = enemy.type === 'BOSS' ? 3000 : 4500 + Math.random() * 3500;
    shotTimersRef.current.set(enemy.id, setTimeout(fire, initialDelay));
  }, []);

  // Schedule shots for active enemies
  useEffect(() => {
    enemies.forEach(e => scheduleShotForEnemy(e));
    const currentIds = new Set(enemies.map(e => e.id));
    shotTimersRef.current.forEach((timer, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timer);
        shotTimersRef.current.delete(id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies.map(e => e.id).join('|'), scheduleShotForEnemy]);

  // ── Wipeout listener (charged attack) ────────────────────────────────────
  useEffect(() => {
    const onWipeout = () => {
      const prevEnemies = enemiesRef.current;
      if (!prevEnemies.length) return;

      let totalGc = 0, totalTeeth = 0;
      prevEnemies.forEach(e => {
        totalGc += e.rewardGc * 1.5;
        totalTeeth += e.rewardTeeth;
        triggerDeathEffect(e);
      });

      shotTimersRef.current.forEach(t => clearTimeout(t));
      shotTimersRef.current.clear();
      setEnemies([]);
      setProjectiles([]);

      // ✅ Credit real rewards to player inventory
      addEnemyReward(Math.round(totalGc), totalTeeth);

      triggerHaptic('success');
      playCoinSound();
      showToast('🔥 ¡DESTRUCCIÓN TOTAL!', `+${Math.round(totalGc)} GC  +${totalTeeth} 🦷`, 'success');
    };
    window.addEventListener('CHARGE_WIPEOUT_RELEASE', onWipeout);
    return () => window.removeEventListener('CHARGE_WIPEOUT_RELEASE', onWipeout);
  }, [showToast, triggerDeathEffect]);

  // ── Tap on enemy ──────────────────────────────────────────────────────────
  const handleEnemyTap = (e: React.MouseEvent | React.TouchEvent, enemyId: string) => {
    e.stopPropagation();
    triggerHaptic('light');
    playTapSound();

    const targetEnemy = enemiesRef.current.find(en => en.id === enemyId);
    if (!targetEnemy) return;

    const damage = Math.max(18, (stats.powerPerTap || 10) * 3.5);
    const willKill = targetEnemy.currentHp <= damage;

    if (willKill) {
      const timer = shotTimersRef.current.get(enemyId);
      if (timer) { clearTimeout(timer); shotTimersRef.current.delete(enemyId); }

      setEnemies(prev => prev.filter(en => en.id !== enemyId));

      triggerDeathEffect(targetEnemy);

      // ✅ Credit real rewards to player inventory
      addEnemyReward(targetEnemy.rewardGc, targetEnemy.rewardTeeth);

      triggerHaptic('success');
      playCoinSound();
      showToast(`💥 ¡${targetEnemy.name} Eliminado!`, `+${targetEnemy.rewardGc} GC  +${targetEnemy.rewardTeeth} 🦷`, 'success');
    } else {
      setEnemies(prev =>
        prev.map(en => (en.id === enemyId ? { ...en, currentHp: en.currentHp - damage, hitting: true } : en))
      );
      setTimeout(() => {
        setEnemies(prev =>
          prev.map(en => (en.id === enemyId ? { ...en, hitting: false } : en))
        );
      }, 150);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const activeBoss = enemies.find(e => e.type === 'BOSS');

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">

      {/* Boss HP bar */}
      {activeBoss && (
        <div className="absolute top-2 inset-x-4 z-40 pointer-events-none bg-black/85 border-2 border-red-500/80 rounded-2xl p-2 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-black text-red-400 mb-1">
            <span className="flex items-center gap-1">
              <span className="text-base animate-bounce inline-block">👾</span>
              {activeBoss.name}
            </span>
            <span>{activeBoss.currentHp} / {activeBoss.maxHp} HP</span>
          </div>
          <div className="w-full h-3 bg-red-950 rounded-full overflow-hidden border border-red-500/40 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 rounded-full transition-all duration-200"
              style={{ width: `${Math.max(0, (activeBoss.currentHp / activeBoss.maxHp) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Projectiles */}
      {projectiles.map(p => {
        const cx = p.x + (p.tx - p.x) * p.progress;
        const cy = p.y + (p.ty - p.y) * p.progress;
        const scale = 1 - p.progress * 0.4;
        return (
          <div
            key={p.id}
            className="absolute w-3 h-3 rounded-full pointer-events-none"
            style={{
              left: `${cx}%`,
              top: `${cy}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}, 0 0 16px ${p.color}80`,
              opacity: 1 - p.progress * 0.3,
            }}
          />
        );
      })}

      {/* Hit flash overlay on garlic */}
      {hitFlash && (
        <div
          className="absolute inset-0 bg-red-500/20 pointer-events-none z-50 rounded-full animate-ping"
          style={{ animationDuration: '0.2s', animationIterationCount: 1 }}
        />
      )}

      {/* VISIBLE DEATH EFFECTS (EXPLOSION BURST & FLOATING REWARD TEXT) */}
      {deathEffects.map(d => (
        <div
          key={d.id}
          className="absolute pointer-events-none z-50 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
        >
          {/* Shockwave Burst Ring */}
          <div className="absolute w-16 h-16 rounded-full border-4 border-red-500/80 bg-orange-500/30 blur-xs animate-ping" />
          <div className="absolute w-24 h-24 rounded-full bg-yellow-400/20 blur-md animate-pulse" />

          {/* Disintegrating Enemy Emoji */}
          <span className="text-3xl animate-enemy-death opacity-90 select-none">
            {d.emoji}
          </span>

          {/* Floating Reward Badge & Score Popup */}
          <div className="absolute -top-6 flex flex-col items-center animate-float-up-fade">
            <span className="bg-red-950/90 border border-red-500 text-red-200 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xl whitespace-nowrap">
              💥 ¡ELIMINADO!
            </span>
            <span className="text-xs font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap mt-0.5">
              +{d.rewardGc} GC  +{d.rewardTeeth} 🦷
            </span>
          </div>
        </div>
      ))}

      {/* Live Enemies */}
      {enemies.map(enemy => {
        const hpPct = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);
        const isBoss = enemy.type === 'BOSS';
        const def = ENEMY_DEFS[enemy.type];

        return (
          <div
            key={enemy.id}
            onClick={ev => handleEnemyTap(ev, enemy.id)}
            onTouchStart={ev => handleEnemyTap(ev, enemy.id)}
            className="absolute pointer-events-auto cursor-pointer select-none animate-enemy-pop"
            style={{
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'none',
              zIndex: isBoss ? 45 : 40,
            }}
          >
            {/* HP bar */}
            <div className="w-12 h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/20 mb-1 mx-auto">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${hpPct}%`,
                  background: hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>

            {/* Enemy body */}
            <div
              className={`relative flex items-center justify-center rounded-2xl border shadow-lg
                active:scale-90 transition-transform select-none
                ${isBoss
                  ? 'w-15 h-15 text-3xl border-red-400 enemy-boss-glow'
                  : 'w-11 h-11 text-2xl border-white/30'
                }
                ${enemy.hitting ? 'enemy-hit-flash' : ''}
              `}
              style={{
                background: isBoss
                  ? 'radial-gradient(circle, rgba(220,38,38,0.4) 0%, rgba(0,0,0,0.8) 100%)'
                  : `radial-gradient(circle, ${def.color}22 0%, rgba(0,0,0,0.75) 100%)`,
                boxShadow: isBoss
                  ? `0 0 20px ${def.color}90, 0 0 40px ${def.color}40`
                  : `0 0 8px ${def.color}50`,
                animation: isBoss
                  ? 'enemyBossFloat 1.8s ease-in-out infinite'
                  : `enemyFloat ${2 + enemy.phase % 1.2}s ease-in-out infinite`,
                animationDelay: `${enemy.phase * 0.5}s`,
              }}
            >
              <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
                {enemy.emoji}
              </span>

              {/* Rotating danger ring */}
              <div
                className="absolute -inset-1.5 rounded-2xl border-2 border-dashed pointer-events-none"
                style={{
                  borderColor: `${def.color}70`,
                  animation: 'spin 3s linear infinite',
                }}
              />
            </div>

            {/* Name tag */}
            <span
              className="block text-center mt-0.5 px-1.5 rounded-full border border-white/10 text-white font-extrabold drop-shadow-md bg-black/60"
              style={{ fontSize: isBoss ? '9px' : '8px' }}
            >
              {enemy.name}
            </span>
          </div>
        );
      })}

      {/* Status overlay when no enemies */}
      {enemies.length === 0 && (
        <div className="absolute bottom-8 inset-x-0 flex flex-col items-center pointer-events-none gap-1">
          {wavePhase === 'COOLDOWN' && cooldownRemaining > 0 && (
            <span className="text-[10px] text-orange-300/80 bg-black/60 px-3 py-1 rounded-full border border-orange-500/30 font-bold animate-pulse">
              ⏳ Zona tranquila ({Math.ceil(cooldownRemaining / 1000)}s)
            </span>
          )}
          {wavePhase === 'IDLE' && (
            <span className="text-[10px] text-amber-300/90 bg-black/70 px-3 py-1 rounded-full border border-amber-500/40 font-extrabold animate-pulse">
              😮‍💨 Zona tranquila • Tapea para alcanzar {XP_MILESTONES[currentMilestoneIdx] || 'máximo'} XP y activar la próxima oleada
            </span>
          )}
        </div>
      )}
    </div>
  );
};
