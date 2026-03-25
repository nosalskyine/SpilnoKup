"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const socket_1 = require("../socket");
const router = (0, express_1.Router)();
// GET /api/chat/conversations
router.get('/conversations', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await prisma_1.prisma.conversation.findMany({
            where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
            include: {
                buyer: { select: { id: true, name: true, avatarUrl: true } },
                seller: { select: { id: true, name: true, avatarUrl: true } },
                deal: { select: { id: true, title: true } },
                messages: { take: 1, orderBy: { createdAt: 'desc' } },
            },
            orderBy: { lastMessageAt: 'desc' },
        });
        // Add unread count
        const result = await Promise.all(conversations.map(async (conv) => {
            const unread = await prisma_1.prisma.message.count({
                where: { conversationId: conv.id, senderId: { not: userId }, isRead: false },
            });
            const other = conv.buyerId === userId ? conv.seller : conv.buyer;
            return {
                id: conv.id,
                other,
                deal: conv.deal,
                lastMessage: conv.messages[0] || null,
                unread,
                lastMessageAt: conv.lastMessageAt,
            };
        }));
        res.json(result);
    }
    catch (err) {
        logger_1.logger.error('GET /chat/conversations error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// POST /api/chat/conversations — Create or find conversation
router.post('/conversations', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { sellerId, dealId } = req.body;
        const buyerId = req.user.userId;
        if (!sellerId) {
            res.status(400).json({ error: 'sellerId обов\'язковий' });
            return;
        }
        if (buyerId === sellerId) {
            res.status(400).json({ error: 'Не можна створити чат з собою' });
            return;
        }
        // Find existing or create
        let conversation = await prisma_1.prisma.conversation.findFirst({
            where: { buyerId, sellerId, dealId: dealId || null },
        });
        if (!conversation) {
            conversation = await prisma_1.prisma.conversation.create({
                data: { buyerId, sellerId, dealId: dealId || null },
            });
        }
        res.json(conversation);
    }
    catch (err) {
        logger_1.logger.error('POST /chat/conversations error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// GET /api/chat/:id/messages
router.get('/:id/messages', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.userId;
        const conv = await prisma_1.prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conv || (conv.buyerId !== userId && conv.sellerId !== userId)) {
            res.status(403).json({ error: 'Немає доступу' });
            return;
        }
        const messages = await prisma_1.prisma.message.findMany({
            where: { conversationId },
            include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
            take: 100,
        });
        // Mark unread as read
        await prisma_1.prisma.message.updateMany({
            where: { conversationId, senderId: { not: userId }, isRead: false },
            data: { isRead: true },
        });
        res.json(messages);
    }
    catch (err) {
        logger_1.logger.error('GET /chat/:id/messages error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// POST /api/chat/:id/messages — Send message
router.post('/:id/messages', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.userId;
        const { text } = req.body;
        if (!text || !text.trim()) {
            res.status(400).json({ error: 'Текст обов\'язковий' });
            return;
        }
        const conv = await prisma_1.prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conv || (conv.buyerId !== userId && conv.sellerId !== userId)) {
            res.status(403).json({ error: 'Немає доступу' });
            return;
        }
        const message = await prisma_1.prisma.message.create({
            data: { conversationId, senderId: userId, text: text.trim() },
            include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        });
        await prisma_1.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });
        // Real-time emit
        try {
            const io = (0, socket_1.getIO)();
            io.to(`conversation:${conversationId}`).emit('chat:message', message);
            // Also notify the other user
            const otherId = conv.buyerId === userId ? conv.sellerId : conv.buyerId;
            io.to(`user:${otherId}`).emit('chat:new', { conversationId, message });
        }
        catch { }
        res.status(201).json(message);
    }
    catch (err) {
        logger_1.logger.error('POST /chat/:id/messages error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
exports.default = router;
//# sourceMappingURL=chat.routes.js.map