import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { db } from '../db';
import { SERVER_CONFIG, DYNAMIC_GAME_CONFIG } from '../config';

export const referralsRouter = Router();

referralsRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const referrals = await db.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            username: true,
            firstName: true,
            photoUrl: true,
            createdAt: true,
          },
        },
      },
    });

    const referralLink = `https://t.me/${SERVER_CONFIG.telegramBotUsername}?start=ref_${user.referralCode}`;
    const totalGcEarned = referrals.length * DYNAMIC_GAME_CONFIG.referralRewards.tier1;

    res.json({
      referralCode: user.referralCode,
      referralLink,
      invitedCount: referrals.length,
      activeCount: referrals.length,
      totalGcEarned,
      referrals: referrals.map((r: any) => ({
        id: r.referred.id,
        username: r.referred.username,
        firstName: r.referred.firstName,
        photoUrl: r.referred.photoUrl,
        joinedAt: r.createdAt,
      })),
      tiers: [
        { level: 1, count: referrals.length, rewardPerRef: DYNAMIC_GAME_CONFIG.referralRewards.tier1 },
        { level: 2, count: 0, rewardPerRef: DYNAMIC_GAME_CONFIG.referralRewards.tier2 },
        { level: 3, count: 0, rewardPerRef: DYNAMIC_GAME_CONFIG.referralRewards.tier3 },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
