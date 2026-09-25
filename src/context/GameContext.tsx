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
  LeaderboardEntry,
} from '../types';
import { DEFAULT_GAME_CONFIG } from '../config/gameConfig';
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
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  handleTap: (clientX?: number, clientY?: number) => void;
  sellGarlic: (amount: number) => void;
  buyBox: (boxType: 'BASIC' | 'FARM' | 'MEGA') => void;
  claimAjoFromBox: (boxId: string) => void;
  buyUpgrade: (upgradeId: string) => void;
  claimQuestReward: (questId: string) => void;
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
  const [activeTab, setActiveTab] = useState<NavigationTab>('farm');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedBoxForClaim, setSelectedBoxForClaim] = useState<GarlicBoxItem | null>(null);

  // User state
  const [user, setUser] = useState<UserState>({
    id: 'usr_demo_123',
    username: 'GarlicKing',
    firstName: 'Garlic',
    photoUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150&auto=format&fit=crop&q=80',
    referralCode: 'AJO-X7K29',
    isAdmin: true,
    isBanned: false,
  });

  // Game Stats
  const [stats, setStats] = useState<GameStatsState>({
    level: 12,
    xp: 1240,
    energy: 873,
    maxEnergy: 1000,
    energyRegenSeconds: 3,
    tapsPerGarlic: 100,
    currentGarlicTaps: 87,
    totalTaps: 1247,
    totalGarlicHarvested: 247,
    totalBoxesCompleted: 2,
    totalAjoEarned: 4.25,
    powerPerTap: 1,
    garlicMultiplier: 1,
  });

  // Inventory & Currencies
  const [inventory, setInventory] = useState<InventoryState>({
    rawGarlic: 247,
    gcBalance: 12450,
    ajoBalance: 4.25,
  });

  // Garlic Boxes
  const [boxes, setBoxes] = useState<GarlicBoxItem[]>([
    {
      id: 'box_1',
      boxType: 'BASIC',
      capacity: 100,
      currentCount: 100,
      isFull: true,
      claimedAjo: false,
    },
    {
      id: 'box_2',
      boxType: 'FARM',
      capacity: 500,
      currentCount: 247,
      isFull: false,
      claimedAjo: false,
    },
  ]);

  // Upgrades
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>([
    {
      id: 'up_1',
      code: 'STRONGER_FINGERS',
      name: 'STRONGER FINGERS',
      description: '+1 garlic tap power per tap',
      currentLevel: 3,
      maxLevel: 50,
      nextCost: 800,
      effectText: '+4 garlic tap power',
    },
    {
      id: 'up_2',
      code: 'BIGGER_HANDS',
      name: 'BIGGER HANDS',
      description: '+25 max energy capacity',
      currentLevel: 5,
      maxLevel: 50,
      nextCost: 1500,
      effectText: '+150 max energy',
    },
    {
      id: 'up_3',
      code: 'FAST_REGEN',
      name: 'FAST REGEN',
      description: 'Energy regenerates faster (+1 / 2.5s)',
      currentLevel: 2,
      maxLevel: 20,
      nextCost: 3000,
      effectText: '+1 energy every 2.5 seconds',
    },
    {
      id: 'up_4',
      code: 'GARLIC_MULTIPLIER',
      name: 'GARLIC MULTIPLIER',
      description: 'Chance to produce bonus garlic',
      currentLevel: 1,
      maxLevel: 25,
      nextCost: 5000,
      effectText: '5% chance for 2x Garlic',
    },
    {
      id: 'up_5',
      code: 'BIGGER_BOXES',
      name: 'BIGGER BOXES',
      description: 'Increase box storage capacity',
      currentLevel: 0,
      maxLevel: 10,
      nextCost: 10000,
      effectText: '+10% storage capacity',
    },
  ]);

  // Quests
  const [quests, setQuests] = useState<QuestItem[]>([
    {
      id: 'q_1',
      code: 'TAP_100',
      title: 'TAP 100 TIMES',
      description: 'Tap the giant AJO 100 times',
      rewardGc: 100,
      rewardAjo: 0,
      progress: 100,
      targetValue: 100,
      isCompleted: true,
      isClaimed: true,
      questType: 'TAPS',
    },
    {
      id: 'q_2',
      code: 'HARVEST_10',
      title: 'HARVEST 10 GARLIC',
      description: 'Harvest 10 raw garlic units',
      rewardGc: 500,
      rewardAjo: 0,
      progress: 10,
      targetValue: 10,
      isCompleted: true,
      isClaimed: false,
      questType: 'HARVEST',
    },
    {
      id: 'q_3',
      code: 'FILL_1_BOX',
      title: 'FILL 1 BOX',
      description: 'Completely fill 1 garlic box',
      rewardGc: 1000,
      rewardAjo: 0.5,
      progress: 1,
      targetValue: 1,
      isCompleted: true,
      isClaimed: false,
      questType: 'BOX',
    },
    {
      id: 'q_4',
      code: 'INVITE_3',
      title: 'INVITE 3 FRIENDS',
      description: 'Invite 3 friends on Telegram',
      rewardGc: 2500,
      rewardAjo: 1.0,
      progress: 1,
      targetValue: 3,
      isCompleted: false,
      isClaimed: false,
      questType: 'REFERRAL',
    },
    {
      id: 'q_5',
      code: 'CONNECT_WALLETS',
      title: 'CONNECT WALLET',
      description: 'Connect your Web3 EVM wallet',
      rewardGc: 5000,
      rewardAjo: 2.0,
      progress: 1,
      targetValue: 1,
      isCompleted: true,
      isClaimed: false,
      questType: 'WALLET',
    },
  ]);

  // Achievements
  const [achievements, setAchievements] = useState<AchievementItem[]>([
    { id: 'a1', code: 'FIRST_GARLIC', name: 'First Garlic', description: 'Harvested your first raw garlic', icon: '🧄', unlocked: true },
    { id: 'a2', code: 'FIRST_BOX', name: 'First Box', description: 'Filled 1 garlic box', icon: '📦', unlocked: true },
    { id: 'a3', code: 'TAPS_10K', name: '10K Taps', description: 'Tapped 10,000 times', icon: '🔥', unlocked: false },
    { id: 'a4', code: 'GARLIC_MASTER', name: 'Garlic Master', description: 'Harvested 1,000 garlics', icon: '👑', unlocked: false },
    { id: 'a5', code: 'EARLY_FARMER', name: 'Early Farmer', description: 'Joined during Fair Launch', icon: '🚀', unlocked: true },
  ]);

  // Presale State
  const [presale, setPresale] = useState<PresaleInfo>({
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

  // Energy Auto Regeneration Timer (1 energy every X seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => {
        if (prev.energy < prev.maxEnergy) {
          return { ...prev, energy: Math.min(prev.maxEnergy, prev.energy + 1) };
        }
        return prev;
      });
    }, stats.energyRegenSeconds * 1000);

    return () => clearInterval(interval);
  }, [stats.energyRegenSeconds]);

  // Handle Tap Action
  const handleTap = (clientX?: number, clientY?: number) => {
    if (stats.energy < DEFAULT_GAME_CONFIG.tapEnergyCost) {
      triggerHaptic('warning');
      showToast('Energy Depleted', 'Wait for your energy to regenerate!', 'warning');
      return;
    }

    triggerHaptic('light');
    playTapSound();

    // Increment combo
    setComboCount((prev) => prev + 1);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => setComboCount(0), 1200);

    // Spawn floating particle text
    if (clientX && clientY) {
      const newParticle = {
        id: Date.now() + Math.random(),
        x: clientX,
        y: clientY - 30,
        text: `+${stats.powerPerTap}`,
      };
      setFloatingParticles((prev) => [...prev.slice(-15), newParticle]);
    }

    // Update energy & tap counts
    setStats((prev) => {
      const nextEnergy = prev.energy - DEFAULT_GAME_CONFIG.tapEnergyCost;
      const nextTaps = prev.currentGarlicTaps + prev.powerPerTap;
      const nextTotalTaps = prev.totalTaps + prev.powerPerTap;

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

        // Increment Garlic Inventory
        setInventory((inv) => ({
          ...inv,
          rawGarlic: inv.rawGarlic + garlicHarvested,
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
                showToast('🎉 BOX FULL!', '1 AJO produced! Go to Inventory to claim.', 'success');
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

      return {
        ...prev,
        energy: nextEnergy,
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

    showToast('Garlic Sold!', `Sold ${amount} Garlic for +${gcEarned.toLocaleString()} GC!`, 'success');
  };

  // Buy Garlic Box
  const buyBox = (boxType: 'BASIC' | 'FARM' | 'MEGA') => {
    const price = DEFAULT_GAME_CONFIG.boxPrices[boxType];
    const capacity = DEFAULT_GAME_CONFIG.boxCapacities[boxType];

    if (inventory.gcBalance < price) {
      showToast('Insufficient GC', `Need ${price.toLocaleString()} GC to buy ${boxType} box.`, 'error');
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

    showToast('Box Purchased!', `Created new ${boxType} Box (${capacity} capacity).`, 'success');
  };

  // Claim AJO from completed box
  const claimAjoFromBox = (boxId: string) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === boxId ? { ...b, claimedAjo: true } : b))
    );
    setInventory((prev) => ({ ...prev, ajoBalance: prev.ajoBalance + 1.0 }));
    setStats((prev) => ({
      ...prev,
      totalBoxesCompleted: prev.totalBoxesCompleted + 1,
      totalAjoEarned: prev.totalAjoEarned + 1.0,
    }));

    triggerHaptic('success');
    showToast('🎉 AJO Claimed!', 'Added +1.0 AJO to your balance!', 'success');
  };

  // Buy Upgrade in Garlic Lab
  const buyUpgrade = (upgradeId: string) => {
    const up = upgrades.find((u) => u.id === upgradeId);
    if (!up) return;

    if (inventory.gcBalance < up.nextCost) {
      showToast('Insufficient GC', `Requires ${up.nextCost.toLocaleString()} GC!`, 'error');
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

    showToast('Upgrade Unlocked!', `${up.name} upgraded to Lvl ${up.currentLevel + 1}!`, 'success');
  };

  // Claim Quest Reward
  const claimQuestReward = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.isClaimed || !quest.isCompleted) return;

    triggerHaptic('success');
    playCoinSound();

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, isClaimed: true } : q))
    );

    setInventory((prev) => ({
      ...prev,
      gcBalance: prev.gcBalance + quest.rewardGc,
      ajoBalance: prev.ajoBalance + quest.rewardAjo,
    }));

    showToast(
      'Quest Claimed!',
      `Received +${quest.rewardGc.toLocaleString()} GC ${quest.rewardAjo > 0 ? `+${quest.rewardAjo} AJO` : ''}`,
      'success'
    );
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
        showToast,
        handleTap,
        sellGarlic,
        buyBox,
        claimAjoFromBox,
        buyUpgrade,
        claimQuestReward,
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
