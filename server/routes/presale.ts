import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { db } from '../db';
import { SERVER_CONFIG, DYNAMIC_GAME_CONFIG } from '../config';

export const presaleRouter = Router();

presaleRouter.get('/info', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Calculate total ETH raised from database
    const totalRaised = await db.presaleContribution.aggregate({
      _sum: { amountEth: true },
    });

    const userContrib = await db.presaleContribution.aggregate({
      where: { userId },
      _sum: { amountEth: true, tokenAmount: true },
    });

    const raisedEth = (totalRaised._sum.amountEth || 0) + 42.8; // 42.8 ETH baseline demo raise
    const targetEth = DYNAMIC_GAME_CONFIG.presaleSettings.targetEth;

    res.json({
      tokenName: 'AJO COIN',
      tokenSymbol: 'AJO',
      contractAddress: SERVER_CONFIG.ajoContractAddress,
      network: SERVER_CONFIG.chainName,
      totalSupply: '1,000,000,000 AJO',
      presaleAllocation: '400,000,000 AJO (40%)',
      raisedEth,
      targetEth,
      presaleRate: DYNAMIC_GAME_CONFIG.presaleSettings.rateAjoPerEth,
      launchDateISO: DYNAMIC_GAME_CONFIG.presaleSettings.launchDateISO,
      userContributionEth: userContrib._sum.amountEth || 0,
      userPurchasedAjo: userContrib._sum.tokenAmount || 0,
      userPresaleRank: 428,
      isPresaleActive: DYNAMIC_GAME_CONFIG.presaleSettings.isPresaleActive,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

presaleRouter.post('/buy', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amountEth, walletAddress, txHash } = req.body;

    if (!amountEth || amountEth <= 0 || !walletAddress || !txHash) {
      return res.status(400).json({ error: 'Missing contribution parameters or txHash' });
    }

    const tokenAmount = amountEth * DYNAMIC_GAME_CONFIG.presaleSettings.rateAjoPerEth;

    const contrib = await db.presaleContribution.create({
      data: {
        userId,
        walletAddress,
        amountEth: Number(amountEth),
        tokenAmount,
        txHash,
        status: 'COMPLETED',
      },
    });

    res.json({
      success: true,
      contribution: contrib,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
