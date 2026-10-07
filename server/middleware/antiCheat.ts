import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { db } from '../db';

// In-memory tap tracker for rapid pattern detection
const tapHistoryMap = new Map<string, { lastTapTime: number; rapidCount: number }>();

/**
 * Risk Score & Anti-Cheat Engine Middleware
 * Non-blocking: logs suspicious patterns and calculates risk_score (0-100)
 * without destroying normal gameplay experience.
 */
export const validateTapSpeed = async (req: AuthenticatedRequest, res: Response, Next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return Next();

    const { count = 1 } = req.body;
    const now = Date.now();

    // Max physical tap count per batch sanity check
    if (count > 50) {
      // Record AntiCheat event
      await db.antiCheatEvent.create({
        data: {
          userId,
          severity: 'MEDIUM',
          reason: `Abnormal batch tap count: ${count}`,
          metadata: JSON.stringify({ count, timestamp: now }),
        },
      });

      // Update Risk Profile
      await incrementUserRiskScore(userId, 15, `Batch count overflow (${count})`);
    }

    // Interval tracking
    const history = tapHistoryMap.get(userId) || { lastTapTime: now, rapidCount: 0 };
    const elapsed = now - history.lastTapTime;

    if (elapsed < 30 && count > 15) {
      history.rapidCount++;
      if (history.rapidCount > 5) {
        await incrementUserRiskScore(userId, 10, 'Inhuman tap interval frequency');
        history.rapidCount = 0;
      }
    } else {
      history.rapidCount = Math.max(0, history.rapidCount - 1);
    }

    history.lastTapTime = now;
    tapHistoryMap.set(userId, history);

    return Next();
  } catch (err) {
    // Fail-open to avoid disrupting active gameplay
    return Next();
  }
};

/**
 * Helper to update user risk score (0 - 100) & risk status
 */
export async function incrementUserRiskScore(userId: string, points: number, reason: string) {
  try {
    const current = await db.userRiskProfile.findUnique({ where: { userId } });
    const currentScore = current?.riskScore || 0;
    const newScore = Math.min(100, Math.max(0, currentScore + points));

    let status = 'NORMAL';
    if (newScore >= 85) status = 'RESTRICTED';
    else if (newScore >= 60) status = 'REVIEW';
    else if (newScore >= 30) status = 'WATCH';

    await db.userRiskProfile.upsert({
      where: { userId },
      update: {
        riskScore: newScore,
        status,
        suspiciousTaps: { increment: points > 0 ? 1 : 0 },
        notes: reason,
      },
      create: {
        userId,
        riskScore: newScore,
        status,
        suspiciousTaps: 1,
        notes: reason,
      },
    });
  } catch (e) {
    // Silently ignore DB risk logging error
  }
}
