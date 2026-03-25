import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { getIO } from '../socket';
import crypto from 'crypto';

const router = Router();

// POST /api/orders — Create order (join a deal)
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { dealId, quantity } = req.body;
    if (!dealId || !quantity || quantity < 1) {
      res.status(400).json({ error: 'dealId та quantity обов\'язкові' });
      return;
    }

    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal || deal.status !== 'ACTIVE') {
      res.status(400).json({ error: 'Пропозиція не активна' });
      return;
    }
    if (new Date(deal.deadline) < new Date()) {
      res.status(400).json({ error: 'Термін пропозиції закінчився' });
      return;
    }
    if (quantity < deal.minQty || quantity > deal.maxQty) {
      res.status(400).json({ error: `Кількість має бути від ${deal.minQty} до ${deal.maxQty}` });
      return;
    }
    if (deal.joined + quantity > deal.needed) {
      res.status(400).json({ error: 'Недостатньо місць' });
      return;
    }

    // Check total quantity with existing orders
    const existingOrders = await prisma.order.findMany({
      where: { dealId, buyerId: req.user!.userId, status: { in: ['PENDING', 'PAID'] } },
    });
    const totalBought = existingOrders.reduce((s, o) => s + o.quantity, 0);
    if (totalBought + quantity > deal.maxQty) {
      res.status(400).json({ error: `Ліміт ${deal.maxQty} ${deal.unit}. Вже куплено: ${totalBought}` });
      return;
    }

    const amount = Number(deal.groupPrice) * quantity;

    // Check buyer has enough balance
    const buyerWallet = await prisma.wallet.findUnique({ where: { userId: req.user!.userId } });
    if (!buyerWallet || Number(buyerWallet.availableBalance) < amount) {
      res.status(400).json({ error: `Недостатньо коштів. Баланс: ₴${buyerWallet ? Number(buyerWallet.availableBalance) : 0}` });
      return;
    }

    const order = await prisma.order.create({
      data: {
        dealId,
        buyerId: req.user!.userId,
        quantity,
        amount,
        status: 'PAID',
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        buyerId: req.user!.userId,
        amount,
        idempotencyKey: crypto.randomUUID(),
        status: 'completed',
        paidAt: new Date(),
      },
    });

    // Списати з покупця
    const buyerBefore = Number(buyerWallet.availableBalance);
    await prisma.wallet.update({
      where: { userId: req.user!.userId },
      data: { availableBalance: { decrement: amount } },
    });

    // Записати транзакцію покупця
    await prisma.transaction.create({
      data: {
        walletId: buyerWallet.id,
        orderId: order.id,
        type: 'PAYMENT_HOLD',
        amount,
        netAmount: amount,
        balanceBefore: buyerBefore,
        balanceAfter: buyerBefore - amount,
        description: `Оплата: ${deal.title} × ${quantity}`,
      },
    });

    // Заморозити на рахунку продавця (held)
    const sellerWallet = await prisma.wallet.findUnique({ where: { userId: deal.sellerId } });
    if (sellerWallet) {
      await prisma.wallet.update({
        where: { userId: deal.sellerId },
        data: { heldBalance: { increment: amount } },
      });

      // Записати транзакцію продавця (hold)
      await prisma.transaction.create({
        data: {
          walletId: sellerWallet.id,
          orderId: order.id,
          type: 'PAYMENT_HOLD',
          amount,
          netAmount: amount,
          balanceBefore: Number(sellerWallet.availableBalance),
          balanceAfter: Number(sellerWallet.availableBalance),
          description: `Очікує видачі: ${deal.title}`,
        },
      });
    }

    await prisma.deal.update({
      where: { id: dealId },
      data: { joined: { increment: quantity } },
    });

    // Notify wallets
    try {
      const io = getIO();
      io.to(`user:${req.user!.userId}`).emit('wallet:update');
      io.to(`user:${deal.sellerId}`).emit('wallet:update');
    } catch {}

    // Emit real-time update
    try {
      const io = getIO();
      io.to('public').emit('deal:update', { dealId, joined: deal.joined + quantity });
    } catch {}

    // Auto-confirm if seller enabled it
    if (deal.autoConfirm) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'COMPLETED', completedAt: new Date() } });
      if (sellerWallet) {
        await prisma.wallet.update({
          where: { userId: deal.sellerId },
          data: { heldBalance: { decrement: amount }, availableBalance: { increment: amount }, totalEarned: { increment: amount } },
        });
        await prisma.transaction.create({
          data: { walletId: sellerWallet.id, orderId: order.id, type: 'PAYMENT_RELEASE', amount, netAmount: amount, balanceBefore: Number(sellerWallet.availableBalance), balanceAfter: Number(sellerWallet.availableBalance) + amount, description: `Авто: ${deal.title}` },
        });
      }
      try { getIO().to(`user:${deal.sellerId}`).emit('wallet:update'); } catch {}
    }

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { deal: { include: { seller: { select: { name: true, city: true } } } } },
    });

    logger.info(`Order created: ${order.id} by ${req.user!.userId}`);
    res.status(201).json(fullOrder);
  } catch (err) {
    logger.error('POST /orders error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// GET /api/orders/my — Buyer's orders
router.get('/my', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user!.userId },
      include: {
        deal: { include: { seller: { select: { name: true, city: true, avatarUrl: true } } } },
        qrToken: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    logger.error('GET /orders/my error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// GET /api/orders/seller — Seller's incoming orders
router.get('/seller', authenticate, requireRole('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { deal: { sellerId: req.user!.userId } },
      include: {
        deal: { select: { title: true, unit: true, groupPrice: true } },
        buyer: { select: { name: true, city: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    logger.error('GET /orders/seller error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

export default router;
