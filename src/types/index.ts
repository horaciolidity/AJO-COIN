export type NavigationTab = 'farm' | 'inventory' | 'skins' | 'rank' | 'launch' | 'profile' | 'admin';

export type EvolutionRank = 'COMMON' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
export type EvolutionSize = 'SMALL' | 'BIG';

export type EvolutionStageId =
  | 'COMMON_SMALL'
  | 'COMMON_BIG'
  | 'BRONZE_SMALL'
  | 'BRONZE_BIG'
  | 'SILVER_SMALL'
  | 'SILVER_BIG'
  | 'GOLD_SMALL'
  | 'GOLD_BIG'
  | 'PLATINUM_SMALL'
  | 'PLATINUM_BIG'
  | 'DIAMOND_SMALL'
  | 'DIAMOND_BIG';

export interface EvolutionStage {
  id: EvolutionStageId;
  name: string;
  rank: EvolutionRank;
  size: EvolutionSize;
  order: number;
  requiredXp: number;
  requiredTaps: number;
  requiredRawGarlic: number;
  requiredQuests: number;
  requiredSkinId?: SkinId;   // optional skin requirement for this stage
  requiredSkinLevel?: number; // minimum skin level needed
  description: string;
  celebrationMessage: string;
  auraColor: string;
  themeGradient: string;
  badgeIcon: string;
  garlicBodyStartColor: string;
  garlicBodyEndColor: string;
  strokeColor: string;
}

export type SkinId = 'DEFAULT' | 'NINJA' | 'KING' | 'ROBOT' | 'FIRE' | 'ALIEN' | 'DEAD' | 'RICH';

export type TapStyleId =
  | 'NORMAL'
  | 'FIRE_PUNCH'
  | 'ICE_STRIKE'
  | 'KAME_HAME'
  | 'THUNDER'
  | 'SHADOW'
  | 'COSMIC'
  | 'DRAGON';

export interface TapStyle {
  id: TapStyleId;
  name: string;
  description: string;
  priceGarlicTeeth: number;
  color: string;
  glowColor: string;
  particleEmoji: string;
  criticalMultiplier: number;
  criticalChance: number; // 0-1
  comboMultiplier: number;
  chargeMultiplier: number; // when holding
  soundEffect: string;
  unlockRank: string; // minimum rank needed
}

export interface Skin {
  id: SkinId;
  name: string;
  description: string;
  priceGarlicTeeth: number;
  icon: string;
  tag: string;
  headgearEmoji: string;
  color?: string;    // accent color for card UI
  gradient?: string; // CSS gradient for card background
}

export interface GarlicTeethTransaction {
  id: string;
  amount: number;
  type: 'EARN' | 'SPEND';
  reason: string;
  timestamp: number;
}

export type MissionDifficulty = 'EASY' | 'NORMAL' | 'HARD' | 'HELL';
export type MissionMechanic = 'TAP_SIMPLE' | 'RHYTHM' | 'ACCURACY' | 'SPEED';

export type AuthMethod = 'TELEGRAM' | 'WEB3' | 'EMAIL';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface UserState {
  id: string;
  telegramId?: string;
  email?: string;
  walletAddress?: string;
  authMethod: AuthMethod;
  username: string;
  firstName: string;
  photoUrl?: string;
  referralCode: string;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt?: string;
}

export interface UserAuthSession {
  isAuthenticated: boolean;
  authMethod: AuthMethod | null;
  user: UserState | null;
  token?: string;
}

export interface GameStatsState {
  level: number;
  xp: number;
  energy: number;
  maxEnergy: number;
  energyRegenSeconds: number;
  tapsPerGarlic: number;
  currentGarlicTaps: number;
  totalTaps: number;
  totalGarlicHarvested: number;
  totalBoxesCompleted: number;
  totalAjoEarned: number;
  powerPerTap: number;
  garlicMultiplier: number;
  currentStageId: EvolutionStageId;
  competitionPoints: number;
  seasonPoints: number;
}

export interface InventoryState {
  rawGarlic: number;
  gcBalance: number;
  ajoBalance: number;
  garlicTeeth: number;
  equippedSkin: SkinId;
  unlockedSkins: SkinId[];
  equippedTapStyle: TapStyleId;
  unlockedTapStyles: TapStyleId[];
  hitPowerLevel?: number;
  teethTransactions: GarlicTeethTransaction[];
}

export interface GarlicBoxItem {
  id: string;
  boxType: 'BASIC' | 'FARM' | 'MEGA';
  capacity: number;
  currentCount: number;
  isFull: boolean;
  claimedAjo: boolean;
}

export interface UpgradeItem {
  id: string;
  code: 'STRONGER_FINGERS' | 'BIGGER_HANDS' | 'FAST_REGEN' | 'GARLIC_MULTIPLIER' | 'BIGGER_BOXES' | 'ENERGY_TANK' | 'CRITICAL_BOOST';
  name: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  nextCost: number;
  effectText: string;
}

export interface QuestItem {
  id: string;
  code: string;
  title: string;
  description: string;
  rewardGc: number;
  rewardAjo: number;
  rewardGarlicTeeth?: number;
  rewardXp?: number;
  difficulty?: MissionDifficulty;
  mechanicType?: MissionMechanic;
  progress: number;
  targetValue: number;
  isCompleted: boolean;
  isClaimed: boolean;
  questType: 'TAPS' | 'HARVEST' | 'BOX' | 'REFERRAL' | 'WALLET';
}

export interface AchievementItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  firstName: string;
  photoUrl?: string;
  totalGarlic: number;
  totalBoxes: number;
  totalAjo: number;
}

export interface ReferralStats {
  referralCode: string;
  referralLink: string;
  invitedCount: number;
  activeCount: number;
  totalGcEarned: number;
  tiers: {
    level: number;
    count: number;
    rewardPerRef: number;
  }[];
}

export interface PresaleInfo {
  tokenName: string;
  tokenSymbol: string;
  contractAddress: string;
  network: string;
  totalSupply: string;
  presaleAllocation: string;
  raisedEth: number;
  targetEth: number;
  presaleRate: number; // AJO per ETH
  launchDateISO: string;
  userContributionEth: number;
  userPurchasedAjo: number;
  userPresaleRank: number;
  isPresaleActive: boolean;
}

export interface GameConfig {
  tapEnergyCost: number;
  energyMax: number;
  energyRegenRate: number;
  tapsPerGarlic: number;
  garlicSellPrice: number;
  boxPrices: {
    BASIC: number;
    FARM: number;
    MEGA: number;
  };
  boxCapacities: {
    BASIC: number;
    FARM: number;
    MEGA: number;
  };
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  chainName: string | null;
  ajoBalanceOnChain: string;
}

export type SeasonStatus = 'UPCOMING' | 'ACTIVE' | 'ENDING' | 'SNAPSHOT' | 'PROCESSING' | 'CLAIM_OPEN' | 'ENDED';

export interface SeasonInfo {
  id: string;
  number: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  claimDate?: string;
  status: SeasonStatus;
  seasonPool: number;
}

export interface UserSeasonData {
  ajoPoints: number;
  seasonScore: number;
  boxesCompleted: number;
  questsCompleted: number;
  qualifiedReferrals: number;
  streakDays: number;
  finalRank?: number;
  finalAllocation?: number;
}

