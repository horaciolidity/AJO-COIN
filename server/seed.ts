import { db } from './db';

export async function seedDatabase() {
  console.log('🌱 Seeding AJO COIN database...');

  // 1. Upgrades
  const upgrades = [
    {
      code: 'STRONGER_FINGERS',
      name: 'Stronger Fingers',
      description: '+1 garlic tap power per tap action',
      baseCost: 100,
      costMultiplier: 1.5,
      maxLevel: 50,
    },
    {
      code: 'BIGGER_HANDS',
      name: 'Bigger Hands',
      description: '+50 Max Energy capacity',
      baseCost: 250,
      costMultiplier: 1.6,
      maxLevel: 50,
    },
    {
      code: 'FAST_REGEN',
      name: 'Fast Regen',
      description: 'Accelerates energy regeneration speed by 10%',
      baseCost: 500,
      costMultiplier: 1.8,
      maxLevel: 20,
    },
    {
      code: 'GARLIC_MULTIPLIER',
      name: 'Garlic Multiplier',
      description: 'Increases chance of harvesting 2x Garlic from taps',
      baseCost: 1000,
      costMultiplier: 2.0,
      maxLevel: 25,
    },
    {
      code: 'BIGGER_BOXES',
      name: 'Bigger Boxes',
      description: '+10% storage capacity for all garlic boxes',
      baseCost: 2000,
      costMultiplier: 2.2,
      maxLevel: 10,
    },
  ];

  for (const up of upgrades) {
    await db.upgrade.upsert({
      where: { code: up.code },
      update: up,
      create: up,
    });
  }

  // 2. Quests
  const quests = [
    {
      code: 'TAP_100',
      title: 'Tap 100 Times',
      description: 'Tap the giant AJO 100 times to get started',
      rewardGc: 100,
      rewardAjo: 0,
      targetValue: 100,
      questType: 'TAPS',
    },
    {
      code: 'HARVEST_10_GARLIC',
      title: 'Harvest 10 Garlic',
      description: 'Harvest 10 raw garlics from tapping',
      rewardGc: 500,
      rewardAjo: 0,
      targetValue: 10,
      questType: 'HARVEST',
    },
    {
      code: 'FILL_1_BOX',
      title: 'Fill 1 Garlic Box',
      description: 'Completely fill your first box of garlic',
      rewardGc: 1000,
      rewardAjo: 0.5,
      targetValue: 1,
      questType: 'BOX',
    },
    {
      code: 'INVITE_3_FRIENDS',
      title: 'Invite 3 Friends',
      description: 'Share your referral code with 3 friends on Telegram',
      rewardGc: 2500,
      rewardAjo: 1.0,
      targetValue: 3,
      questType: 'REFERRAL',
    },
    {
      code: 'CONNECT_WALLETS',
      title: 'Connect Web3 Wallet',
      description: 'Link your Web3 EVM wallet to claim on-chain rewards',
      rewardGc: 5000,
      rewardAjo: 2.0,
      targetValue: 1,
      questType: 'WALLET',
    },
  ];

  for (const q of quests) {
    await db.quest.upsert({
      where: { code: q.code },
      update: q,
      create: q,
    });
  }

  // 3. Achievements
  const achievements = [
    {
      code: 'FIRST_GARLIC',
      name: 'First Garlic',
      description: 'Harvested your very first raw garlic unit',
      icon: '🧄',
    },
    {
      code: 'FIRST_BOX',
      name: 'First Box',
      description: 'Filled a complete box of garlic and generated 1 AJO',
      icon: '📦',
    },
    {
      code: 'TAPS_10K',
      name: '10K Taps',
      description: 'Tapped the giant garlic 10,000 times',
      icon: '🔥',
    },
    {
      code: 'GARLIC_MASTER',
      name: 'Garlic Master',
      description: 'Harvested over 1,000 raw garlics',
      icon: '👑',
    },
    {
      code: 'EARLY_FARMER',
      name: 'Early Farmer',
      description: 'Joined AJO COIN during the Fair Launch phase',
      icon: '🚀',
    },
  ];

  for (const ach of achievements) {
    await db.achievement.upsert({
      where: { code: ach.code },
      update: ach,
      create: ach,
    });
  }

  console.log('✅ Seeding completed!');
}

// Always run when called directly
seedDatabase().catch(console.error);
