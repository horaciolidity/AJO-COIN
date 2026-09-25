import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { db } from '../db';

const userLastTapMap = new Map<string, { time: number; tapCount: number }>();

export const validateTapSpeed = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next();

  const { count = 1, clientTimestamp } = req.body;
  const now = Date.now();
  const lastState = userLastTapMap.get(userId) || { time: now - 1000, tapCount: 0 };

  const timeDiffMs = Math.max(1, now - lastState.time);
  const tapsPerSecond = (count / timeDiffMs) * 1000;

  // Maximum humanly possible tap rate limit ~15 taps per second
  if (tapsPerSecond > 25 || count > 100) {
    // Record suspicious anti-cheat event
    await db.antiCheatEvent.create({
      data: {
        userId,
        severity: 'HIGH',
        reason: `Excessive tap rate detected: ${tapsPerSecond.toFixed(1)} taps/sec (batch size: ${count})`,
        metadata: JSON.stringify({ count, timeDiffMs, clientTimestamp }),
      }
    });

    return res.status(400).json({ 
      error: 'Tap rate too fast! Anti-cheat triggered. Please tap like a human.',
      antiCheatTriggered: true
    });
  }

  userLastTapMap.set(userId, { time: now, tapCount: count });
  next();
};
