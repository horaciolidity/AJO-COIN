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

const STORAGE_KEY = 'AJO_GAME_SAVE_V2';
const CURRENT_VERSION = 2;

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
  ],
  quests: [
    {
      id: 'q_1',
      code: 'TAP_10',
      title: 'PRIMEROS PASOS DEL AJO',
      description: 'Toca el ajo gigante 10 veces para ganar XP y Dientes',
      rewardGc: 100,
      rewardAjo: 0,
      rewardGarlicTeeth: 10,
      rewardXp: 50,
      difficulty: 'EASY',
      mechanicType: 'TAP_SIMPLE',
      progress: 0,
      targetValue: 10,
      isCompleted: false,
      isClaimed: false,
      questType: 'TAPS',
    },
    {
      id: 'q_2',
      code: 'HARVEST_5',
      title: 'COSECHA INICIAL',
      description: 'Cosecha 5 unidades de ajo crudo',
      rewardGc: 300,
      rewardAjo: 0,
      rewardGarlicTeeth: 20,
      rewardXp: 100,
      difficulty: 'EASY',
      mechanicType: 'TAP_SIMPLE',
      progress: 0,
      targetValue: 5,
      isCompleted: false,
      isClaimed: false,
      questType: 'HARVEST',
    },
    {
      id: 'q_3',
      code: 'TEETH_COLLECTOR',
      title: 'COLECCIONISTA DE DIENTES',
      description: 'Acumula 50 Garlic Teeth en tu inventario',
      rewardGc: 500,
      rewardAjo: 0,
      rewardGarlicTeeth: 25,
      rewardXp: 200,
      difficulty: 'NORMAL',
      mechanicType: 'TAP_SIMPLE',
      progress: 0,
      targetValue: 50,
      isCompleted: false,
      isClaimed: false,
      questType: 'TAPS',
    },
    {
      id: 'q_4',
      code: 'FILL_1_BOX',
      title: 'LLENAR UNA CAJA',
      description: 'Llena por completo 1 caja de ajo',
      rewardGc: 1000,
      rewardAjo: 0,
      rewardGarlicTeeth: 50,
      rewardXp: 300,
      difficulty: 'NORMAL',
      mechanicType: 'TAP_SIMPLE',
      progress: 0,
      targetValue: 1,
      isCompleted: false,
      isClaimed: false,
      questType: 'BOX',
    },
    {
      id: 'q_5',
      code: 'RHYTHM_MASTER',
      title: 'DESAFÍO RÍTMICO',
      description: 'Alcanza un combo de 25 toques continuos',
      rewardGc: 2000,
      rewardAjo: 0,
      rewardGarlicTeeth: 80,
      rewardXp: 500,
      difficulty: 'HARD',
      mechanicType: 'RHYTHM',
      progress: 0,
      targetValue: 25,
      isCompleted: false,
      isClaimed: false,
      questType: 'TAPS',
    },
    {
      id: 'q_6',
      code: 'HELL_CHALLENGE',
      title: 'MODO INFIERNO: 100 TAPS EN RITMO',
      description: 'Mantiene el ritmo rápido durante 100 toques sin perder combo',
      rewardGc: 5000,
      rewardAjo: 0,
      rewardGarlicTeeth: 200,
      rewardXp: 1500,
      difficulty: 'HELL',
      mechanicType: 'SPEED',
      progress: 0,
      targetValue: 100,
      isCompleted: false,
      isClaimed: false,
      questType: 'TAPS',
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
      if (!parsed || parsed.version !== CURRENT_VERSION) {
        return INITIAL_DEFAULT_STATE;
      }
      return parsed as SavedGameState;
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
