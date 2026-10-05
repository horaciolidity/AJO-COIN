import {
  GameStatsState,
  InventoryState,
  GarlicBoxItem,
  UpgradeItem,
  QuestItem,
  AchievementItem,
  SkinId,
  GarlicTeethTransaction,
} from '../types';

export interface SavedGameState {
  stats: GameStatsState;
  inventory: InventoryState;
  boxes: GarlicBoxItem[];
  upgrades: UpgradeItem[];
  quests: QuestItem[];
  achievements: AchievementItem[];
  version: number;
}

const STORAGE_KEY = 'AJO_GAME_SAVE_V3';
const CURRENT_VERSION = 3;

const INITIAL_DEFAULT_STATE: SavedGameState = {
  version: CURRENT_VERSION,
  stats: {
    level: 1,
    xp: 0,
    energy: 1000,
    maxEnergy: 1000,
    energyRegenSeconds: 3,
    tapsPerGarlic: 100,
    currentGarlicTaps: 0,
    totalTaps: 0,
    totalGarlicHarvested: 0,
    totalBoxesCompleted: 0,
    totalAjoEarned: 0.0,
    powerPerTap: 1,
    garlicMultiplier: 1,
    currentStageId: 'COMMON_SMALL',
    competitionPoints: 0,
    seasonPoints: 0,
  },
  inventory: {
    rawGarlic: 15,
    gcBalance: 500,
    ajoBalance: 0,
    garlicTeeth: 15,
    equippedSkin: 'DEFAULT',
    unlockedSkins: ['DEFAULT'],
    equippedTapStyle: 'NORMAL',
    unlockedTapStyles: ['NORMAL'],
    teethTransactions: [
      {
        id: 'tx_init',
        amount: 15,
        type: 'EARN',
        reason: 'WELCOME_BONUS',
        timestamp: Date.now(),
      },
    ],
  },
  boxes: [
    {
      id: 'box_init_1',
      boxType: 'BASIC',
      capacity: 100,
      currentCount: 15,
      isFull: false,
      claimedAjo: false,
    },
  ],
  upgrades: [
    {
      id: 'up_1',
      code: 'STRONGER_FINGERS',
      name: 'STRONGER FINGERS',
      description: '+1 garlic tap power per tap',
      currentLevel: 0,
      maxLevel: 50,
      nextCost: 200,
      effectText: '+1 garlic tap power',
    },
    {
      id: 'up_2',
      code: 'BIGGER_HANDS',
      name: 'BIGGER HANDS',
      description: '+25 max energy capacity',
      currentLevel: 0,
      maxLevel: 50,
      nextCost: 300,
      effectText: '+25 max energy',
    },
    {
      id: 'up_3',
      code: 'FAST_REGEN',
      name: 'FAST REGEN',
      description: 'Energy regenerates faster (+1 / 2.5s)',
      currentLevel: 0,
      maxLevel: 20,
      nextCost: 500,
      effectText: '+1 energy every 2.5s',
    },
    {
      id: 'up_4',
      code: 'GARLIC_MULTIPLIER',
      name: 'GARLIC MULTIPLIER',
      description: 'Chance to produce bonus garlic',
      currentLevel: 0,
      maxLevel: 25,
      nextCost: 1000,
      effectText: '5% chance for 2x Garlic',
    },
    {
      id: 'up_5',
      code: 'BIGGER_BOXES',
      name: 'BIGGER BOXES',
      description: 'Increase box storage capacity',
      currentLevel: 0,
      maxLevel: 10,
      nextCost: 2500,
      effectText: '+10% storage capacity',
    },
    {
      id: 'up_6',
      code: 'ENERGY_TANK',
      name: 'ENERGY TANK',
      description: '+100 max energy per level',
      currentLevel: 0,
      maxLevel: 20,
      nextCost: 800,
      effectText: '+100 max energy',
    },
    {
      id: 'up_7',
      code: 'CRITICAL_BOOST',
      name: 'CRITICAL BOOST',
      description: '+5% critical tap chance per level',
      currentLevel: 0,
      maxLevel: 10,
      nextCost: 1500,
      effectText: '+5% crit chance',
    },
  ],
  quests: [
    // ── EASY ─────────────────────────────────────────────────────────────────
    {
      id: 'q_1', code: 'TAP_10', title: 'PRIMEROS PASOS DEL AJO',
      description: 'Toca el ajo 10 veces para ganar XP y Dientes',
      rewardGc: 100, rewardAjo: 0, rewardGarlicTeeth: 10, rewardXp: 50,
      difficulty: 'EASY', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 10, isCompleted: false, isClaimed: false, questType: 'TAPS',
    },
    {
      id: 'q_2', code: 'HARVEST_5', title: 'COSECHA INICIAL',
      description: 'Cosecha 5 unidades de ajo crudo',
      rewardGc: 300, rewardAjo: 0, rewardGarlicTeeth: 20, rewardXp: 100,
      difficulty: 'EASY', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 5, isCompleted: false, isClaimed: false, questType: 'HARVEST',
    },
    // ── NORMAL ───────────────────────────────────────────────────────────────
    {
      id: 'q_3', code: 'TAP_50', title: '50 TAPS ALCANZADOS',
      description: 'Toca el ajo 50 veces en total',
      rewardGc: 500, rewardAjo: 0, rewardGarlicTeeth: 25, rewardXp: 200,
      difficulty: 'NORMAL', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 50, isCompleted: false, isClaimed: false, questType: 'TAPS',
    },
    {
      id: 'q_4', code: 'FILL_1_BOX', title: 'PRIMERA CAJA LLENA',
      description: 'Reclama los AJO de tu primera caja completa',
      rewardGc: 1000, rewardAjo: 0, rewardGarlicTeeth: 50, rewardXp: 300,
      difficulty: 'NORMAL', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 1, isCompleted: false, isClaimed: false, questType: 'BOX',
    },
    {
      id: 'q_5', code: 'HARVEST_20', title: 'COSECHA MEDIA',
      description: 'Cosecha 20 unidades de ajo en total',
      rewardGc: 800, rewardAjo: 0, rewardGarlicTeeth: 40, rewardXp: 250,
      difficulty: 'NORMAL', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 20, isCompleted: false, isClaimed: false, questType: 'HARVEST',
    },
    // ── HARD ─────────────────────────────────────────────────────────────────
    {
      id: 'q_6', code: 'TAP_200', title: '200 TAPS — FUERZA BRUTA',
      description: 'Alcanza los 200 taps totales',
      rewardGc: 1500, rewardAjo: 0, rewardGarlicTeeth: 70, rewardXp: 500,
      difficulty: 'HARD', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 200, isCompleted: false, isClaimed: false, questType: 'TAPS',
    },
    {
      id: 'q_7', code: 'RHYTHM_MASTER', title: 'MAESTRO DEL RITMO',
      description: 'Alcanza un combo de 25 toques continuos sin parar',
      rewardGc: 2000, rewardAjo: 0, rewardGarlicTeeth: 80, rewardXp: 600,
      difficulty: 'HARD', mechanicType: 'RHYTHM',
      progress: 0, targetValue: 25, isCompleted: false, isClaimed: false, questType: 'TAPS',
    },
    {
      id: 'q_8', code: 'HARVEST_50', title: 'GRAN COSECHA',
      description: 'Cosecha 50 ajos en total',
      rewardGc: 2500, rewardAjo: 0, rewardGarlicTeeth: 100, rewardXp: 700,
      difficulty: 'HARD', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 50, isCompleted: false, isClaimed: false, questType: 'HARVEST',
    },
    {
      id: 'q_9', code: 'FILL_3_BOXES', title: 'TRIPLE CAJAS',
      description: 'Reclama los AJO de 3 cajas completas',
      rewardGc: 3000, rewardAjo: 0, rewardGarlicTeeth: 120, rewardXp: 800,
      difficulty: 'HARD', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 3, isCompleted: false, isClaimed: false, questType: 'BOX',
    },
    // ── HELL ─────────────────────────────────────────────────────────────────
    {
      id: 'q_10', code: 'TAP_500', title: '500 TAPS — LEYENDA',
      description: '¡Alcanza los 500 taps totales!',
      rewardGc: 5000, rewardAjo: 0, rewardGarlicTeeth: 200, rewardXp: 1500,
      difficulty: 'HELL', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 500, isCompleted: false, isClaimed: false, questType: 'TAPS',
    },
    {
      id: 'q_11', code: 'HELL_COMBO_50', title: 'MODO INFIERNO: COMBO x50',
      description: 'Mantén un combo de 50 taps seguidos ¡sin perder el ritmo!',
      rewardGc: 6000, rewardAjo: 0, rewardGarlicTeeth: 250, rewardXp: 2000,
      difficulty: 'HELL', mechanicType: 'RHYTHM',
      progress: 0, targetValue: 50, isCompleted: false, isClaimed: false, questType: 'TAPS',
    },
    {
      id: 'q_12', code: 'HARVEST_100', title: 'COSECHA CENTENARIA',
      description: 'Cosecha 100 ajos en total — ¡la marca del campeón!',
      rewardGc: 8000, rewardAjo: 0, rewardGarlicTeeth: 300, rewardXp: 2500,
      difficulty: 'HELL', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 100, isCompleted: false, isClaimed: false, questType: 'HARVEST',
    },
    {
      id: 'q_13', code: 'TAP_1000', title: 'MIL TAPS — DIOS DEL AJO',
      description: '1000 taps totales — has demostrado devoción total al ajo.',
      rewardGc: 10000, rewardAjo: 0, rewardGarlicTeeth: 400, rewardXp: 3000,
      difficulty: 'HELL', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 1000, isCompleted: false, isClaimed: false, questType: 'TAPS',
    },
    {
      id: 'q_14', code: 'FILL_5_BOXES', title: 'FÁBRICA DE AJOS',
      description: 'Reclama AJO de 5 cajas completas consecutivas',
      rewardGc: 12000, rewardAjo: 0, rewardGarlicTeeth: 500, rewardXp: 3500,
      difficulty: 'HELL', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 5, isCompleted: false, isClaimed: false, questType: 'BOX',
    },
    {
      id: 'q_15', code: 'TAP_2000', title: 'EL LEGENDARIO — 2000 TAPS',
      description: 'Alcanza los 2000 taps totales y conviértete en leyenda del ajo.',
      rewardGc: 20000, rewardAjo: 0, rewardGarlicTeeth: 700, rewardXp: 5000,
      difficulty: 'HELL', mechanicType: 'TAP_SIMPLE',
      progress: 0, targetValue: 2000, isCompleted: false, isClaimed: false, questType: 'TAPS',
    },
  ],

  achievements: [
    { id: 'a1', code: 'FIRST_GARLIC', name: 'Primer Ajo', description: 'Cosechaste tu primer ajo crudo', icon: '🧄', unlocked: false },
    { id: 'a2', code: 'FIRST_EVOLUTION', name: 'Primera Evolución', description: 'Evolucionaste tu ajo por primera vez', icon: '🌟', unlocked: false },
    { id: 'a3', code: 'FIRST_SKIN', name: 'Estilo Único', description: 'Desbloqueaste tu primer aspecto o skin', icon: '🥷', unlocked: false },
    { id: 'a4', code: 'BRONZE_MASTERY', name: 'Maestro de Bronce', description: 'Alcanzaste la etapa Ajo de Bronce', icon: '🥉', unlocked: false },
    { id: 'a5', code: 'GOLDEN_LEGEND', name: 'Leyenda Dorada', description: 'Alcanzaste la etapa Ajo de Oro', icon: '🥇', unlocked: false },
  ],
};

export class StorageAdapter {
  static loadState(): SavedGameState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL_DEFAULT_STATE;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return INITIAL_DEFAULT_STATE;
      }
      
      // Merge saved state with defaults to ensure all fields exist & preserve progress across versions
      const mergedState: SavedGameState = {
        version: CURRENT_VERSION,
        stats: {
          ...INITIAL_DEFAULT_STATE.stats,
          ...(parsed.stats || {}),
        },
        inventory: {
          ...INITIAL_DEFAULT_STATE.inventory,
          ...(parsed.inventory || {}),
          unlockedSkins: Array.isArray(parsed.inventory?.unlockedSkins)
            ? parsed.inventory.unlockedSkins
            : INITIAL_DEFAULT_STATE.inventory.unlockedSkins,
          unlockedTapStyles: Array.isArray(parsed.inventory?.unlockedTapStyles)
            ? parsed.inventory.unlockedTapStyles
            : INITIAL_DEFAULT_STATE.inventory.unlockedTapStyles,
        },
        boxes: Array.isArray(parsed.boxes)
          ? parsed.boxes.filter((b: any) => !b.claimedAjo)
          : INITIAL_DEFAULT_STATE.boxes,
        upgrades: Array.isArray(parsed.upgrades) && parsed.upgrades.length > 0 ? parsed.upgrades : INITIAL_DEFAULT_STATE.upgrades,
        // Merge quests: preserve progress on existing quests, append any new ones
        quests: (() => {
          const savedQuests = Array.isArray(parsed.quests) ? parsed.quests : [];
          const savedMap = new Map<string, any>(savedQuests.map((q: any) => [q.id, q]));
          return INITIAL_DEFAULT_STATE.quests.map((defaultQ) =>
            savedMap.has(defaultQ.id)
              ? { ...defaultQ, ...(savedMap.get(defaultQ.id) as object) }
              : defaultQ
          );
        })(),
        achievements: Array.isArray(parsed.achievements) && parsed.achievements.length > 0 ? parsed.achievements : INITIAL_DEFAULT_STATE.achievements,
      };

      return mergedState;
    } catch (e) {
      console.warn('Failed to load local game state, using default:', e);
      return INITIAL_DEFAULT_STATE;
    }
  }

  static saveState(state: SavedGameState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save local game state:', e);
    }
  }

  static resetState(): SavedGameState {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    return INITIAL_DEFAULT_STATE;
  }
}
