import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { db } from '../db';

export const questsRouter = Router();

questsRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const allQuests = await db.quest.findMany();
    const userQuests = await db.userQuest.findMany({ where: { userId } });
    const userStats = await db.gameStats.findUnique({ where: { userId } });
    const userWallet = await db.wallet.findUnique({ where: { userId } });

    const questsList = allQuests.map((q: any) => {
      const uq = userQuests.find((u: any) => u.questId === q.id);

      // Compute dynamic progress based on user stats
      let calculatedProgress = uq ? uq.progress : 0;
      if (userStats) {
        if (q.questType === 'TAPS') calculatedProgress = Math.min(q.targetValue, userStats.totalTaps);
        else if (q.questType === 'HARVEST') calculatedProgress = Math.min(q.targetValue, userStats.totalGarlicHarvested);
        else if (q.questType === 'BOX') calculatedProgress = Math.min(q.targetValue, userStats.totalBoxesCompleted);
        else if (q.questType === 'WALLET' && userWallet) calculatedProgress = 1;
      }

      const isCompleted = calculatedProgress >= q.targetValue;
      const isClaimed = uq ? uq.isClaimed : false;

      return {
        id: q.id,
        code: q.code,
        title: q.title,
        description: q.description,
        rewardGc: q.rewardGc,
        rewardAjo: q.rewardAjo,
        progress: calculatedProgress,
        targetValue: q.targetValue,
        isCompleted,
        isClaimed,
        questType: q.questType,
      };
    });

    res.json(questsList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

questsRouter.post('/claim', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { questId } = req.body;

    const quest = await db.quest.findUnique({ where: { id: questId } });
    if (!quest) return res.status(404).json({ error: 'Quest not found' });

    let uq = await db.userQuest.findUnique({
      where: { userId_questId: { userId, questId } },
    });

    if (uq && uq.isClaimed) {
      return res.status(400).json({ error: 'Reward already claimed' });
    }

    // Award rewards
    const updatedCurrency = await db.gameCurrency.update({
      where: { userId },
      data: {
        gcBalance: { increment: quest.rewardGc },
        ajoBalance: { increment: quest.rewardAjo },
      },
    });

    if (uq) {
      await db.userQuest.update({
        where: { id: uq.id },
        data: { isCompleted: true, isClaimed: true, claimedAt: new Date() },
      });
    } else {
      await db.userQuest.create({
        data: {
          userId,
          questId,
          progress: quest.targetValue,
          isCompleted: true,
          isClaimed: true,
          claimedAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      rewardGc: quest.rewardGc,
      rewardAjo: quest.rewardAjo,
      currency: updatedCurrency,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
