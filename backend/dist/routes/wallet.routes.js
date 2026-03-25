"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// GET /api/wallet
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_2.requireRole)('SELLER', 'ADMIN'), async (req, res) => {
    try {
        const wallet = await prisma_1.prisma.wallet.findUnique({
            where: { userId: req.user.userId },
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
    }
    catch (err) {
        logger_1.logger.error('GET /wallet error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// POST /api/wallet/withdraw
router.post('/withdraw', auth_middleware_1.authenticate, (0, auth_middleware_2.requireRole)('SELLER', 'ADMIN'), async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            res.status(400).json({ error: 'Вкажіть коректну суму' });
            return;
        }
        const wallet = await prisma_1.prisma.wallet.findUnique({
            where: { userId: req.user.userId },
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
        const fop = await prisma_1.prisma.fopProfile.findUnique({
            where: { userId: req.user.userId },
        });
        if (!fop) {
            res.status(400).json({ error: 'Спочатку заповніть ФОП профіль' });
            return;
        }
        const fee = Math.round(amount * 0.01 * 100) / 100; // 1% комісія
        const netAmount = amount - fee;
        // Транзакція: створюємо withdrawal + оновлюємо баланс
        const [withdrawal] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.withdrawal.create({
                data: {
                    walletId: wallet.id,
                    sellerId: req.user.userId,
                    amount,
                    fee,
                    netAmount,
                    iban: fop.iban,
                    bankName: fop.bankName,
                    recipientName: fop.fopName,
                    status: 'pending',
                },
            }),
            prisma_1.prisma.wallet.update({
                where: { id: wallet.id },
                data: {
                    availableBalance: { decrement: amount },
                },
            }),
        ]);
        logger_1.logger.info(`Withdrawal created: ${withdrawal.id}, amount: ${amount}`);
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
    }
    catch (err) {
        logger_1.logger.error('POST /wallet/withdraw error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
exports.default = router;
//# sourceMappingURL=wallet.routes.js.map