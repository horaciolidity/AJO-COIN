import dotenv from 'dotenv';
dotenv.config();

export const SERVER_CONFIG = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'super_secret_garlic_key_ajo_coin_2026',
  ajoContractAddress: process.env.AJO_CONTRACT_ADDRESS || '0x1234567890abcdef1234567890abcdef12345678',
  presaleContractAddress: process.env.PRESALE_CONTRACT_ADDRESS || '0x9876543210fedcba9876543210fedcba98765432',
  chainId: Number(process.env.CHAIN_ID || 1),
  chainName: process.env.CHAIN_NAME || 'Ethereum Mainnet',
  rpcUrl: process.env.RPC_URL || 'https://eth.llamarpc.com',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || 'AJOCOINbot',
};

export let DYNAMIC_GAME_CONFIG = {
  tapEnergyCost: 1,
  energyMaxDefault: 1000,
  energyRegenSecondsDefault: 3,
  tapsPerGarlicDefault: 100,
  garlicSellPriceDefault: 50,
  boxPrices: {
    BASIC: 5000,
    FARM: 20000,
    MEGA: 100000,
  },
  boxCapacities: {
    BASIC: 100,
    FARM: 500,
    MEGA: 2500,
  },
  referralRewards: {
    tier1: 500,
    tier2: 250,
    tier3: 100,
  },
  presaleSettings: {
    targetEth: 100,
    rateAjoPerEth: 10000,
    isPresaleActive: true,
    launchDateISO: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
  }
};

export const updateDynamicConfig = (newConfig: Partial<typeof DYNAMIC_GAME_CONFIG>) => {
  DYNAMIC_GAME_CONFIG = { ...DYNAMIC_GAME_CONFIG, ...newConfig };
};
