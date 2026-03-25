import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { DealStatus } from '@prisma/client';

const router = Router();

// GET /api/deals/seller/my
router.get('/seller/my', authenticate, requireRole('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const deals = await prisma.deal.findMany({
      where: { sellerId: req.user!.userId },
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(deals);
  } catch (err) {
    logger.error('GET /deals/seller/my error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// GET /api/deals
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      city,
      status,
      sort = 'hot',
      limit = '20',
      offset = '0',
    } = req.query;

    const where: any = {};
    if (category && category !== 'all') where.category = category;
    if (city && city !== 'all') where.city = { contains: city as string };
    if (status) where.status = status;
    else where.status = DealStatus.ACTIVE;

    let orderBy: any;
    switch (sort) {
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'price':
        orderBy = { groupPrice: 'asc' };
        break;
      case 'rating':
        orderBy = { views: 'desc' };
        break;
      case 'disc':
        orderBy = { groupPrice: 'asc' };
        break;
      default: // hot
        orderBy = { joined: 'desc' };
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy,
        take: Math.min(parseInt(limit as string) || 20, 50),
        skip: parseInt(offset as string) || 0,
        include: {
          seller: {
            select: { name: true, city: true, avatarUrl: true },
          },
          _count: { select: { orders: true } },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    res.json({
      deals,
      total,
      limit: parseInt(limit as string) || 20,
      offset: parseInt(offset as string) || 0,
    });
  } catch (err) {
    logger.error('GET /deals error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// GET /api/deals/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id as string },
      include: {
        seller: {
          select: { id: true, name: true, city: true, avatarUrl: true },
        },
        _count: { select: { orders: true, reviews: true } },
        auction: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!deal) {
      res.status(404).json({ error: 'Пропозицію не знайдено' });
      return;
    }

    // Інкремент переглядів
    await prisma.deal.update({
      where: { id: deal.id },
      data: { views: { increment: 1 } },
    });

    res.json(deal);
  } catch (err) {
    logger.error('GET /deals/:id error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// POST /api/deals
router.post('/', authenticate, requireRole('SELLER', 'ADMIN'), async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      retailPrice,
      groupPrice,
      unit,
      minQty,
      maxQty,
      needed,
      deadline,
      images,
      tags,
      city,
    } = req.body;

    if (!title || !category || !retailPrice || !groupPrice || !unit || !needed || !deadline) {
      res.status(400).json({ error: 'Заповніть всі обов\'язкові поля' });
      return;
    }

    if (groupPrice >= retailPrice) {
      res.status(400).json({ error: 'Групова ціна має бути менше роздрібної' });
      return;
    }

    const deal = await prisma.deal.create({
      data: {
        sellerId: req.user!.userId,
        title,
        description: description || null,
        category,
        retailPrice,
        groupPrice,
        unit,
        minQty: minQty || 1,
        maxQty: maxQty || 100,
        needed,
        deadline: new Date(deadline),
        images: images || [],
        tags: tags || [],
        city: city || null,
        isNew: true,
      },
      include: {
        seller: { select: { name: true, city: true, avatarUrl: true } },
      },
    });

    logger.info(`Deal created: ${deal.id} by ${req.user!.userId}`);
    res.status(201).json(deal);
  } catch (err) {
    logger.error('POST /deals error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

export default router;
