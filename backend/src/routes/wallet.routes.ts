import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/wallet
router.get('/', authenticate, requireRole('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.userId },
      include: {
        transactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        withdrawals: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wallet) {
      res.status(404).json({ error: 'Гаманець не знайдено' });
      return;
    }

    res.json(wallet);
  } catch (err) {
    logger.error('GET /wallet error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// POST /api/wallet/withdraw
router.post('/withdraw', authenticate, requireRole('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Вкажіть коректну суму' });
      return;
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!wallet) {
      res.status(404).json({ error: 'Гаманець не знайдено' });
      return;
    }

    if (Number(wallet.availableBalance) < amount) {
      res.status(400).json({
        error: 'Недостатньо коштів',
        available: Number(wallet.availableBalance),
      });
      return;
    }

    // Отримуємо ФОП профіль для реквізитів
    const fop = await prisma.fopProfile.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!fop) {
      res.status(400).json({ error: 'Спочатку заповніть ФОП профіль' });
      return;
    }

    const fee = Math.round(amount * 0.01 * 100) / 100; // 1% комісія
    const netAmount = amount - fee;

    // Транзакція: створюємо withdrawal + оновлюємо баланс
    const [withdrawal] = await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          walletId: wallet.id,
          sellerId: req.user!.userId,
          amount,
          fee,
          netAmount,
          iban: fop.iban,
          bankName: fop.bankName,
          recipientName: fop.fopName,
          status: 'pending',
        },
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { decrement: amount },
        },
      }),
    ]);

    logger.info(`Withdrawal created: ${withdrawal.id}, amount: ${amount}`);

    res.status(201).json({
      message: 'Запит на виведення створено',
      withdrawal: {
        id: withdrawal.id,
        amount,
        fee,
        netAmount,
        status: withdrawal.status,
      },
    });
  } catch (err) {
    logger.error('POST /wallet/withdraw error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

export default router;
