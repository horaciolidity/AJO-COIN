import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { SERVER_CONFIG } from '../config';

export const authRouter = Router();

authRouter.post('/telegram', async (req: Request, res: Response) => {
  try {
    const { telegramUser, referralCode } = req.body;

    if (!telegramUser || !telegramUser.id) {
      return res.status(400).json({ error: 'Telegram user object is required' });
    }

    const telegramId = BigInt(telegramUser.id);
    let user = await db.user.findUnique({
      where: { telegramId },
      include: {
        gameStats: true,
        garlicInventory: true,
        gameCurrency: true,
        wallet: true,
      },
    });

    if (!user) {
      // Generate unique referral code for new user
      const userRefCode = 'AJO-' + Math.random().toString(36).substring(2, 7).toUpperCase();

      // Check if referred by another user
      let referrerId: string | undefined = undefined;
      if (referralCode) {
        const referrer = await db.user.findUnique({ where: { referralCode } });
        if (referrer) {
          referrerId = referrer.id;
        }
      }

      user = await db.user.create({
        data: {
          telegramId,
          username: telegramUser.username || `Farmer_${telegramUser.id}`,
          firstName: telegramUser.first_name || 'Farmer',
          lastName: telegramUser.last_name,
          photoUrl: telegramUser.photo_url,
          referralCode: userRefCode,
          referredById: referrerId,
          telegramProfile: {
            create: {
              telegramId,
              username: telegramUser.username,
              firstName: telegramUser.first_name,
              languageCode: telegramUser.language_code,
              isPremium: telegramUser.is_premium || false,
            },
          },
          gameStats: {
            create: {
              level: 1,
              xp: 0,
              energy: 1000,
              maxEnergy: 1000,
              tapsPerGarlic: 100,
            },
          },
          garlicInventory: {
            create: {
              rawGarlic: 0,
            },
          },
          gameCurrency: {
            create: {
              gcBalance: 500, // Welcome bonus 500 GC
              ajoBalance: 0.0,
            },
          },
          garlicBoxes: {
            create: {
              boxType: 'BASIC',
              capacity: 100,
              currentCount: 0,
            },
          },
        },
        include: {
          gameStats: true,
          garlicInventory: true,
          gameCurrency: true,
          wallet: true,
        },
      });

      // Record referral reward if applicable
      if (referrerId) {
        await db.referral.create({
          data: {
            referrerId,
            referredId: user.id,
            tier: 1,
            rewardGc: 500,
          },
        });
        // Add 500 GC to referrer
        await db.gameCurrency.update({
          where: { userId: referrerId },
          data: { gcBalance: { increment: 500 } },
        });
      }

      // Unlock Early Farmer achievement
      const earlyAch = await db.achievement.findUnique({ where: { code: 'EARLY_FARMER' } });
      if (earlyAch) {
        await db.userAchievement.create({
          data: { userId: user.id, achievementId: earlyAch.id },
        });
      }
    } else {
      // Update basic details if changed
      await db.user.update({
        where: { id: user.id },
        data: {
          username: telegramUser.username || user.username,
          firstName: telegramUser.first_name || user.firstName,
          photoUrl: telegramUser.photo_url || user.photoUrl,
        },
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: `Account suspended: ${user.banReason || 'Rule violation'}` });
    }

    const token = jwt.sign(
      {
        id: user.id,
        telegramId: user.telegramId?.toString(),
        username: user.username,
        isAdmin: user.isAdmin,
      },
      SERVER_CONFIG.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        photoUrl: user.photoUrl,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin,
      },
      wallet: user.wallet,
    });
  } catch (err: any) {
    console.error('Auth error:', err);
    res.status(500).json({ error: err.message || 'Authentication failed' });
  }
});
