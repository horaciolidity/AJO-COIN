import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken, requireAdmin } from '../middleware/auth';
import { db } from '../db';
import { DYNAMIC_GAME_CONFIG, updateDynamicConfig } from '../config';

export const adminRouter = Router();

// GET admin overview dashboard analytics
adminRouter.get('/overview', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await db.user.count();
    const activeWallets = await db.wallet.count();
    const totalTapsResult = await db.gameStats.aggregate({ _sum: { totalTaps: true, totalGarlicHarvested: true, totalBoxesCompleted: true, totalAjoEarned: true } });
    const antiCheatAlerts = await db.antiCheatEvent.count();

    const recentUsers = await db.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { gameStats: true, gameCurrency: true, wallet: true },
    });

    const recentAntiCheat = await db.antiCheatEvent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, telegramId: true } } },
    });

    res.json({
      metrics: {
        totalUsers,
        activeWallets,
        totalTaps: totalTapsResult._sum.totalTaps || 0,
        totalGarlic: totalTapsResult._sum.totalGarlicHarvested || 0,
        totalBoxes: totalTapsResult._sum.totalBoxesCompleted || 0,
        totalAjoEarned: totalTapsResult._sum.totalAjoEarned || 0,
        antiCheatAlerts,
      },
      config: DYNAMIC_GAME_CONFIG,
      recentUsers,
      recentAntiCheat,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST update economic game config dynamically
adminRouter.post('/config', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newConfig = req.body;
    updateDynamicConfig(newConfig);

    await db.adminAction.create({
      data: {
        adminId: req.user!.id,
        action: 'UPDATE_GAME_CONFIG',
        details: JSON.stringify(newConfig),
      },
    });

    res.json({
      success: true,
      config: DYNAMIC_GAME_CONFIG,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST ban/suspend user
adminRouter.post('/user/ban', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, isBanned, reason } = req.body;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        isBanned,
        banReason: reason || 'Violation of terms',
      },
    });

    await db.adminAction.create({
      data: {
        adminId: req.user!.id,
        action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
        targetId: userId,
        details: reason || '',
      },
    });

    res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST modify user balance / stats manually
adminRouter.post('/user/adjust', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, gcBalance, ajoBalance, rawGarlic } = req.body;

    if (gcBalance !== undefined || ajoBalance !== undefined) {
      await db.gameCurrency.update({
        where: { userId },
        data: {
          ...(gcBalance !== undefined && { gcBalance: Number(gcBalance) }),
          ...(ajoBalance !== undefined && { ajoBalance: Number(ajoBalance) }),
        },
      });
    }

    if (rawGarlic !== undefined) {
      await db.garlicInventory.update({
        where: { userId },
        data: { rawGarlic: Number(rawGarlic) },
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
