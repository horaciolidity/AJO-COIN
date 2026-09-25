import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { db } from '../db';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category = 'global' } = req.query; // 'global' | 'weekly' | 'daily'

    const topUsers = await db.user.findMany({
      take: 100,
      where: { isBanned: false },
      include: {
        gameStats: true,
        garlicInventory: true,
        gameCurrency: true,
      },
      orderBy: {
        gameStats: {
          totalBoxesCompleted: 'desc',
        },
      },
    });

    const leaderboard = topUsers.map((u: any, index: number) => ({
      rank: index + 1,
      userId: u.id,
      username: u.username || `Farmer_${u.id.substring(0, 4)}`,
      firstName: u.firstName || 'Farmer',
      photoUrl: u.photoUrl,
      totalGarlic: u.gameStats?.totalGarlicHarvested || 0,
      totalBoxes: u.gameStats?.totalBoxesCompleted || 0,
      totalAjo: u.gameCurrency?.ajoBalance || 0,
    }));

    // Find current user rank
    let userRank = leaderboard.findIndex((item: any) => item.userId === userId) + 1;
    if (userRank === 0) userRank = 428; // default fallback rank

    res.json({
      category,
      leaderboard,
      currentUserRank: userRank,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
