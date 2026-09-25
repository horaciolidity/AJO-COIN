import { GameConfig } from '../types';

export const DEFAULT_GAME_CONFIG: GameConfig & {
  referralRewards: { tier1: number; tier2: number; tier3: number };
  presaleSettings: {
    targetEth: number;
    rateAjoPerEth: number;
    minBuyEth: number;
    maxBuyEth: number;
  };
} = {
  tapEnergyCost: 1,
  energyMax: 1000,
  energyRegenRate: 1, // 1 energy per 3 seconds
  tapsPerGarlic: 100, // 100 taps = 1 Raw Garlic
  garlicSellPrice: 50, // 1 Raw Garlic = 50 GC
  boxPrices: {
    BASIC: 5000,
    FARM: 20000,
    MEGA: 100000,
  },
  boxCapacities: {
    BASIC: 100, // 100 Garlic = 1 Box = 1 AJO
    FARM: 500,  // 500 Garlic = 5 AJO
    MEGA: 2500, // 2500 Garlic = 25 AJO
  },
  referralRewards: {
    tier1: 500, // GC per tier 1 referral
    tier2: 250,
    tier3: 100,
  },
  presaleSettings: {
    targetEth: 100,
    rateAjoPerEth: 10000, // 1 ETH = 10,000 AJO
    minBuyEth: 0.01,
    maxBuyEth: 5,
  }
};
