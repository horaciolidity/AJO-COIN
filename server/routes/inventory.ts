import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { db } from '../db';
import { DYNAMIC_GAME_CONFIG } from '../config';

export const inventoryRouter = Router();

// GET inventory details & garlic boxes
inventoryRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const inventory = await db.garlicInventory.findUnique({ where: { userId } });
    const boxes = await db.garlicBox.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
    const currency = await db.gameCurrency.findUnique({ where: { userId } });

    res.json({ inventory, boxes, currency });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST sell raw garlic for GC (Garlic Coins)
inventoryRouter.post('/sell', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    const inv = await db.garlicInventory.findUnique({ where: { userId } });
    if (!inv || inv.rawGarlic < amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid garlic amount to sell' });
    }

    const gcPricePerGarlic = DYNAMIC_GAME_CONFIG.garlicSellPriceDefault;
    const totalGcEarned = amount * gcPricePerGarlic;

    // Deduct raw garlic and add GC
    const updatedInv = await db.garlicInventory.update({
      where: { userId },
      data: { rawGarlic: { decrement: amount } },
    });

    const updatedCurr = await db.gameCurrency.update({
      where: { userId },
      data: { gcBalance: { increment: totalGcEarned } },
    });

    await db.transaction.create({
      data: {
        userId,
        type: 'SELL_GARLIC',
        amount: totalGcEarned,
        currency: 'GC',
        description: `Sold ${amount} Raw Garlic for ${totalGcEarned} GC`,
      },
    });

    res.json({
      success: true,
      soldAmount: amount,
      gcEarned: totalGcEarned,
      inventory: updatedInv,
      currency: updatedCurr,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST buy garlic box with GC
inventoryRouter.post('/buy-box', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { boxType } = req.body; // 'BASIC' | 'FARM' | 'MEGA'

    if (!['BASIC', 'FARM', 'MEGA'].includes(boxType)) {
      return res.status(400).json({ error: 'Invalid box type' });
    }

    const price = DYNAMIC_GAME_CONFIG.boxPrices[boxType as keyof typeof DYNAMIC_GAME_CONFIG.boxPrices];
    const capacity = DYNAMIC_GAME_CONFIG.boxCapacities[boxType as keyof typeof DYNAMIC_GAME_CONFIG.boxCapacities];

    const currency = await db.gameCurrency.findUnique({ where: { userId } });
    if (!currency || currency.gcBalance < price) {
      return res.status(400).json({ error: `Insufficient GC balance. Cost: ${price} GC` });
    }

    // Deduct GC and create new GarlicBox
    const updatedCurr = await db.gameCurrency.update({
      where: { userId },
      data: { gcBalance: { decrement: price } },
    });

    const newBox = await db.garlicBox.create({
      data: {
        userId,
        boxType,
        capacity,
        currentCount: 0,
        isFull: false,
      },
    });

    await db.transaction.create({
      data: {
        userId,
        type: 'BUY_BOX',
        amount: price,
        currency: 'GC',
        description: `Purchased ${boxType} Garlic Box for ${price} GC`,
      },
    });

    res.json({
      success: true,
      box: newBox,
      currency: updatedCurr,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST claim AJO from completed full box
inventoryRouter.post('/claim-box-ajo', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { boxId } = req.body;

    const box = await db.garlicBox.findUnique({ where: { id: boxId } });
    if (!box || box.userId !== userId || !box.isFull || box.claimedAjo) {
      return res.status(400).json({ error: 'Box is not full or already claimed' });
    }

    // Mark box claimed and add 1 AJO to virtual balance
    await db.garlicBox.update({
      where: { id: boxId },
      data: { claimedAjo: true },
    });

    const updatedCurr = await db.gameCurrency.update({
      where: { userId },
      data: { ajoBalance: { increment: 1.0 } },
    });

    await db.gameStats.update({
      where: { userId },
      data: { totalAjoEarned: { increment: 1.0 } },
    });

    res.json({
      success: true,
      claimedAjo: 1.0,
      currency: updatedCurr,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
