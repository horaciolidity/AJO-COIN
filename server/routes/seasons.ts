import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { db } from '../db';

/**
 * Seasons API Router - Handles Season states, AJO Points & Admin management
 */
export const seasonsRouter = Router();

/**
 * GET /api/seasons/active
 * Returns current active season details or fallback default Season 1 info.
 */
seasonsRouter.get('/active', async (req, res: Response) => {
  try {
    let activeSeason = await db.season.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { number: 'desc' },
    });

    if (!activeSeason) {
      // Fallback or seed default Season 1
      const now = new Date();
      const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

      activeSeason = await db.season.upsert({
        where: { number: 1 },
        update: {},
        create: {
          number: 1,
          name: 'Rise of Garlic',
          description: 'Primera Temporada Oficial de AJO Coin. Acumula AJO Points completando cajas y misiones.',
          startDate: now,
          endDate: in15Days,
          status: 'ACTIVE',
          seasonPool: 1000000.0,
        },
      });
    }

    res.json({
      season: activeSeason,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/seasons/my-points
 * Get user's AJO Points and score for the active season.
 */
seasonsRouter.get('/my-points', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const activeSeason = await db.season.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { number: 'desc' },
    });

    if (!activeSeason) {
      return res.json({ ajoPoints: 0, seasonScore: 0, boxesCompleted: 0, questsCompleted: 0 });
    }

    const userState = await db.userSeasonState.findUnique({
      where: {
        userId_seasonId: {
          userId,
          seasonId: activeSeason.id,
        },
      },
    });

    res.json({
      seasonNumber: activeSeason.number,
      seasonName: activeSeason.name,
      ajoPoints: userState?.ajoPoints || 0,
      seasonScore: userState?.seasonScore || 0,
      boxesCompleted: userState?.boxesCompleted || 0,
      questsCompleted: userState?.questsCompleted || 0,
      qualifiedReferrals: userState?.qualifiedReferrals || 0,
      streakDays: userState?.streakDays || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/seasons/admin/create
 * Create a new season (Admin only)
 */
seasonsRouter.post('/admin/create', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { number, name, description, startDate, endDate, seasonPool } = req.body;

    const newSeason = await db.season.create({
      data: {
        number: parseInt(number),
        name: name || `Season ${number}`,
        description: description || '',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'UPCOMING',
        seasonPool: parseFloat(seasonPool || '0'),
      },
    });

    res.json({ success: true, season: newSeason });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
