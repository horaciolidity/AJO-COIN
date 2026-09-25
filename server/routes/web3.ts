import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { db } from '../db';
import { SERVER_CONFIG } from '../config';

export const web3Router = Router();

const userNonces = new Map<string, string>();

// GET nonce for wallet signature authentication
web3Router.get('/nonce', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const nonce = 'AJO_SIGN_' + Math.random().toString(36).substring(2, 12);
  userNonces.set(userId, nonce);
  res.json({ nonce, message: `Sign this message to bind wallet to AJO COIN:\nNonce: ${nonce}` });
});

// POST bind EVM wallet to account
web3Router.post('/connect-wallet', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { address, chainId = SERVER_CONFIG.chainId, signature } = req.body;

    if (!address || !address.startsWith('0x')) {
      return res.status(400).json({ error: 'Valid EVM wallet address required' });
    }

    // Upsert user's wallet
    const wallet = await db.wallet.upsert({
      where: { userId },
      update: {
        address,
        chainId: Number(chainId),
        connectedAt: new Date(),
      },
      create: {
        userId,
        address,
        chainId: Number(chainId),
      },
    });

    // Check Connect Wallet quest
    const walletQuest = await db.quest.findUnique({ where: { code: 'CONNECT_WALLETS' } });
    if (walletQuest) {
      await db.userQuest.upsert({
        where: { userId_questId: { userId, questId: walletQuest.id } },
        create: {
          userId,
          questId: walletQuest.id,
          progress: 1,
          isCompleted: true,
        },
        update: {
          progress: 1,
          isCompleted: true,
        },
      });
    }

    res.json({
      success: true,
      wallet: {
        address: wallet.address,
        chainId: wallet.chainId,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST execute/record on-chain AJO token claim
web3Router.post('/claim-onchain', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amountAjo, walletAddress, txHash } = req.body;

    const userCurr = await db.gameCurrency.findUnique({ where: { userId } });
    if (!userCurr || userCurr.ajoBalance < amountAjo || amountAjo <= 0) {
      return res.status(400).json({ error: 'Insufficient AJO balance to claim' });
    }

    // Create TokenClaim record
    const claim = await db.tokenClaim.create({
      data: {
        userId,
        amountAjo: Number(amountAjo),
        walletAddress,
        txHash: txHash || `0x_SIMULATED_CLAIM_TX_${Date.now()}`,
        status: 'CONFIRMED',
      },
    });

    // Deduct virtual AJO balance after claim
    const updatedCurrency = await db.gameCurrency.update({
      where: { userId },
      data: { ajoBalance: { decrement: Number(amountAjo) } },
    });

    res.json({
      success: true,
      claim,
      currency: updatedCurrency,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
