"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const encryption_1 = require("../utils/encryption");
const logger_1 = require("../utils/logger");
const socket_1 = require("../socket");
const router = (0, express_1.Router)();
// POST /api/qr/generate/:orderId
router.post('/generate/:orderId', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId },
            include: { qrToken: true },
        });
        if (!order || order.buyerId !== req.user.userId) {
            res.status(404).json({ error: 'Замовлення не знайдено' });
            return;
        }
        if (order.status !== 'PAID') {
            res.status(400).json({ error: 'Замовлення не оплачене' });
            return;
        }
        // Return existing token if valid
        if (order.qrToken && !order.qrToken.isUsed && new Date(order.qrToken.expiresAt) > new Date()) {
            res.json({ token: order.qrToken.token, expiresAt: order.qrToken.expiresAt, orderId });
            return;
        }
        const token = (0, encryption_1.generateSecureToken)(32);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const qrToken = await prisma_1.prisma.qrToken.create({
            data: { orderId, token, expiresAt },
        });
        res.json({ token: qrToken.token, expiresAt: qrToken.expiresAt, orderId });
    }
    catch (err) {
        logger_1.logger.error('POST /qr/generate error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// POST /api/qr/verify
router.post('/verify', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('SELLER', 'ADMIN'), async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: 'Токен обов\'язковий' });
            return;
        }
        const qrToken = await prisma_1.prisma.qrToken.findUnique({
            where: { token },
            include: {
                order: {
                    include: {
                        deal: true,
                        buyer: { select: { id: true, name: true, city: true } },
                    },
                },
            },
        });
        if (!qrToken) {
            res.status(404).json({ error: 'QR код не знайдено' });
            return;
        }
        if (qrToken.isUsed) {
            res.status(400).json({ error: 'QR код вже використано' });
            return;
        }
        if (new Date(qrToken.expiresAt) < new Date()) {
            res.status(400).json({ error: 'QR код прострочений' });
            return;
        }
        if (qrToken.order.deal.sellerId !== req.user.userId) {
            res.status(403).json({ error: 'Це замовлення не для вас' });
            return;
        }
        // Mark as used and complete order
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.qrToken.update({
                where: { id: qrToken.id },
                data: { isUsed: true, usedAt: new Date(), usedBy: req.user.userId },
            }),
            prisma_1.prisma.order.update({
                where: { id: qrToken.order.id },
                data: { status: 'COMPLETED', completedAt: new Date() },
            }),
        ]);
        // Notify buyer in real-time
        try {
            const io = (0, socket_1.getIO)();
            io.to(`user:${qrToken.order.buyerId}`).emit('order:completed', {
                orderId: qrToken.order.id,
                dealTitle: qrToken.order.deal.title,
            });
        }
        catch { }
        logger_1.logger.info(`QR verified: order ${qrToken.order.id}`);
        res.json({
            success: true,
            order: {
                id: qrToken.order.id,
                buyer: qrToken.order.buyer.name,
                item: qrToken.order.deal.title,
                quantity: qrToken.order.quantity,
                amount: Number(qrToken.order.amount),
                unit: qrToken.order.deal.unit,
            },
        });
    }
    catch (err) {
        logger_1.logger.error('POST /qr/verify error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
exports.default = router;
//# sourceMappingURL=qr.routes.js.map