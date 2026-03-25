"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const socket_1 = require("../socket");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// GET /api/deals/seller/my
router.get('/seller/my', auth_middleware_1.authenticate, (0, auth_middleware_2.requireRole)('SELLER', 'ADMIN'), async (req, res) => {
    try {
        const deals = await prisma_1.prisma.deal.findMany({
            where: { sellerId: req.user.userId },
            include: { _count: { select: { orders: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(deals);
    }
    catch (err) {
        logger_1.logger.error('GET /deals/seller/my error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// GET /api/deals
router.get('/', async (req, res) => {
    try {
        const { category, city, status, sort = 'hot', limit = '20', offset = '0', } = req.query;
        const where = {};
        if (category && category !== 'all')
            where.category = category;
        if (city && city !== 'all')
            where.city = { contains: city };
        if (status)
            where.status = status;
        else
            where.status = client_1.DealStatus.ACTIVE;
        let orderBy;
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
            prisma_1.prisma.deal.findMany({
                where,
                orderBy,
                take: Math.min(parseInt(limit) || 20, 50),
                skip: parseInt(offset) || 0,
                include: {
                    seller: {
                        select: { name: true, city: true, avatarUrl: true },
                    },
                    _count: { select: { orders: true } },
                },
            }),
            prisma_1.prisma.deal.count({ where }),
        ]);
        res.json({
            deals,
            total,
            limit: parseInt(limit) || 20,
            offset: parseInt(offset) || 0,
        });
    }
    catch (err) {
        logger_1.logger.error('GET /deals error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// GET /api/deals/:id
router.get('/:id', async (req, res) => {
    try {
        const deal = await prisma_1.prisma.deal.findUnique({
            where: { id: req.params.id },
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
        await prisma_1.prisma.deal.update({
            where: { id: deal.id },
            data: { views: { increment: 1 } },
        });
        res.json(deal);
    }
    catch (err) {
        logger_1.logger.error('GET /deals/:id error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// POST /api/deals
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_2.requireRole)('SELLER', 'ADMIN'), async (req, res) => {
    try {
        const { title, description, category, retailPrice, groupPrice, unit, minQty, maxQty, needed, deadline, images, tags, city, } = req.body;
        if (!title || !category || !retailPrice || !groupPrice || !unit || !needed || !deadline) {
            res.status(400).json({ error: 'Заповніть всі обов\'язкові поля' });
            return;
        }
        const rp = Number(retailPrice);
        const gp = Number(groupPrice);
        if (gp >= rp) {
            res.status(400).json({ error: 'Групова ціна має бути менше роздрібної' });
            return;
        }
        const deal = await prisma_1.prisma.deal.create({
            data: {
                sellerId: req.user.userId,
                title,
                description: description || null,
                category,
                retailPrice: rp,
                groupPrice: gp,
                unit,
                minQty: parseInt(minQty) || 1,
                maxQty: parseInt(maxQty) || 100,
                needed: parseInt(needed),
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
        logger_1.logger.info(`Deal created: ${deal.id} by ${req.user.userId}`);
        try {
            (0, socket_1.getIO)().emit('deal:new', { dealId: deal.id });
        }
        catch { }
        res.status(201).json(deal);
    }
    catch (err) {
        logger_1.logger.error('POST /deals error:', err?.message || err);
        res.status(500).json({ error: err?.message || 'Помилка сервера' });
    }
});
// DELETE /api/deals/:id
router.delete('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const dealId = req.params.id;
        const deal = await prisma_1.prisma.deal.findUnique({ where: { id: dealId } });
        if (!deal) {
            res.status(404).json({ error: 'Оголошення не знайдено' });
            return;
        }
        if (deal.sellerId !== req.user.userId) {
            res.status(403).json({ error: 'Це не ваше оголошення' });
            return;
        }
        // Delete related records first
        await prisma_1.prisma.qrToken.deleteMany({ where: { order: { dealId } } });
        await prisma_1.prisma.payment.deleteMany({ where: { order: { dealId } } });
        await prisma_1.prisma.order.deleteMany({ where: { dealId } });
        await prisma_1.prisma.review.deleteMany({ where: { dealId } });
        await prisma_1.prisma.auction.deleteMany({ where: { dealId } });
        await prisma_1.prisma.conversation.deleteMany({ where: { dealId } });
        await prisma_1.prisma.deal.delete({ where: { id: dealId } });
        logger_1.logger.info(`Deal deleted: ${dealId} by ${req.user.userId}`);
        try {
            (0, socket_1.getIO)().emit('deal:deleted', { dealId });
        }
        catch { }
        res.json({ success: true });
    }
    catch (err) {
        logger_1.logger.error('DELETE /deals/:id error:', err?.message || err);
        res.status(500).json({ error: err?.message || 'Помилка сервера' });
    }
});
exports.default = router;
//# sourceMappingURL=deals.routes.js.map