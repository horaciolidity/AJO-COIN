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
  // Position (% of arena)
  x: number;
  y: number;
  // Movement direction
  dx: number;
  dy: number;
  // Animation phase offset so each enemy bobs differently
  phase: number;
  // Speed multiplier
  speed: number;
  // Whether this enemy is "hitting" (flashing)
  hitting: boolean;
}

interface Projectile {
  id: string;
  x: number; // start x %
  y: number; // start y %
  tx: number; // target x % (center = 50)
  ty: number; // target y % (center = 50)
  progress: number; // 0 → 1
  color: string;
}

// ── Config per type ────────────────────────────────────────────────────────
const ENEMY_DEFS = {
  BUG:  { name: 'Mosca Plaga',    emoji: '🦟', baseHp: 30,  gc: 25,  teeth: 2,  speed: 0.6, color: '#ef4444' },
  WORM: { name: 'Oruga Veneno',   emoji: '🐛', baseHp: 20,  gc: 15,  teeth: 1,  speed: 0.4, color: '#a16207' },
  MOLD: { name: 'Hongo Tóxico',   emoji: '🍄', baseHp: 50,  gc: 40,  teeth: 3,  speed: 0.3, color: '#7e22ce' },
  BOSS: { name: 'JEFE PLAGA',     emoji: '👾', baseHp: 150, gc: 150, teeth: 10, speed: 0.5, color: '#dc2626' },
} as const;

// How many enemies can spawn at each level tier
function maxEnemiesByLevel(level: number): number {
  if (level <= 2)  return 1;
  if (level <= 4)  return 2;
  if (level <= 7)  return 3;
  if (level <= 12) return 4;
  return 5;
}

// Spawn interval in ms — gets faster with level
function spawnIntervalByLevel(level: number): number {
  return Math.max(4000, 12000 - level * 600);
}

// How much XP the enemy shot drains
function enemyShotXpDrain(type: Enemy['type']): number {
  const base = { BUG: 2, WORM: 1, MOLD: 3, BOSS: 8 };
  return base[type];
}

// ── Component ──────────────────────────────────────────────────────────────
export const EnemyTargets: React.FC = () => {
  const { stats, showToast } = useGame();
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [hitFlash, setHitFlash] = useState(false); // flash the garlic when hit
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const shotTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // ── Spawn ────────────────────────────────────────────────────────────────
  const spawnEnemy = useCallback(() => {
    setEnemies(prev => {
      const cap = maxEnemiesByLevel(stats.level);
      if (prev.length >= cap) return prev;

      const hasBoss = prev.some(e => e.type === 'BOSS');
      const isBoss = !hasBoss && Math.random() < 0.08 + stats.level * 0.01;

      let type: Enemy['type'];
      if (isBoss) {
        type = 'BOSS';
      } else {
        const roll = Math.random();
        if (roll < 0.45) type = 'BUG';
        else if (roll < 0.75) type = 'WORM';
        else type = 'MOLD';
      }

      const def = ENEMY_DEFS[type];
      const hpMult = 1 + (stats.level - 1) * 0.18;

      // Spawn on a random edge
      const edge = Math.floor(Math.random() * 4);
      let x = 0, y = 0, dx = 0, dy = 0;
      const speed = def.speed + Math.random() * 0.2;
      if (edge === 0) { x = Math.random() * 80 + 10; y = 5;  dx = (Math.random()-0.5)*0.4; dy = speed; }
      if (edge === 1) { x = Math.random() * 80 + 10; y = 90; dx = (Math.random()-0.5)*0.4; dy = -speed; }
      if (edge === 2) { x = 5;  y = Math.random() * 70 + 10; dx = speed; dy = (Math.random()-0.5)*0.4; }
      if (edge === 3) { x = 90; y = Math.random() * 70 + 10; dx = -speed; dy = (Math.random()-0.5)*0.4; }

      const enemy: Enemy = {
        id: 'e_' + Date.now() + Math.random().toString(36).slice(2, 5),
        type, name: def.name, emoji: def.emoji,
        maxHp: Math.floor(def.baseHp * hpMult),
        currentHp: Math.floor(def.baseHp * hpMult),
        rewardGc: def.gc, rewardTeeth: def.teeth,
        x, y, dx, dy,
        phase: Math.random() * Math.PI * 2,
        speed,
        hitting: false,
      };

      if (isBoss) showToast('👾 ¡JEFE PLAGA!', 'Elimínalo antes de que destruya tu ajo', 'warning');
      return [...prev, enemy];
    });
  }, [stats.level, showToast]);

  // ── Movement loop (rAF) ───────────────────────────────────────────────────
  useEffect(() => {
    const tick = (now: number) => {
      const dt = Math.min(now - (lastTimeRef.current || now), 50); // cap at 50ms
      lastTimeRef.current = now;
      const t = now / 1000;

      setEnemies(prev => prev.map(e => {
        // Drift toward garlic center (50, 50) with some wandering
        const cx = 50, cy = 50;
        const distX = cx - e.x, distY = cy - e.y;
        const dist = Math.sqrt(distX * distX + distY * distY) || 1;

        // Gentle homing force — stronger for boss
        const homingStrength = e.type === 'BOSS' ? 0.008 : 0.004;
        let ndx = e.dx + (distX / dist) * homingStrength * dt;
        let ndy = e.dy + (distY / dist) * homingStrength * dt;

        // Bob / float with per-enemy phase
        const bob = Math.sin(t * 2 + e.phase) * 0.012;
        ndy += bob;

        // Clamp speed
        const len = Math.sqrt(ndx * ndx + ndy * ndy);
        if (len > e.speed) { ndx = (ndx / len) * e.speed; ndy = (ndy / len) * e.speed; }

        // Bounce off walls
        let nx = e.x + ndx * dt * 0.05;
        let ny = e.y + ndy * dt * 0.05;
        if (nx < 5 || nx > 90) { ndx *= -1; nx = Math.max(5, Math.min(90, nx)); }
        if (ny < 5 || ny > 90) { ndy *= -1; ny = Math.max(5, Math.min(90, ny)); }

        // Stop close to center (so they "fight" the garlic)
        if (dist < 18) { ndx *= 0.3; ndy *= 0.3; }

        return { ...e, x: nx, y: ny, dx: ndx, dy: ndy };
      }));

      // Update projectile progress
      setProjectiles(prev =>
        prev
          .map(p => ({ ...p, progress: p.progress + dt * 0.003 }))
          .filter(p => p.progress < 1)
      );

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ── Enemy shooting logic (per enemy interval) ─────────────────────────────
  // Use a ref to snapshot enemy data so closures inside setTimeout stay accurate
  const enemiesRef = useRef<Enemy[]>([]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);

  const scheduleShotForEnemy = useCallback((enemy: Enemy) => {
    if (shotTimersRef.current.has(enemy.id)) return; // already scheduled

    const fire = () => {
      // Check if enemy still alive
      const live = enemiesRef.current.find(e => e.id === enemy.id);
      if (!live) { shotTimersRef.current.delete(enemy.id); return; }

      const proj: Projectile = {
        id: 'p_' + Date.now() + Math.random().toString(36).slice(2),
        x: live.x, y: live.y,
        tx: 50, ty: 52,
        progress: 0,
        color: ENEMY_DEFS[live.type].color,
      };
      setProjectiles(prev => [...prev.slice(-10), proj]);

      setTimeout(() => {
        const drain = enemyShotXpDrain(live.type);
        window.dispatchEvent(new CustomEvent('ENEMY_HIT_GARLIC', { detail: { drain } }));
        setHitFlash(true);
        setTimeout(() => setHitFlash(false), 200);
        triggerHaptic('light');
      }, 300);

      // Re-schedule next shot
      const delay = live.type === 'BOSS' ? 2500 : 4000 + Math.random() * 3000;
      shotTimersRef.current.set(enemy.id, setTimeout(fire, delay));
    };

    const initialDelay = enemy.type === 'BOSS' ? 2000 : 3000 + Math.random() * 3000;
    shotTimersRef.current.set(enemy.id, setTimeout(fire, initialDelay));
  }, []);

  // Schedule shots for newly appeared enemies
  useEffect(() => {
    enemies.forEach(e => scheduleShotForEnemy(e));
    // Clean up timers for enemies that no longer exist
    const currentIds = new Set(enemies.map(e => e.id));
    shotTimersRef.current.forEach((timer, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timer);
        shotTimersRef.current.delete(id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemies.map(e => e.id).join('|'), scheduleShotForEnemy]);

  // ── Spawn interval ────────────────────────────────────────────────────────
  useEffect(() => {
    spawnEnemy();
    const interval = setInterval(spawnEnemy, spawnIntervalByLevel(stats.level));
    return () => clearInterval(interval);
  }, [spawnEnemy, stats.level]);

  // ── Wipeout listener (charged attack) ────────────────────────────────────
  useEffect(() => {
    const onWipeout = () => {
      setEnemies(prev => {
        if (!prev.length) return prev;
        let totalGc = 0, totalTeeth = 0;
        prev.forEach(e => { totalGc += e.rewardGc * 1.5; totalTeeth += e.rewardTeeth; });
        triggerHaptic('success');
        playCoinSound();
        showToast('🔥 ¡DESTRUCCIÓN TOTAL!', `+${Math.round(totalGc)} GC  +${totalTeeth} 🦷`, 'success');
        shotTimersRef.current.forEach(t => clearTimeout(t));
        shotTimersRef.current.clear();
        return [];
      });
      setProjectiles([]);
    };
    window.addEventListener('CHARGE_WIPEOUT_RELEASE', onWipeout);
    return () => window.removeEventListener('CHARGE_WIPEOUT_RELEASE', onWipeout);
  }, [showToast]);

  // ── Tap on enemy ──────────────────────────────────────────────────────────
  const handleEnemyTap = (e: React.MouseEvent | React.TouchEvent, enemyId: string) => {
    e.stopPropagation();
    triggerHaptic('light');
    playTapSound();

    const damage = Math.max(15, (stats.powerPerTap || 10) * 3);

    setEnemies(prev => {
      const updated = prev.map(enemy => {
        if (enemy.id !== enemyId) return enemy;
        const nextHp = enemy.currentHp - damage;
        if (nextHp <= 0) {
          // Remove shot timer
          const timer = shotTimersRef.current.get(enemyId);
          if (timer) { clearTimeout(timer); shotTimersRef.current.delete(enemyId); }

          triggerHaptic('success');
          playCoinSound();
          showToast(`💥 ¡${enemy.name} Destruido!`, `+${enemy.rewardGc} GC  +${enemy.rewardTeeth} 🦷`, 'success');
          return null;
        }
        return { ...enemy, currentHp: nextHp, hitting: true };
      }).filter(Boolean) as Enemy[];

      // Clear "hitting" flash after 150ms
      setTimeout(() => {
        setEnemies(p => p.map(en => en.id === enemyId ? { ...en, hitting: false } : en));
      }, 150);

      return updated;
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const activeBoss = enemies.find(e => e.type === 'BOSS');

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">

      {/* Boss HP bar */}
      {activeBoss && (
        <div className="absolute top-2 inset-x-4 z-40 pointer-events-none
          bg-black/85 border-2 border-red-500/80 rounded-2xl p-2 shadow-2xl">
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
        <div className="absolute inset-0 bg-red-500/20 pointer-events-none z-50 rounded-full
          animate-ping" style={{ animationDuration: '0.2s', animationIterationCount: 1 }} />
      )}

      {/* Enemies */}
      {enemies.map(enemy => {
        const hpPct = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);
        const isBoss = enemy.type === 'BOSS';
        const def = ENEMY_DEFS[enemy.type];

        return (
          <div
            key={enemy.id}
            onClick={ev => handleEnemyTap(ev, enemy.id)}
            onTouchStart={ev => handleEnemyTap(ev, enemy.id)}
            className="absolute pointer-events-auto cursor-pointer select-none"
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
                  ? 'w-16 h-16 text-4xl border-red-400 enemy-boss-glow'
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
              className="block text-center mt-0.5 px-1.5 rounded-full border border-white/10
                text-white font-extrabold drop-shadow-md bg-black/60"
              style={{ fontSize: isBoss ? '9px' : '8px' }}
            >
              {enemy.name}
            </span>
          </div>
        );
      })}

      {/* Level indicator overlay */}
      {enemies.length === 0 && (
        <div className="absolute bottom-8 inset-x-0 flex justify-center pointer-events-none">
          <span className="text-[10px] text-white/30 animate-pulse">
            Zona tranquila... por ahora
          </span>
        </div>
      )}
    </div>
  );
};
