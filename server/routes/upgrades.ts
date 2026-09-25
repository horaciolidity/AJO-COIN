import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { db } from '../db';

export const upgradesRouter = Router();

upgradesRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const allUpgrades = await db.upgrade.findMany();
    const userUpgrades = await db.userUpgrade.findMany({ where: { userId } });

    const upgradesWithLevels = allUpgrades.map((up: any) => {
      const userUp = userUpgrades.find((u: any) => u.upgradeId === up.id);
      const currentLevel = userUp ? userUp.level : 0;
      const nextCost = Math.floor(up.baseCost * Math.pow(up.costMultiplier, currentLevel));
      
      let effectText = '';
      if (up.code === 'STRONGER_FINGERS') effectText = `+${currentLevel + 1} garlic tap power`;
      else if (up.code === 'BIGGER_HANDS') effectText = `+${(currentLevel + 1) * 50} max energy`;
      else if (up.code === 'FAST_REGEN') effectText = `-${(currentLevel + 1) * 5}% energy regen delay`;
      else if (up.code === 'GARLIC_MULTIPLIER') effectText = `${(currentLevel + 1) * 5}% double garlic chance`;
      else if (up.code === 'BIGGER_BOXES') effectText = `+${(currentLevel + 1) * 10}% box capacity`;

      return {
        id: up.id,
        code: up.code,
        name: up.name,
        description: up.description,
        currentLevel,
        maxLevel: up.maxLevel,
        nextCost,
        effectText,
      };
    });

    res.json(upgradesWithLevels);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

upgradesRouter.post('/buy', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { upgradeId } = req.body;

    const upgrade = await db.upgrade.findUnique({ where: { id: upgradeId } });
    if (!upgrade) return res.status(404).json({ error: 'Upgrade not found' });

    let userUp = await db.userUpgrade.findUnique({
      where: { userId_upgradeId: { userId, upgradeId } },
    });

    const currentLevel = userUp ? userUp.level : 0;
    if (currentLevel >= upgrade.maxLevel) {
      return res.status(400).json({ error: 'Upgrade already at maximum level' });
    }

    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    const currency = await db.gameCurrency.findUnique({ where: { userId } });

    if (!currency || currency.gcBalance < cost) {
      return res.status(400).json({ error: `Insufficient GC balance. Required: ${cost} GC` });
    }

    // Deduct cost
    const updatedCurrency = await db.gameCurrency.update({
      where: { userId },
      data: { gcBalance: { decrement: cost } },
    });

    // Upgrade level
    const newLevel = currentLevel + 1;
    if (userUp) {
      userUp = await db.userUpgrade.update({
        where: { id: userUp.id },
        data: { level: newLevel },
      });
    } else {
      userUp = await db.userUpgrade.create({
        data: { userId, upgradeId, level: 1 },
      });
    }

    // Apply upgrade side effects to gameStats if applicable
    if (upgrade.code === 'BIGGER_HANDS') {
      await db.gameStats.update({
        where: { userId },
        data: { maxEnergy: 1000 + newLevel * 50 },
      });
    }

    res.json({
      success: true,
      upgradeId,
      newLevel,
      currency: updatedCurrency,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
