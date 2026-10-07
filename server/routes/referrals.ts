import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { db } from '../db';
import { SERVER_CONFIG, DYNAMIC_GAME_CONFIG } from '../config';

export const referralsRouter = Router();

// Qualification requirements
const QUALIFICATION_CRITERIA = {
  minBoxesCompleted: 5,
  minTotalTaps: 100,
  maxDailyReferrals: 50,
};

/**
 * GET /api/referrals
 * Get user referral stats with Referral Qualification (PENDING / QUALIFIED / REJECTED)
 */
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
            gameStats: {
              select: {
                totalBoxesCompleted: true,
                totalTaps: true,
              },
            },
          },
        },
      },
    });

    // Fetch qualification status for each referral
    const qualRecords = await db.referralQualification.findMany({
      where: {
        referralId: { in: referrals.map((r: any) => r.id) },
      },
    });

    const qualMap = new Map(qualRecords.map((q: any) => [q.referralId, q]));

    let qualifiedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    const formattedReferrals = referrals.map((r: any) => {
      const q = qualMap.get(r.id);
      const boxes = r.referred.gameStats?.totalBoxesCompleted || 0;
      const taps = r.referred.gameStats?.totalTaps || 0;

      const isEligible = boxes >= QUALIFICATION_CRITERIA.minBoxesCompleted && taps >= QUALIFICATION_CRITERIA.minTotalTaps;
      const status = q?.status || (isEligible ? 'QUALIFIED' : 'PENDING');

      if (status === 'QUALIFIED') qualifiedCount++;
      else if (status === 'REJECTED') rejectedCount++;
      else pendingCount++;

      return {
        id: r.referred.id,
        username: r.referred.username,
        firstName: r.referred.firstName,
        photoUrl: r.referred.photoUrl,
        joinedAt: r.createdAt,
        status,
        boxesCompleted: boxes,
        totalTaps: taps,
        progressPercent: Math.min(100, Math.floor(((boxes / QUALIFICATION_CRITERIA.minBoxesCompleted) * 0.5 + (taps / QUALIFICATION_CRITERIA.minTotalTaps) * 0.5) * 100)),
      };
    });

    const referralLink = `https://t.me/${SERVER_CONFIG.telegramBotUsername}?start=ref_${user.referralCode}`;
    const totalGcEarned = qualifiedCount * DYNAMIC_GAME_CONFIG.referralRewards.tier1;

    res.json({
      referralCode: user.referralCode,
      referralLink,
      invitedCount: referrals.length,
      qualifiedCount,
      pendingCount,
      rejectedCount,
      totalGcEarned,
      qualificationCriteria: QUALIFICATION_CRITERIA,
      referrals: formattedReferrals,
      tiers: [
        { level: 1, count: qualifiedCount, rewardPerRef: DYNAMIC_GAME_CONFIG.referralRewards.tier1 },
        { level: 2, count: 0, rewardPerRef: DYNAMIC_GAME_CONFIG.referralRewards.tier2 },
        { level: 3, count: 0, rewardPerRef: DYNAMIC_GAME_CONFIG.referralRewards.tier3 },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/referrals/check-qualifications
 * Batch evaluate and qualify eligible referrals for the current user
 */
referralsRouter.post('/check-qualifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const referrals = await db.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          include: {
            gameStats: true,
          },
        },
      },
    });

    let newlyQualifiedCount = 0;
    let bonusGc = 0;

    for (const ref of referrals) {
      const boxes = ref.referred.gameStats?.totalBoxesCompleted || 0;
      const taps = ref.referred.gameStats?.totalTaps || 0;

      if (boxes >= QUALIFICATION_CRITERIA.minBoxesCompleted && taps >= QUALIFICATION_CRITERIA.minTotalTaps) {
        const existingQual = await db.referralQualification.findUnique({
          where: { referralId: ref.id },
        });

        if (!existingQual || existingQual.status === 'PENDING') {
          await db.referralQualification.upsert({
            where: { referralId: ref.id },
            update: {
              status: 'QUALIFIED',
              qualifiedAt: new Date(),
              boxesCompleted: boxes,
            },
            create: {
              referralId: ref.id,
              status: 'QUALIFIED',
              qualifiedAt: new Date(),
              boxesCompleted: boxes,
            },
          });

          newlyQualifiedCount++;
          bonusGc += DYNAMIC_GAME_CONFIG.referralRewards.tier1;
        }
      }
    }

    if (newlyQualifiedCount > 0) {
      await db.gameCurrency.update({
        where: { userId },
        data: { gcBalance: { increment: bonusGc } },
      });
    }

    res.json({
      success: true,
      newlyQualifiedCount,
      bonusGc,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
