import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  NavigationTab,
  UserState,
  GameStatsState,
  InventoryState,
  GarlicBoxItem,
  UpgradeItem,
  QuestItem,
  AchievementItem,
  PresaleInfo,
  EvolutionStage,
  SkinId,
  EvolutionStageId,
} from '../types';
import { DEFAULT_GAME_CONFIG } from '../config/gameConfig';
import { EVOLUTION_STAGES, getStageById } from '../config/gameBalance';
import { StorageAdapter, SavedGameState } from '../services/StorageAdapter';
import { GameService } from '../services/GameService';
import { triggerHaptic } from '../utils/haptics';
import { playTapSound, playHarvestSound, playCoinSound } from '../utils/audio';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface GameContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  user: UserState;
  stats: GameStatsState;
  inventory: InventoryState;
  boxes: GarlicBoxItem[];
  upgrades: UpgradeItem[];
  quests: QuestItem[];
  achievements: AchievementItem[];
  presale: PresaleInfo;
  comboCount: number;
  toast: ToastMessage | null;
  currentStage: EvolutionStage;
  isEvolutionModalOpen: boolean;
  setIsEvolutionModalOpen: (open: boolean) => void;
  justEvolvedStage: EvolutionStage | null;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  handleTap: (clientX?: number, clientY?: number) => void;
  sellGarlic: (amount: number) => void;
  buyBox: (boxType: 'BASIC' | 'FARM' | 'MEGA') => void;
  claimAjoFromBox: (boxId: string) => void;
  buyUpgrade: (upgradeId: string) => void;
  claimQuestReward: (questId: string) => void;
  attemptEvolution: () => void;
  purchaseSkin: (skinId: SkinId) => void;
  equipSkin: (skinId: SkinId) => void;
  resetLocalProgress: () => void;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
  isClaimModalOpen: boolean;
  setIsClaimModalOpen: (open: boolean) => void;
  selectedBoxForClaim: GarlicBoxItem | null;
  setSelectedBoxForClaim: (box: GarlicBoxItem | null) => void;
  floatingParticles: { id: number; x: number; y: number; text: string }[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial saved state from StorageAdapter
  const [initialSave] = useState<SavedGameState>(() => StorageAdapter.loadState());

  const [activeTab, setActiveTab] = useState<NavigationTab>('farm');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedBoxForClaim, setSelectedBoxForClaim] = useState<GarlicBoxItem | null>(null);

  // Evolution Celebration Modal
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [justEvolvedStage, setJustEvolvedStage] = useState<EvolutionStage | null>(null);

  // User state
  const [user] = useState<UserState>({
    id: 'usr_demo_123',
    username: 'GarlicKing',
    firstName: 'Garlic',
    photoUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150&auto=format&fit=crop&q=80',
    referralCode: 'AJO-X7K29',
    isAdmin: true,
    isBanned: false,
  });

  // Game States initialized from local storage
  const [stats, setStats] = useState<GameStatsState>(initialSave.stats);
  const [inventory, setInventory] = useState<InventoryState>(initialSave.inventory);
  const [boxes, setBoxes] = useState<GarlicBoxItem[]>(initialSave.boxes);
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>(initialSave.upgrades);
  const [quests, setQuests] = useState<QuestItem[]>(initialSave.quests);
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialSave.achievements);

  // Presale State
  const [presale] = useState<PresaleInfo>({
    tokenName: 'AJO COIN',
    tokenSymbol: 'AJO',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    network: 'Ethereum Mainnet',
    totalSupply: '1,000,000,000 AJO',
    presaleAllocation: '400,000,000 AJO (40%)',
    raisedEth: 42.8,
    targetEth: 100,
    presaleRate: 10000,
    launchDateISO: new Date(Date.now() + 86400000 * 2.5).toISOString(),
    userContributionEth: 0.5,
    userPurchasedAjo: 5000,
    userPresaleRank: 428,
    isPresaleActive: true,
  });

  // Combo & Particle Effects
  const [comboCount, setComboCount] = useState<number>(0);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ id: String(Date.now()), title, message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Get current evolution stage
  const currentStage = getStageById(stats.currentStageId || 'COMMON_SMALL');

  // Auto-Save game state whenever stats/inventory/boxes/upgrades/quests change
  useEffect(() => {
    StorageAdapter.saveState({
      version: 2,
      stats,
      inventory,
      boxes,
      upgrades,
      quests,
      achievements,
    });
  }, [stats, inventory, boxes, upgrades, quests, achievements]);

  // Energy Auto Regeneration Timer (1 energy every X seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => {
        if (prev.energy < prev.maxEnergy) {
          return { ...prev, energy: Math.min(prev.maxEnergy, prev.energy + 1) };
        }
        return prev;
      });
    }, (stats.energyRegenSeconds || 3) * 1000);

    return () => clearInterval(interval);
  }, [stats.energyRegenSeconds]);

  // Handle Tap Action
  const handleTap = (clientX?: number, clientY?: number) => {
    if (stats.energy < DEFAULT_GAME_CONFIG.tapEnergyCost) {
      triggerHaptic('warning');
      showToast('¡Energía Agotada!', 'Espera unos segundos para que tu energía se recargue.', 'warning');
      return;
    }

    triggerHaptic('light');
    playTapSound();

    // Increment combo
    setComboCount((prev) => {
      const nextCombo = prev + 1;
      // Update combo quest progress if applicable
      setQuests((qList) =>
        qList.map((q) => {
          if (q.mechanicType === 'RHYTHM' && !q.isCompleted) {
            const isDone = nextCombo >= q.targetValue;
            return {
              ...q,
              progress: Math.max(q.progress, nextCombo),
              isCompleted: isDone,
            };
          }
          return q;
        })
      );
      return nextCombo;
    });

    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => setComboCount(0), 1200);

    // Spawn floating particle text (+1 XP or +Teeth)
    if (clientX && clientY) {
      const newParticle = {
        id: Date.now() + Math.random(),
        x: clientX,
        y: clientY - 30,
        text: `+${stats.powerPerTap} XP`,
      };
      setFloatingParticles((prev) => [...prev.slice(-15), newParticle]);
    }

    // Update energy, TAPs, XP, and Garlic Teeth
    setStats((prev) => {
      const nextEnergy = prev.energy - DEFAULT_GAME_CONFIG.tapEnergyCost;
      const nextTaps = prev.currentGarlicTaps + prev.powerPerTap;
      const nextTotalTaps = prev.totalTaps + prev.powerPerTap;
      const nextXp = prev.xp + prev.powerPerTap;

      let harvestOccurred = false;
      let remTaps = nextTaps;
      let garlicHarvested = 0;

      if (nextTaps >= prev.tapsPerGarlic) {
        harvestOccurred = true;
        garlicHarvested = Math.floor(nextTaps / prev.tapsPerGarlic);
        remTaps = nextTaps % prev.tapsPerGarlic;
      }

      if (harvestOccurred) {
        triggerHaptic('success');
        playHarvestSound();

        // Increment Garlic Inventory & Garlic Teeth (+2 Garlic Teeth per Garlic Harvested)
        setInventory((inv) => ({
          ...inv,
          rawGarlic: inv.rawGarlic + garlicHarvested,
          garlicTeeth: inv.garlicTeeth + garlicHarvested * 2,
        }));

        // Fill active box
        setBoxes((prevBoxes) => {
          let remainingToAdd = garlicHarvested;
          return prevBoxes.map((box) => {
            if (!box.isFull && remainingToAdd > 0) {
              const space = box.capacity - box.currentCount;
              const addCount = Math.min(space, remainingToAdd);
              remainingToAdd -= addCount;
              const isFullNow = box.currentCount + addCount >= box.capacity;

              if (isFullNow) {
                showToast('🎉 ¡CAJA LLENA!', '¡Has completado una caja de ajo!', 'success');
              }
              return {
                ...box,
                currentCount: box.currentCount + addCount,
                isFull: isFullNow,
              };
            }
            return box;
          });
        });
      }

      // Check quests for TAP progress
      setQuests((qList) =>
        qList.map((q) => {
          if (q.questType === 'TAPS' && q.mechanicType !== 'RHYTHM' && !q.isCompleted) {
            const nextProg = q.progress + prev.powerPerTap;
            return {
              ...q,
              progress: nextProg,
              isCompleted: nextProg >= q.targetValue,
            };
          }
          return q;
        })
      );

      return {
        ...prev,
        energy: nextEnergy,
        xp: nextXp,
        currentGarlicTaps: remTaps,
        totalTaps: nextTotalTaps,
        totalGarlicHarvested: prev.totalGarlicHarvested + (harvestOccurred ? garlicHarvested : 0),
        level: Math.floor(nextTotalTaps / 100) + 1,
      };
    });
  };

  // Sell Raw Garlic for GC
  const sellGarlic = (amount: number) => {
    if (inventory.rawGarlic < amount || amount <= 0) return;

    triggerHaptic('success');
    playCoinSound();

    const gcEarned = amount * DEFAULT_GAME_CONFIG.garlicSellPrice;
    setInventory((prev) => ({
      ...prev,
      rawGarlic: prev.rawGarlic - amount,
      gcBalance: prev.gcBalance + gcEarned,
    }));

    showToast('¡Ajo Vendido!', `Vendiste ${amount} Ajo(s) por +${gcEarned.toLocaleString()} GC!`, 'success');
  };

  // Buy Garlic Box
  const buyBox = (boxType: 'BASIC' | 'FARM' | 'MEGA') => {
    const price = DEFAULT_GAME_CONFIG.boxPrices[boxType];
    const capacity = DEFAULT_GAME_CONFIG.boxCapacities[boxType];

    if (inventory.gcBalance < price) {
      showToast('GC Insuficiente', `Requieres ${price.toLocaleString()} GC para comprar la caja ${boxType}.`, 'error');
      return;
    }

    triggerHaptic('success');
    setInventory((prev) => ({ ...prev, gcBalance: prev.gcBalance - price }));
    setBoxes((prev) => [
      ...prev,
      {
        id: 'box_' + Date.now(),
        boxType,
        capacity,
        currentCount: 0,
        isFull: false,
        claimedAjo: false,
      },
    ]);

    showToast('¡Caja Comprada!', `Nueva caja ${boxType} (${capacity} capacidad).`, 'success');
  };

  // Claim AJO from completed box
  const claimAjoFromBox = (boxId: string) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === boxId ? { ...b, claimedAjo: true } : b))
    );
    setInventory((prev) => ({
      ...prev,
      ajoBalance: prev.ajoBalance + 1.0,
      garlicTeeth: prev.garlicTeeth + 25, // Bonus Garlic Teeth for completing a box
    }));
    setStats((prev) => ({
      ...prev,
      totalBoxesCompleted: prev.totalBoxesCompleted + 1,
      totalAjoEarned: prev.totalAjoEarned + 1.0,
    }));

    triggerHaptic('success');
    showToast('🎉 ¡Caja Canjeada!', '¡Ganaste +1.0 AJO y +25 Garlic Teeth 🧄!', 'success');
  };

  // Buy Upgrade in Garlic Lab
  const buyUpgrade = (upgradeId: string) => {
    const up = upgrades.find((u) => u.id === upgradeId);
    if (!up) return;

    if (inventory.gcBalance < up.nextCost) {
      showToast('GC Insuficiente', `¡Requieres ${up.nextCost.toLocaleString()} GC!`, 'error');
      return;
    }

    triggerHaptic('success');
    setInventory((prev) => ({ ...prev, gcBalance: prev.gcBalance - up.nextCost }));

    setUpgrades((prev) =>
      prev.map((item) => {
        if (item.id === upgradeId) {
          const nextLvl = item.currentLevel + 1;
          const nextCost = Math.floor(item.nextCost * 1.5);
          return { ...item, currentLevel: nextLvl, nextCost };
        }
        return item;
      })
    );

    // Apply upgrade effects
    if (up.code === 'STRONGER_FINGERS') {
      setStats((s) => ({ ...s, powerPerTap: s.powerPerTap + 1 }));
    } else if (up.code === 'BIGGER_HANDS') {
      setStats((s) => ({ ...s, maxEnergy: s.maxEnergy + 25 }));
    }

    showToast('¡Mejora Desbloqueada!', `${up.name} subió al Nivel ${up.currentLevel + 1}!`, 'success');
  };

  // Claim Quest Reward
  const claimQuestReward = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.isClaimed || !quest.isCompleted) return;

    triggerHaptic('success');
    playCoinSound();

    const teethReward = quest.rewardGarlicTeeth || 15;
    const xpReward = quest.rewardXp || 100;

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, isClaimed: true } : q))
    );

    setInventory((prev) => ({
      ...prev,
      gcBalance: prev.gcBalance + quest.rewardGc,
      garlicTeeth: prev.garlicTeeth + teethReward,
    }));

    setStats((prev) => ({
      ...prev,
      xp: prev.xp + xpReward,
    }));

    showToast(
      '¡Misión Reclamada!',
      `Recibiste +${quest.rewardGc.toLocaleString()} GC, +${teethReward} Garlic Teeth 🧄 y +${xpReward} XP!`,
      'success'
    );
  };

  // Attempt Evolution
  const attemptEvolution = () => {
    const currentState: SavedGameState = {
      version: 2,
      stats,
      inventory,
      boxes,
      upgrades,
      quests,
      achievements,
    };

    const result = GameService.attemptEvolution(currentState);

    if (!result.success) {
      const msg = result.missing?.join('\n• ') || 'No cumples los requisitos aún.';
      showToast('No puedes evolucionar aún', `Requisitos faltantes:\n• ${msg}`, 'warning');
      return;
    }

    // Update local states
    setStats(result.state.stats);
    setInventory(result.state.inventory);

    if (result.newStageId) {
      const stage = getStageById(result.newStageId);
      setJustEvolvedStage(stage);
      setIsEvolutionModalOpen(true);
      triggerHaptic('success');

      // Check achievement unlock
      setAchievements((prev) =>
        prev.map((a) => (a.code === 'FIRST_EVOLUTION' ? { ...a, unlocked: true } : a))
      );
    }
  };

  // Purchase Skin
  const purchaseSkin = (skinId: SkinId) => {
    const currentState: SavedGameState = {
      version: 2,
      stats,
      inventory,
      boxes,
      upgrades,
      quests,
      achievements,
    };

    const res = GameService.purchaseSkin(currentState, skinId);
    if (!res.success) {
      showToast('Error', res.error || 'No se pudo comprar el aspecto.', 'error');
      return;
    }

    setInventory(res.state.inventory);
    triggerHaptic('success');
    showToast('¡Aspecto Desbloqueado!', `¡Equipaste el aspecto con éxito!`, 'success');
  };

  // Equip Skin
  const equipSkin = (skinId: SkinId) => {
    const currentState: SavedGameState = {
      version: 2,
      stats,
      inventory,
      boxes,
      upgrades,
      quests,
      achievements,
    };

    const res = GameService.equipSkin(currentState, skinId);
    if (!res.success) {
      showToast('Error', res.error || 'No se pudo equipar.', 'error');
      return;
    }

    setInventory(res.state.inventory);
    triggerHaptic('light');
    showToast('Aspecto Equipado', 'Has cambiado tu aspecto correctamente.', 'info');
  };

  // Reset Progress for Dev/Testing
  const resetLocalProgress = () => {
    const reset = StorageAdapter.resetState();
    setStats(reset.stats);
    setInventory(reset.inventory);
    setBoxes(reset.boxes);
    setUpgrades(reset.upgrades);
    setQuests(reset.quests);
    setAchievements(reset.achievements);
    showToast('Progreso Reiniciado', 'Se ha restablecido el juego al estado inicial.', 'info');
  };

  return (
    <GameContext.Provider
      value={{
        activeTab,
        setActiveTab,
        user,
        stats,
        inventory,
        boxes,
        upgrades,
        quests,
        achievements,
        presale,
        comboCount,
        toast,
        currentStage,
        isEvolutionModalOpen,
        setIsEvolutionModalOpen,
        justEvolvedStage,
        showToast,
        handleTap,
        sellGarlic,
        buyBox,
        claimAjoFromBox,
        buyUpgrade,
        claimQuestReward,
        attemptEvolution,
        purchaseSkin,
        equipSkin,
        resetLocalProgress,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isClaimModalOpen,
        setIsClaimModalOpen,
        selectedBoxForClaim,
        setSelectedBoxForClaim,
        floatingParticles,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
