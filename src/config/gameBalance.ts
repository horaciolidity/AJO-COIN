import { EvolutionStage, EvolutionStageId, Skin, TapStyle } from '../types';

// ── Skin Level System (1–50) ─────────────────────────────────────────────────
// Skin level is based on XP gained and taps completed while that skin is equipped.
// For simplicity we derive it from total XP + taps so every skin progresses together.
export function getSkinLevel(totalXp: number, totalTaps: number): number {
  const score = totalXp * 0.6 + totalTaps * 0.4;
  // Thresholds: Lv1=0, Lv2=200, Lv5=1000, Lv10=3000, Lv20=8000, Lv30=18000, Lv40=35000, Lv50=60000
  const thresholds = [0,200,400,650,1000,1400,1900,2500,3200,4000,5000,6200,7600,9200,11000,
    13000,15300,17900,20800,24000,27500,31300,35400,39800,44500,49500,55000,60000];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (score >= thresholds[i]) level = i + 1;
    else break;
  }
  return Math.min(50, Math.max(1, level));
}

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    id: 'COMMON_SMALL',
    name: 'Ajo Común Pequeño',
    rank: 'COMMON',
    size: 'SMALL',
    order: 1,
    requiredXp: 0,
    requiredTaps: 0,
    requiredRawGarlic: 0,
    requiredQuests: 0,
    description: 'Un pequeño diente de ajo humilde que recién empieza su viaje.',
    celebrationMessage: '¡Bienvenido al mundo de AJO! Tu pequeño diente de ajo está listo para cosechar.',
    auraColor: 'rgba(16, 185, 129, 0.15)',
    themeGradient: 'from-emerald-500 to-green-600',
    badgeIcon: '🧄',
    garlicBodyStartColor: '#FFFFFF',
    garlicBodyEndColor: '#E2D7C2',
    strokeColor: '#D6C5A8',
  },
  {
    id: 'COMMON_BIG',
    name: 'Ajo Común Grande',
    rank: 'COMMON',
    size: 'BIG',
    order: 2,
    requiredXp: 200,
    requiredTaps: 150,
    requiredRawGarlic: 5,
    requiredQuests: 1,
    description: 'Ha comido buena tierra y ahora es un ajo robusto y saludable.',
    celebrationMessage: '¡EL AJO HA CRECIDO! Ha doblado su volumen y fortaleza.',
    auraColor: 'rgba(16, 185, 129, 0.35)',
    themeGradient: 'from-emerald-400 to-teal-600',
    badgeIcon: '🌿',
    garlicBodyStartColor: '#FFFFFF',
    garlicBodyEndColor: '#D3C4A5',
    strokeColor: '#C4B18E',
  },
  {
    id: 'BRONZE_SMALL',
    name: 'Ajo de Bronce Pequeño',
    rank: 'BRONZE',
    size: 'SMALL',
    order: 3,
    requiredXp: 600,
    requiredTaps: 500,
    requiredRawGarlic: 15,
    requiredQuests: 2,
    requiredSkinId: 'NINJA',
    requiredSkinLevel: 3,
    description: 'Sus capas exteriores han adquirido una pátina metálica de bronce brillante.',
    celebrationMessage: '¡TU AJO HA DESCUBIERTO EL PODER DEL BRONCE! Ahora brilla como una medalla de bronce.',
    auraColor: 'rgba(217, 119, 6, 0.35)',
    themeGradient: 'from-amber-600 to-orange-700',
    badgeIcon: '🥉',
    garlicBodyStartColor: '#FDE68A',
    garlicBodyEndColor: '#B45309',
    strokeColor: '#92400E',
  },
  {
    id: 'BRONZE_BIG',
    name: 'Ajo de Bronce Grande',
    rank: 'BRONZE',
    size: 'BIG',
    order: 4,
    requiredXp: 1200,
    requiredTaps: 1200,
    requiredRawGarlic: 30,
    requiredQuests: 3,
    description: 'Un imponente bloque de bronce resistente a cualquier cocinero.',
    celebrationMessage: '¡ESTO YA NO ES UN AJO COMÚN! El Ajo de Bronce Grande domina el cultivo.',
    auraColor: 'rgba(245, 158, 11, 0.45)',
    themeGradient: 'from-amber-500 to-yellow-600',
    badgeIcon: '🥉✨',
    garlicBodyStartColor: '#FEF08A',
    garlicBodyEndColor: '#D97706',
    strokeColor: '#B45309',
  },
  {
    id: 'SILVER_SMALL',
    name: 'Ajo de Plata Pequeño',
    rank: 'SILVER',
    size: 'SMALL',
    order: 5,
    requiredXp: 2500,
    requiredTaps: 2500,
    requiredRawGarlic: 50,
    requiredQuests: 4,
    description: 'Refleja la luz de la luna con su deslumbrante armadura de plata pura.',
    celebrationMessage: '¡EL AJO HA ALCANZADO LA ETAPA DE PLATA! Su aroma es legendario.',
    auraColor: 'rgba(148, 163, 184, 0.45)',
    themeGradient: 'from-slate-300 to-slate-500',
    badgeIcon: '🥈',
    garlicBodyStartColor: '#F8FAFC',
    garlicBodyEndColor: '#94A3B8',
    strokeColor: '#64748B',
  },
  {
    id: 'SILVER_BIG',
    name: 'Ajo de Plata Grande',
    rank: 'SILVER',
    size: 'BIG',
    order: 6,
    requiredXp: 5000,
    requiredTaps: 5000,
    requiredRawGarlic: 75,
    requiredQuests: 5,
    description: 'Una masa plateada formidable capaz de repeler a los vampiros más antiguos.',
    celebrationMessage: '¡PLATA PURA EN SU MÁXIMO ESPLENDOR! Tu ajo inspira respeto absoluto.',
    auraColor: 'rgba(203, 213, 225, 0.55)',
    themeGradient: 'from-slate-200 to-blue-400',
    badgeIcon: '🥈✨',
    garlicBodyStartColor: '#FFFFFF',
    garlicBodyEndColor: '#CBD5E1',
    strokeColor: '#475569',
  },
  {
    id: 'GOLD_SMALL',
    name: 'Ajo de Oro Pequeño',
    rank: 'GOLD',
    size: 'SMALL',
    order: 7,
    requiredXp: 10000,
    requiredTaps: 10000,
    requiredRawGarlic: 120,
    requiredQuests: 6,
    description: 'Fundido en oro macizo de 24 quilates, resplandece en cualquier cocina.',
    celebrationMessage: '¡ÉPICO! ¡TU AJO AHORA ES DE ORO! Los reyes sueñan con esta cosecha.',
    auraColor: 'rgba(234, 179, 8, 0.55)',
    themeGradient: 'from-yellow-400 to-amber-500',
    badgeIcon: '🥇',
    garlicBodyStartColor: '#FEF08A',
    garlicBodyEndColor: '#EAB308',
    strokeColor: '#CA8A04',
  },
  {
    id: 'GOLD_BIG',
    name: 'Ajo de Oro Grande',
    rank: 'GOLD',
    size: 'BIG',
    order: 8,
    requiredXp: 20000,
    requiredTaps: 20000,
    requiredRawGarlic: 180,
    requiredQuests: 7,
    description: 'Un monumento de oro colosal que eclipsa al sol con su brillo deslumbrante.',
    celebrationMessage: '¡ORO COLOSAL! El Ajo de Oro Grande es una leyenda de la agricultura.',
    auraColor: 'rgba(250, 204, 21, 0.65)',
    themeGradient: 'from-yellow-300 to-amber-600',
    badgeIcon: '🥇👑',
    garlicBodyStartColor: '#FEF9C3',
    garlicBodyEndColor: '#D97706',
    strokeColor: '#A16207',
  },
  {
    id: 'PLATINUM_SMALL',
    name: 'Ajo de Platino Pequeño',
    rank: 'PLATINUM',
    size: 'SMALL',
    order: 9,
    requiredXp: 40000,
    requiredTaps: 40000,
    requiredRawGarlic: 250,
    requiredQuests: 8,
    description: 'Compuesto por elementos rarísimos de las profundidades estelares.',
    celebrationMessage: '¡PLATINO DESBLOQUEADO! Has trascendido el metal común.',
    auraColor: 'rgba(168, 85, 247, 0.55)',
    themeGradient: 'from-purple-400 to-indigo-600',
    badgeIcon: '💎',
    garlicBodyStartColor: '#F3E8FF',
    garlicBodyEndColor: '#C084FC',
    strokeColor: '#7E22CE',
  },
  {
    id: 'PLATINUM_BIG',
    name: 'Ajo de Platino Grande',
    rank: 'PLATINUM',
    size: 'BIG',
    order: 10,
    requiredXp: 75000,
    requiredTaps: 75000,
    requiredRawGarlic: 350,
    requiredQuests: 9,
    description: 'Un titan de platino cósmico que altera la gravedad a su alrededor.',
    celebrationMessage: '¡TITÁN DE PLATINO! Tu Ajo genera su propio campo gravitatorio.',
    auraColor: 'rgba(192, 132, 252, 0.7)',
    themeGradient: 'from-purple-300 to-pink-600',
    badgeIcon: '💎⚡',
    garlicBodyStartColor: '#FAF5FF',
    garlicBodyEndColor: '#A855F7',
    strokeColor: '#6B21A8',
  },
  {
    id: 'DIAMOND_SMALL',
    name: 'Ajo de Diamante Pequeño',
    rank: 'DIAMOND',
    size: 'SMALL',
    order: 11,
    requiredXp: 150000,
    requiredTaps: 150000,
    requiredRawGarlic: 500,
    requiredQuests: 10,
    description: 'Cristalizado bajo presión extrema en el núcleo de la galaxia del Ajo.',
    celebrationMessage: '¡DIAMANTE PURO! Tu Ajo refracta destellos celestiales.',
    auraColor: 'rgba(56, 189, 248, 0.65)',
    themeGradient: 'from-cyan-400 to-blue-600',
    badgeIcon: '💎✨',
    garlicBodyStartColor: '#E0F2FE',
    garlicBodyEndColor: '#38BDF8',
    strokeColor: '#0284C7',
  },
  {
    id: 'DIAMOND_BIG',
    name: 'Ajo Diamante Supremo',
    rank: 'DIAMOND',
    size: 'BIG',
    order: 12,
    requiredXp: 300000,
    requiredTaps: 300000,
    requiredRawGarlic: 750,
    requiredQuests: 12,
    description: 'La forma máxima del universo AJO. Indestructible, divino e inmortal.',
    celebrationMessage: '¡DIAMANTE SUPREMO ALCANZADO! Has conquistado el universo AJO COIN.',
    auraColor: 'rgba(14, 165, 233, 0.85)',
    themeGradient: 'from-cyan-300 via-sky-400 to-indigo-600',
    badgeIcon: '👑💎🔥',
    garlicBodyStartColor: '#F0F9FF',
    garlicBodyEndColor: '#0EA5E9',
    strokeColor: '#0369A1',
  },
];

export const SKINS_CATALOG: Skin[] = [
  {
    id: 'DEFAULT',
    name: 'Ajo Natural',
    description: 'El clásico ajo sin accesorios. Humilde, fresco y oloroso.',
    priceGarlicTeeth: 0,
    icon: '🧄',
    tag: 'Básico',
    headgearEmoji: '',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
  },
  {
    id: 'NINJA',
    name: 'Ninja Ajo',
    description: 'Silencioso pero letal. Ataca desde las sombras de la ensalada.',
    priceGarlicTeeth: 15,
    icon: '🥷',
    tag: 'Sigilo',
    headgearEmoji: '🥷',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #18181B, #3730A3)',
  },
  {
    id: 'KING',
    name: 'King Ajo',
    description: 'Lleva una corona dorada de soberano de la cocina.',
    priceGarlicTeeth: 30,
    icon: '👑',
    tag: 'Realeza',
    headgearEmoji: '👑',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #92400E, #F59E0B)',
  },
  {
    id: 'ROBOT',
    name: 'Robot Ajo',
    description: 'Mejorado cibernéticamente con circuitos de silicio y ajo.',
    priceGarlicTeeth: 50,
    icon: '🤖',
    tag: 'Futurista',
    headgearEmoji: '🤖',
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #0F172A, #0891B2)',
  },
  {
    id: 'FIRE',
    name: 'Fire Ajo',
    description: 'Envuelto en llamas ardientes. ¡Demasiado picante!',
    priceGarlicTeeth: 75,
    icon: '🔥',
    tag: 'Picante',
    headgearEmoji: '🔥',
    color: '#F97316',
    gradient: 'linear-gradient(135deg, #7F1D1D, #F97316)',
  },
  {
    id: 'ALIEN',
    name: 'Alien Ajo',
    description: 'Llegado en un OVNI desde la nebulosa Allium.',
    priceGarlicTeeth: 100,
    icon: '👽',
    tag: 'Cósmico',
    headgearEmoji: '👽',
    color: '#22C55E',
    gradient: 'linear-gradient(135deg, #052e16, #16a34a)',
  },
  {
    id: 'DEAD',
    name: 'Dead / Zombie Ajo',
    description: 'Ha vuelto de la compostera con hambre de victorias.',
    priceGarlicTeeth: 150,
    icon: '💀',
    tag: 'Zombi',
    headgearEmoji: '💀',
    color: '#A1A1AA',
    gradient: 'linear-gradient(135deg, #18181B, #52525B)',
  },
  {
    id: 'RICH',
    name: 'Rich / Top Hat Ajo',
    description: 'Lleva sombrero de copa y monóculo. Cultivador millonario.',
    priceGarlicTeeth: 250,
    icon: '🎩',
    tag: 'Lujo',
    headgearEmoji: '🎩',
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #3B0764, #A855F7)',
  },
];

export const TAP_STYLES_CATALOG: TapStyle[] = [
  {
    id: 'NORMAL',
    name: 'Puño Normal',
    description: 'El golpe clásico del ajo. Simple pero efectivo.',
    priceGarlicTeeth: 0,
    color: '#34D399',
    glowColor: 'rgba(52, 211, 153, 0.5)',
    particleEmoji: '💪',
    criticalMultiplier: 1.5,
    criticalChance: 0.05,
    comboMultiplier: 1.0,
    chargeMultiplier: 2.0,
    soundEffect: 'tap',
    unlockRank: 'COMMON',
  },
  {
    id: 'FIRE_PUNCH',
    name: 'Puño de Fuego 🔥',
    description: '¡Golpe ardiente! Quema con cada impacto. Críticos frecuentes.',
    priceGarlicTeeth: 80,
    color: '#F97316',
    glowColor: 'rgba(249, 115, 22, 0.7)',
    particleEmoji: '🔥',
    criticalMultiplier: 2.0,
    criticalChance: 0.15,
    comboMultiplier: 1.3,
    chargeMultiplier: 3.0,
    soundEffect: 'fire',
    unlockRank: 'BRONZE',
  },
  {
    id: 'ICE_STRIKE',
    name: 'Golpe de Hielo ❄️',
    description: 'Congela al objetivo. Slow mo con daño acumulado.',
    priceGarlicTeeth: 100,
    color: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.7)',
    particleEmoji: '❄️',
    criticalMultiplier: 2.5,
    criticalChance: 0.12,
    comboMultiplier: 1.5,
    chargeMultiplier: 3.5,
    soundEffect: 'ice',
    unlockRank: 'BRONZE',
  },
  {
    id: 'THUNDER',
    name: 'Rayo del Ajo ⚡',
    description: 'Impacto eléctrico que encadena combos infinitos.',
    priceGarlicTeeth: 150,
    color: '#FDE047',
    glowColor: 'rgba(253, 224, 71, 0.8)',
    particleEmoji: '⚡',
    criticalMultiplier: 2.0,
    criticalChance: 0.20,
    comboMultiplier: 2.0,
    chargeMultiplier: 3.0,
    soundEffect: 'thunder',
    unlockRank: 'SILVER',
  },
  {
    id: 'SHADOW',
    name: 'Golpe Sombra 🌑',
    description: 'Ataque oscuro que multiplica el daño en silencio.',
    priceGarlicTeeth: 200,
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.7)',
    particleEmoji: '🌑',
    criticalMultiplier: 3.0,
    criticalChance: 0.18,
    comboMultiplier: 1.8,
    chargeMultiplier: 4.0,
    soundEffect: 'shadow',
    unlockRank: 'SILVER',
  },
  {
    id: 'KAME_HAME',
    name: 'KAME HAME AJO! ✨',
    description: '¡El ataque definitivo! Carga por 1.5s y libera poder devastador.',
    priceGarlicTeeth: 350,
    color: '#60A5FA',
    glowColor: 'rgba(96, 165, 250, 0.9)',
    particleEmoji: '✨',
    criticalMultiplier: 5.0,
    criticalChance: 0.30,
    comboMultiplier: 2.5,
    chargeMultiplier: 8.0,
    soundEffect: 'kame',
    unlockRank: 'GOLD',
  },
  {
    id: 'COSMIC',
    name: 'Impacto Cósmico 🌌',
    description: 'Fuerza del universo concentrada en el ajo. Daño galáctico.',
    priceGarlicTeeth: 500,
    color: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.9)',
    particleEmoji: '🌌',
    criticalMultiplier: 4.0,
    criticalChance: 0.25,
    comboMultiplier: 3.0,
    chargeMultiplier: 6.0,
    soundEffect: 'cosmic',
    unlockRank: 'PLATINUM',
  },
  {
    id: 'DRAGON',
    name: 'Garra del Dragón Ajo 🐉',
    description: '¡El poder del dragón ancestral! Solo los más poderosos lo dominan.',
    priceGarlicTeeth: 800,
    color: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.95)',
    particleEmoji: '🐉',
    criticalMultiplier: 6.0,
    criticalChance: 0.35,
    comboMultiplier: 3.5,
    chargeMultiplier: 10.0,
    soundEffect: 'dragon',
    unlockRank: 'DIAMOND',
  },
];

// Helper functions for evolution logic
export function getStageById(stageId: EvolutionStageId): EvolutionStage {
  const found = EVOLUTION_STAGES.find((s) => s.id === stageId);
  return found || EVOLUTION_STAGES[0];
}

export function getNextStage(currentStageId: EvolutionStageId): EvolutionStage | null {
  const currentIndex = EVOLUTION_STAGES.findIndex((s) => s.id === currentStageId);
  if (currentIndex === -1 || currentIndex >= EVOLUTION_STAGES.length - 1) {
    return null;
  }
  return EVOLUTION_STAGES[currentIndex + 1];
}

export function calculateTotalCompletedQuests(quests: { isCompleted?: boolean; isClaimed?: boolean; progress?: number; targetValue?: number }[]): number {
  const permCompleted = (quests || []).filter(
    (q) => q.isCompleted || q.isClaimed || ((q.targetValue || 0) > 0 && (q.progress || 0) >= (q.targetValue || 0))
  ).length;

  let dailyCompleted = 0;
  try {
    const rawDaily = typeof localStorage !== 'undefined' ? localStorage.getItem('ajo_daily_missions_claimed_v2') : null;
    if (rawDaily) {
      const parsed = JSON.parse(rawDaily);
      dailyCompleted = Object.values(parsed).filter(Boolean).length;
    }
  } catch (_) {}

  let socialCompleted = 0;
  try {
    const rawSocial = typeof localStorage !== 'undefined' ? localStorage.getItem('ajo_social_tasks_claimed_v1') : null;
    if (rawSocial) {
      const parsed = JSON.parse(rawSocial);
      socialCompleted = Object.values(parsed).filter(Boolean).length;
    }
  } catch (_) {}

  return permCompleted + dailyCompleted + socialCompleted;
}

export function checkEvolutionRequirements(
  currentStageId: EvolutionStageId,
  userStats: { xp: number; totalTaps: number; completedQuestsCount: number },
  userRawGarlic: number,
  unlockedSkins?: string[],
  skinLevel?: number,
): { canEvolve: boolean; nextStage: EvolutionStage | null; missing: string[] } {
  const nextStage = getNextStage(currentStageId);
  if (!nextStage) {
    return { canEvolve: false, nextStage: null, missing: ['Etapa Máxima Alcanzada'] };
  }

  const missing: string[] = [];

  if (userStats.xp < nextStage.requiredXp) {
    missing.push(`Faltan ${nextStage.requiredXp - userStats.xp} XP`);
  }
  if (userStats.totalTaps < nextStage.requiredTaps) {
    missing.push(`Faltan ${nextStage.requiredTaps - userStats.totalTaps} TAPs`);
  }
  if (userRawGarlic < nextStage.requiredRawGarlic) {
    missing.push(`Faltan ${nextStage.requiredRawGarlic - userRawGarlic} Ajos Crudos`);
  }
  if (userStats.completedQuestsCount < nextStage.requiredQuests) {
    missing.push(`Faltan ${nextStage.requiredQuests - userStats.completedQuestsCount} Misiones`);
  }
  // Skin level requirement
  if (nextStage.requiredSkinId && nextStage.requiredSkinLevel) {
    const hasSkin = (unlockedSkins || []).includes(nextStage.requiredSkinId);
    if (!hasSkin) {
      missing.push(`Requiere skin ${nextStage.requiredSkinId} (comprar primero)`);
    } else if ((skinLevel || 1) < nextStage.requiredSkinLevel) {
      missing.push(`Requiere Skin Nivel ${nextStage.requiredSkinLevel} (actual: ${skinLevel || 1})`);
    }
  }

  return {
    canEvolve: missing.length === 0,
    nextStage,
    missing,
  };
}

export interface HitPowerTier {
  level: number;
  bonusPower: number;
  costTeeth: number;
  label: string;
}

export const HIT_POWER_TIERS: HitPowerTier[] = [
  { level: 1, bonusPower: 1.5, costTeeth: 90, label: '+1.5 Poder de Golpe' },
  { level: 2, bonusPower: 2.0, costTeeth: 120, label: '+2.0 Poder de Golpe' },
  { level: 3, bonusPower: 2.5, costTeeth: 200, label: '+2.5 Poder de Golpe' },
  { level: 4, bonusPower: 3.5, costTeeth: 400, label: '+3.5 Poder de Golpe' },
  { level: 5, bonusPower: 5.5, costTeeth: 750, label: '+5.5 Poder de Golpe' },
  { level: 6, bonusPower: 6.0, costTeeth: 1200, label: '+6.0 Poder de Golpe' },
  { level: 7, bonusPower: 7.5, costTeeth: 1800, label: '+7.5 Poder de Golpe (MÁXIMO)' },
];

