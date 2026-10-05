import { SavedGameState } from './StorageAdapter';
import { EvolutionStageId, SkinId, GarlicTeethTransaction } from '../types';
import {
  EVOLUTION_STAGES,
  getStageById,
  checkEvolutionRequirements,
  getSkinLevel,
  SKINS_CATALOG,
} from '../config/gameBalance';

export class GameService {
  /**
   * Add Garlic Teeth with full transaction audit log
   */
  static addGarlicTeeth(
    state: SavedGameState,
    amount: number,
    reason: string
  ): SavedGameState {
    if (amount <= 0) return state;

    const newTx: GarlicTeethTransaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      amount,
      type: 'EARN',
      reason,
      timestamp: Date.now(),
    };

    return {
      ...state,
      inventory: {
        ...state.inventory,
        garlicTeeth: state.inventory.garlicTeeth + amount,
        teethTransactions: [newTx, ...(state.inventory.teethTransactions || [])].slice(0, 50),
      },
    };
  }

  /**
   * Spend Garlic Teeth securely with ledger log
   */
  static spendGarlicTeeth(
    state: SavedGameState,
    amount: number,
    reason: string
  ): { success: boolean; state: SavedGameState; error?: string } {
    if (amount <= 0) return { success: false, state, error: 'Monto inválido' };

    if (state.inventory.garlicTeeth < amount) {
      return {
        success: false,
        state,
        error: `Insuficientes Garlic Teeth (Requieres ${amount}, tienes ${state.inventory.garlicTeeth})`,
      };
    }

    const newTx: GarlicTeethTransaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      amount: -amount,
      type: 'SPEND',
      reason,
      timestamp: Date.now(),
    };

    const newState: SavedGameState = {
      ...state,
      inventory: {
        ...state.inventory,
        garlicTeeth: state.inventory.garlicTeeth - amount,
        teethTransactions: [newTx, ...(state.inventory.teethTransactions || [])].slice(0, 50),
      },
    };

    return { success: true, state: newState };
  }

  /**
   * Evolve stage if user meets all requirements
   */
  static attemptEvolution(state: SavedGameState): {
    success: boolean;
    state: SavedGameState;
    newStageId?: EvolutionStageId;
    missing?: string[];
  } {
    const currentStageId = state.stats.currentStageId || 'COMMON_SMALL';
    const completedQuestsCount = state.quests.filter((q) => q.isCompleted || q.isClaimed).length;
    const skinLevel = getSkinLevel(state.stats.xp, state.stats.totalTaps);

    const evalResult = checkEvolutionRequirements(
      currentStageId,
      {
        xp: state.stats.xp,
        totalTaps: state.stats.totalTaps,
        completedQuestsCount,
      },
      state.inventory.rawGarlic,
      state.inventory.unlockedSkins,
      skinLevel,
    );

    if (!evalResult.canEvolve || !evalResult.nextStage) {
      return {
        success: false,
        state,
        missing: evalResult.missing,
      };
    }

    const nextStage = evalResult.nextStage;
    let updatedState = state;

    // Apply new stage
    const finalState: SavedGameState = {
      ...updatedState,
      stats: {
        ...updatedState.stats,
        currentStageId: nextStage.id,
        level: nextStage.order,
        // Bonus competition & season points upon evolution
        competitionPoints: updatedState.stats.competitionPoints + nextStage.order * 100,
        seasonPoints: updatedState.stats.seasonPoints + nextStage.order * 50,
      },
    };

    return {
      success: true,
      state: finalState,
      newStageId: nextStage.id,
    };
  }

  /**
   * Purchase skin with Garlic Teeth
   */
  static purchaseSkin(
    state: SavedGameState,
    skinId: SkinId
  ): { success: boolean; state: SavedGameState; error?: string } {
    const skin = SKINS_CATALOG.find((s) => s.id === skinId);
    if (!skin) return { success: false, state, error: 'Skin no encontrada' };

    if (state.inventory.unlockedSkins.includes(skinId)) {
      return { success: false, state, error: 'Ya posees este aspecto' };
    }

    const spendRes = this.spendGarlicTeeth(state, skin.priceGarlicTeeth, `BUY_SKIN_${skinId}`);
    if (!spendRes.success) {
      return { success: false, state, error: spendRes.error };
    }

    const newState: SavedGameState = {
      ...spendRes.state,
      inventory: {
        ...spendRes.state.inventory,
        unlockedSkins: [...spendRes.state.inventory.unlockedSkins, skinId],
        equippedSkin: skinId, // Auto-equip on purchase
      },
    };

    return { success: true, state: newState };
  }

  /**
   * Equip unlocked skin
   */
  static equipSkin(
    state: SavedGameState,
    skinId: SkinId
  ): { success: boolean; state: SavedGameState; error?: string } {
    if (!state.inventory.unlockedSkins.includes(skinId)) {
      return { success: false, state, error: 'Aspecto no desbloqueado' };
    }

    const newState: SavedGameState = {
      ...state,
      inventory: {
        ...state.inventory,
        equippedSkin: skinId,
      },
    };

    return { success: true, state: newState };
  }
}
