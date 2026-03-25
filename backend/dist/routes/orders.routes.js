"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const socket_1 = require("../socket");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// POST /api/orders — Create order (join a deal)
router.post('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { dealId, quantity } = req.body;
        if (!dealId || !quantity || quantity < 1) {
            res.status(400).json({ error: 'dealId та quantity обов\'язкові' });
            return;
        }
        const deal = await prisma_1.prisma.deal.findUnique({ where: { id: dealId } });
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
        // Check if already ordered
        const existing = await prisma_1.prisma.order.findFirst({
            where: { dealId, buyerId: req.user.userId, status: { in: ['PENDING', 'PAID'] } },
        });
        if (existing) {
            res.status(400).json({ error: 'Ви вже долучились до цієї пропозиції' });
            return;
        }
        const amount = Number(deal.groupPrice) * quantity;
        const order = await prisma_1.prisma.order.create({
            data: {
                dealId,
                buyerId: req.user.userId,
                quantity,
                amount,
                status: 'PAID',
            },
        });
        await prisma_1.prisma.payment.create({
            data: {
                orderId: order.id,
                buyerId: req.user.userId,
                amount,
                idempotencyKey: crypto_1.default.randomUUID(),
                status: 'completed',
                paidAt: new Date(),
            },
        });
        await prisma_1.prisma.deal.update({
            where: { id: dealId },
            data: { joined: { increment: quantity } },
        });
        // Emit real-time update
        try {
            const io = (0, socket_1.getIO)();
            io.to(`deal:${dealId}`).emit('deal:update', { dealId, joined: deal.joined + quantity });
        }
        catch { }
        const fullOrder = await prisma_1.prisma.order.findUnique({
            where: { id: order.id },
            include: { deal: { include: { seller: { select: { name: true, city: true } } } } },
        });
        logger_1.logger.info(`Order created: ${order.id} by ${req.user.userId}`);
        res.status(201).json(fullOrder);
    }
    catch (err) {
        logger_1.logger.error('POST /orders error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// GET /api/orders/my — Buyer's orders
router.get('/my', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const orders = await prisma_1.prisma.order.findMany({
            where: { buyerId: req.user.userId },
            include: {
                deal: { include: { seller: { select: { name: true, city: true, avatarUrl: true } } } },
                qrToken: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    }
    catch (err) {
        logger_1.logger.error('GET /orders/my error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// GET /api/orders/seller — Seller's incoming orders
router.get('/seller', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('SELLER', 'ADMIN'), async (req, res) => {
    try {
        const orders = await prisma_1.prisma.order.findMany({
            where: { deal: { sellerId: req.user.userId } },
            include: {
                deal: { select: { title: true, unit: true, groupPrice: true } },
                buyer: { select: { name: true, city: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    }
    catch (err) {
        logger_1.logger.error('GET /orders/seller error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.routes.js.map