import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { validateTapSpeed } from '../middleware/antiCheat';
import { db } from '../db';
import { DYNAMIC_GAME_CONFIG } from '../config';

export const gameRouter = Router();

// GET game status & calculate current energy based on elapsed time
gameRouter.get('/state', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        gameStats: true,
        garlicInventory: true,
        gameCurrency: true,
        garlicBoxes: true,
        wallet: true,
      },
    });

    if (!user || !user.gameStats) {
      return res.status(404).json({ error: 'User game stats not found' });
    }

    // Calculate energy regeneration since last energy update
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - new Date(user.gameStats.lastEnergyUpdateAt).getTime()) / 1000);
    const regenSeconds = user.gameStats.energyRegenSeconds || DYNAMIC_GAME_CONFIG.energyRegenSecondsDefault;
    const energyToAdd = Math.floor(elapsedSeconds / regenSeconds) * user.gameStats.energyRegenRate;

    let updatedEnergy = user.gameStats.energy;
    if (energyToAdd > 0 && user.gameStats.energy < user.gameStats.maxEnergy) {
      updatedEnergy = Math.min(user.gameStats.maxEnergy, user.gameStats.energy + energyToAdd);
      await db.gameStats.update({
        where: { userId },
        data: {
          energy: updatedEnergy,
          lastEnergyUpdateAt: now,
        },
      });
    }

    // Calculate level based on XP
    const calculatedLevel = Math.floor(user.gameStats.totalTaps / 100) + 1;
    if (calculatedLevel !== user.gameStats.level) {
      await db.gameStats.update({
        where: { userId },
        data: { level: calculatedLevel },
      });
      user.gameStats.level = calculatedLevel;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        photoUrl: user.photoUrl,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin,
      },
      stats: {
        ...user.gameStats,
        energy: updatedEnergy,
      },
      inventory: user.garlicInventory,
      currency: user.gameCurrency,
      boxes: user.garlicBoxes,
      wallet: user.wallet,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST sync taps batch
gameRouter.post('/tap', authenticateToken, validateTapSpeed, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { count = 1 } = req.body;

    const stats = await db.gameStats.findUnique({ where: { userId } });
    if (!stats) return res.status(404).json({ error: 'Stats not found' });

    // Energy check
    const requiredEnergy = count * DYNAMIC_GAME_CONFIG.tapEnergyCost;
    if (stats.energy < requiredEnergy) {
      return res.status(400).json({ error: 'Insufficient energy', currentEnergy: stats.energy });
    }

    const newEnergy = stats.energy - requiredEnergy;
    const newTotalTaps = stats.totalTaps + count;
    let newCurrentGarlicTaps = stats.currentGarlicTaps + count;

    let garlicsHarvested = 0;
    const tapsNeeded = stats.tapsPerGarlic || DYNAMIC_GAME_CONFIG.tapsPerGarlicDefault;

    if (newCurrentGarlicTaps >= tapsNeeded) {
      garlicsHarvested = Math.floor(newCurrentGarlicTaps / tapsNeeded);
      newCurrentGarlicTaps = newCurrentGarlicTaps % tapsNeeded;
    }

    // Update stats
    const updatedStats = await db.gameStats.update({
      where: { userId },
      data: {
        energy: newEnergy,
        totalTaps: newTotalTaps,
        currentGarlicTaps: newCurrentGarlicTaps,
        totalGarlicHarvested: { increment: garlicsHarvested },
        lastTapAt: new Date(),
        level: Math.floor(newTotalTaps / 100) + 1,
      },
    });

    let updatedInventory = null;
    let autoFilledBox = false;

    if (garlicsHarvested > 0) {
      // Add garlic to inventory
      updatedInventory = await db.garlicInventory.update({
        where: { userId },
        data: {
          rawGarlic: { increment: garlicsHarvested },
        },
      });

      // Also automatically distribute garlic into active non-full boxes!
      const activeBox = await db.garlicBox.findFirst({
        where: { userId, isFull: false },
        orderBy: { createdAt: 'asc' },
      });

      if (activeBox) {
        const spaceLeft = activeBox.capacity - activeBox.currentCount;
        const countToAdd = Math.min(spaceLeft, garlicsHarvested);
        const newBoxCount = activeBox.currentCount + countToAdd;
        const isNowFull = newBoxCount >= activeBox.capacity;

        await db.garlicBox.update({
          where: { id: activeBox.id },
          data: {
            currentCount: newBoxCount,
            isFull: isNowFull,
          },
        });

        if (isNowFull) {
          autoFilledBox = true;
          // Increment total boxes completed & add 1 AJO to virtual balance!
          await db.gameStats.update({
            where: { userId },
            data: {
              totalBoxesCompleted: { increment: 1 },
              totalAjoEarned: { increment: 1.0 },
            },
          });
          await db.gameCurrency.update({
            where: { userId },
            data: { ajoBalance: { increment: 1.0 } },
          });

          // Check First Box achievement
          const firstBoxAch = await db.achievement.findUnique({ where: { code: 'FIRST_BOX' } });
          if (firstBoxAch) {
            await db.userAchievement.upsert({
              where: { userId_achievementId: { userId, achievementId: firstBoxAch.id } },
              create: { userId, achievementId: firstBoxAch.id },
              update: {},
            });
          }
        }
      }

      // Check First Garlic achievement
      const firstGarlicAch = await db.achievement.findUnique({ where: { code: 'FIRST_GARLIC' } });
      if (firstGarlicAch) {
        await db.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: firstGarlicAch.id } },
          create: { userId, achievementId: firstGarlicAch.id },
          update: {},
        });
      }
    }

    res.json({
      success: true,
      stats: updatedStats,
      garlicsHarvested,
      inventory: updatedInventory,
      autoFilledBox,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
