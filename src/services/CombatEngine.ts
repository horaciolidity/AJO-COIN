import { CombatAttackType, CombatEnemy, ComboDefinition, SkinId, TapStyleId } from '../types';

// ── Skin Passive Combat Bonuses ────────────────────────────────────────────────
export interface SkinCombatBonus {
  /** Extra multiplier on PUNCH damage (e.g. 1.15 = +15%) */
  punchMult: number;
  /** Extra multiplier on KICK damage */
  kickMult: number;
  /** Extra multiplier on SPECIAL damage */
  specialMult: number;
  /** Extra special meter gain per attack (flat points) */
  specialMeterBonus: number;
  /** Dodge cooldown reduction (0–1, 0.2 = 20% shorter) */
  dodgeCDReduction: number;
  /** Flat bonus to critical chance (0–1) */
  critBonus: number;
  /** Flavour label shown in HUD */
  label: string;
}

export const COMBAT_SKIN_BONUSES: Record<SkinId, SkinCombatBonus> = {
  DEFAULT: { punchMult: 1.0,  kickMult: 1.0,  specialMult: 1.0,  specialMeterBonus: 0,  dodgeCDReduction: 0,    critBonus: 0,    label: '' },
  NINJA:   { punchMult: 1.15, kickMult: 1.25, specialMult: 1.1,  specialMeterBonus: 2,  dodgeCDReduction: 0.30, critBonus: 0.05, label: '🥷 Sigilo: Patada +25%, Esquiva -30% CD' },
  KING:    { punchMult: 1.1,  kickMult: 1.1,  specialMult: 1.3,  specialMeterBonus: 5,  dodgeCDReduction: 0,    critBonus: 0.03, label: '👑 Realeza: Especial +30%, +5 Barra/golpe' },
  ROBOT:   { punchMult: 1.2,  kickMult: 1.0,  specialMult: 1.2,  specialMeterBonus: 3,  dodgeCDReduction: 0.15, critBonus: 0,    label: '🤖 Mech: Puño +20%, Especial +20%' },
  FIRE:    { punchMult: 1.25, kickMult: 1.15, specialMult: 1.5,  specialMeterBonus: 4,  dodgeCDReduction: 0,    critBonus: 0.08, label: '🔥 Fuego: ESPECIAL +50%, Crit +8%' },
  ALIEN:   { punchMult: 1.1,  kickMult: 1.2,  specialMult: 1.2,  specialMeterBonus: 6,  dodgeCDReduction: 0.20, critBonus: 0.05, label: '👽 Alien: Barra ESPECIAL muy rápida' },
  DEAD:    { punchMult: 1.0,  kickMult: 1.35, specialMult: 1.1,  specialMeterBonus: 0,  dodgeCDReduction: 0,    critBonus: 0.12, label: '💀 Zombi: Patada +35%, Crit +12%' },
  RICH:    { punchMult: 1.05, kickMult: 1.05, specialMult: 1.4,  specialMeterBonus: 8,  dodgeCDReduction: 0.10, critBonus: 0.02, label: '🎩 Lujo: Especial +40%, +8 barra por golpe' },
};

/** Returns the comboMultiplier for a given tap style (default 1.0 if not found) */
export const TAP_STYLE_COMBO_MULT: Record<TapStyleId, number> = {
  NORMAL:     1.0,
  FIRE_PUNCH: 1.3,
  ICE_STRIKE: 1.5,
  KAME_HAME:  2.5,
  THUNDER:    2.0,
  SHADOW:     1.8,
  COSMIC:     3.0,
  DRAGON:     3.5,
};

export const COMBOS_CATALOG: ComboDefinition[] = [
  {
    id: 'combo_triple_punch',
    name: 'Triple Jab',
    sequence: ['PUNCH', 'PUNCH', 'PUNCH'],
    damageMultiplier: 2.0,
    specialMeterBonus: 15,
    rewardMultiplier: 1.5,
    vfxEmoji: '💥🥊',
    announceText: 'TRIPLE PUNCH!',
  },
  {
    id: 'combo_hurricane_kick',
    name: 'Hurricane Kick',
    sequence: ['KICK', 'KICK', 'KICK'],
    damageMultiplier: 2.2,
    specialMeterBonus: 15,
    rewardMultiplier: 1.6,
    vfxEmoji: '🌪️🦶',
    announceText: 'HURRICANE KICK!',
  },
  {
    id: 'combo_rising_garlic',
    name: 'Rising Garlic',
    sequence: ['PUNCH', 'KICK', 'PUNCH'],
    damageMultiplier: 2.5,
    specialMeterBonus: 25,
    rewardMultiplier: 2.0,
    vfxEmoji: '⚡🧄',
    announceText: 'RISING GARLIC!',
  },
  {
    id: 'combo_spinning_sweep',
    name: 'Spinning Sweep',
    sequence: ['KICK', 'PUNCH', 'KICK'],
    damageMultiplier: 2.5,
    specialMeterBonus: 25,
    rewardMultiplier: 2.0,
    vfxEmoji: '🌀💥',
    announceText: 'SPINNING SWEEP!',
  },
  {
    id: 'combo_heavy_knockdown',
    name: 'Heavy Knockdown',
    sequence: ['PUNCH', 'PUNCH', 'KICK'],
    damageMultiplier: 2.8,
    specialMeterBonus: 30,
    rewardMultiplier: 2.2,
    vfxEmoji: '🔥🔨',
    announceText: 'HEAVY KNOCKDOWN!',
  },
  {
    id: 'combo_kick_jab_finisher',
    name: 'Kick-Jab Finisher',
    sequence: ['KICK', 'KICK', 'PUNCH'],
    damageMultiplier: 2.6,
    specialMeterBonus: 28,
    rewardMultiplier: 2.1,
    vfxEmoji: '💫🥊',
    announceText: 'FINISHER COMBO!',
  },
];

/** Base enemy stats — each field maps 1:1 to CombatEnemy */
export const ENEMY_CATALOG: Omit<CombatEnemy, 'id' | 'currentHp'>[] = [
  {
    name: 'PUNK BRAWLER 🥊',
    type: 'BUG',
    emoji: '🥊',
    maxHp: 35,
    rewardGarlic: 5,
    rewardGc: 20,
    rewardTeeth: 2,
    color: '#ef4444',
    attackDamage: 3,
    attackInterval: 4000,
    dodgeWindowMs: 1200,
    spriteUrl: '/assets/fighter/enemy_brawler_idle.png',
  },
  {
    name: 'SHADOW NINJA 🥷',
    type: 'WORM',
    emoji: '🥷',
    maxHp: 50,
    rewardGarlic: 8,
    rewardGc: 30,
    rewardTeeth: 3,
    color: '#a16207',
    attackDamage: 6,
    attackInterval: 3500,
    dodgeWindowMs: 1100,
    spriteUrl: '/assets/fighter/enemy_brawler_idle.png',
  },
  {
    name: 'CYBER BRUISER 🤖',
    type: 'MOLD',
    emoji: '🤖',
    maxHp: 75,
    rewardGarlic: 12,
    rewardGc: 50,
    rewardTeeth: 4,
    color: '#7e22ce',
    attackDamage: 10,
    attackInterval: 3000,
    dodgeWindowMs: 1000,
    spriteUrl: '/assets/fighter/enemy_brawler_idle.png',
  },
  {
    name: 'IRON FIGHTER 🛡️',
    type: 'TANK',
    emoji: '🛡️',
    maxHp: 120,
    rewardGarlic: 18,
    rewardGc: 80,
    rewardTeeth: 6,
    color: '#eab308',
    attackDamage: 15,
    attackInterval: 2500,
    dodgeWindowMs: 900,
    spriteUrl: '/assets/fighter/enemy_brawler_idle.png',
  },
  {
    name: 'DEMON KING BOSS 💀',
    type: 'BOSS',
    emoji: '💀',
    maxHp: 250,
    rewardGarlic: 35,
    rewardGc: 180,
    rewardTeeth: 15,
    color: '#dc2626',
    attackDamage: 22,
    attackInterval: 2000,
    dodgeWindowMs: 750,
    isBoss: true,
    spriteUrl: '/assets/fighter/enemy_brawler_idle.png',
  },
];

export const PLAYER_MAX_HP = 100;

export class CombatEngine {
  /**
   * Spawn enemy tailored to evolution rank order.
   * Enemy stats scale with stageOrder.
   */
  static spawnEnemyForRank(stageOrder: number): CombatEnemy {
    let index = 0;
    if (stageOrder >= 10) index = 4; // Boss
    else if (stageOrder >= 7) index = 3; // Tank
    else if (stageOrder >= 5) index = 2; // Mold
    else if (stageOrder >= 3) index = 1; // Worm
    else index = 0; // Bug

    const base = ENEMY_CATALOG[index];
    const hpScale = 1 + (stageOrder - 1) * 0.35;
    const dmgScale = 1 + (stageOrder - 1) * 0.25;
    const maxHp = Math.round(base.maxHp * hpScale);

    return {
      ...base,
      id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      maxHp,
      currentHp: maxHp,
      rewardGarlic: Math.round(base.rewardGarlic * (1 + stageOrder * 0.2)),
      attackDamage: Math.round(base.attackDamage * dmgScale),
    };
  }

  /**
   * Detect matching combo from attack sequence (looks at last 3 inputs).
   * Returns null and resets if more than 3 inputs without match.
   */
  static detectCombo(sequence: CombatAttackType[]): ComboDefinition | null {
    if (sequence.length < 3) return null;
    const last3 = sequence.slice(-3);

    for (const combo of COMBOS_CATALOG) {
      if (
        combo.sequence[0] === last3[0] &&
        combo.sequence[1] === last3[1] &&
        combo.sequence[2] === last3[2]
      ) {
        return combo;
      }
    }
    return null;
  }

  /**
   * Calculate hit damage based on attack type, player power, active combo, crits, skin bonus, and tap style.
   */
  static calculateHitDamage(
    attackType: CombatAttackType,
    powerPerTap: number,
    combo?: ComboDefinition | null,
    isCritical: boolean = false,
    skinBonus?: { punchMult: number; kickMult: number; specialMult: number },
    tapStyleComboMult: number = 1.0
  ): number {
    let base = powerPerTap;

    if (attackType === 'PUNCH') {
      base *= 1.2 * (skinBonus?.punchMult ?? 1.0);
    } else if (attackType === 'KICK') {
      base *= 1.5 * (skinBonus?.kickMult ?? 1.0);
    } else if (attackType === 'SPECIAL') {
      base *= 3.5 * (skinBonus?.specialMult ?? 1.0);
    }

    if (combo) {
      // combo base multiplier amplified by equipped tap style's combo power
      base *= combo.damageMultiplier * tapStyleComboMult;
    }

    if (isCritical) {
      base *= 2.0;
    }

    return Math.max(1, Math.round(base));
  }

  /**
   * Calculate special meter gain per attack, applying skin bonus.
   */
  static getSkinSpecialMeterGain(
    attackType: CombatAttackType,
    skinSpecialMeterBonus: number,
    comboBonus: number
  ): number {
    const base = comboBonus > 0
      ? comboBonus
      : attackType === 'PUNCH' ? 8
      : attackType === 'KICK' ? 12
      : 0;
    return Math.min(base + skinSpecialMeterBonus, 25); // cap per hit
  }

  /**
   * Calculate player damage taken from enemy attack.
   * Perfect dodge = 0 damage; regular dodge = 50% reduction.
   */
  static calculateEnemyDamage(
    enemy: CombatEnemy,
    isPerfectDodge: boolean,
    isDodging: boolean
  ): number {
    if (isPerfectDodge) return 0;
    if (isDodging) return Math.round(enemy.attackDamage * 0.5);
    return enemy.attackDamage;
  }

  /**
   * Detect circular swipe gesture from an array of touch/mouse points.
   * Returns true if the path forms a rough circle (enough angular coverage).
   */
  static detectCircleGesture(points: { x: number; y: number }[]): boolean {
    if (points.length < 12) return false;

    const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
    const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

    let totalAngle = 0;
    let prevAngle = Math.atan2(points[0].y - cy, points[0].x - cx);

    for (let i = 1; i < points.length; i++) {
      const angle = Math.atan2(points[i].y - cy, points[i].x - cx);
      let delta = angle - prevAngle;
      // Normalize delta to [-π, π]
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      totalAngle += delta;
      prevAngle = angle;
    }

    // Full circle = 2π ≈ 6.28 rad; we require at least 270° = 4.7 rad
    return Math.abs(totalAngle) >= 4.7;
  }

  /**
   * Spawn a boss-wave enemy (every 5 wins). Always returns BOSS type with
   * escalating HP and rewards based on the wave number.
   */
  static spawnBossWave(waveNumber: number, stageOrder: number): CombatEnemy {
    const BOSS_ROSTER = [
      { name: 'REY MOSCA 👀', emoji: '👀', color: '#ef4444' },
      { name: 'GRAN ORUGA ☠️', emoji: '☠️', color: '#7e22ce' },
      { name: 'HONGO ANCESTRAL 🌲', emoji: '🌲', color: '#065f46' },
      { name: 'AVISPA REY ⚡', emoji: '⚡', color: '#ca8a04' },
      { name: 'ULTIMO JEFE 🐉', emoji: '🐉', color: '#dc2626' },
    ];
    const roster = BOSS_ROSTER[(waveNumber - 1) % BOSS_ROSTER.length];
    const scale = 1 + (waveNumber - 1) * 0.5 + (stageOrder - 1) * 0.3;
    const maxHp = Math.round(400 * scale);

    return {
      id: `boss_wave${waveNumber}_${Date.now()}`,
      name: roster.name,
      type: 'BOSS',
      emoji: roster.emoji,
      maxHp,
      currentHp: maxHp,
      rewardGarlic: Math.round(80 * scale),
      rewardGc: Math.round(400 * scale),
      rewardTeeth: Math.round(25 * (1 + (waveNumber - 1) * 0.3)),
      color: roster.color,
      attackDamage: Math.round(28 * scale),
      attackInterval: Math.max(1200, 2800 - waveNumber * 150),
      dodgeWindowMs: Math.max(500, 900 - waveNumber * 50),
    };
  }
}
