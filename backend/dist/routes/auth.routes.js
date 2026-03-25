"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const encryption_1 = require("../utils/encryption");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
function generateUserDisplayId() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const a = letters[Math.floor(Math.random() * 26)];
    const b = letters[Math.floor(Math.random() * 26)];
    const num = String(Math.floor(1000000 + Math.random() * 9000000));
    return `${a}${b}-${num}`;
}
// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone || typeof phone !== 'string') {
            res.status(400).json({ error: 'Телефон обов\'язковий' });
            return;
        }
        // Перевірка rate limit: максимум 3 OTP за 10 хвилин
        const recentOtps = await prisma_1.prisma.phoneVerification.count({
            where: {
                phone,
                createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
            },
        });
        if (recentOtps >= 3) {
            res.status(429).json({ error: 'Забагато спроб. Зачекайте 10 хвилин' });
            return;
        }
        // Генерація 6-значного OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otpHash = crypto_1.default.createHash('sha256').update(otp).digest('hex');
        await prisma_1.prisma.phoneVerification.create({
            data: {
                phone,
                otpHash,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 хвилин
                ipAddress: req.ip,
            },
        });
        logger_1.logger.info(`OTP sent to ${phone.slice(0, 6)}****`);
        // В development повертаємо код для тестування
        if (process.env.NODE_ENV === 'development') {
            res.json({ message: 'OTP надіслано', otp });
            return;
        }
        // В production тут буде SMS відправка
        res.json({ message: 'OTP надіслано' });
    }
    catch (err) {
        logger_1.logger.error('send-otp error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp, name, city } = req.body;
        if (!phone || !otp) {
            res.status(400).json({ error: 'Телефон і OTP обов\'язкові' });
            return;
        }
        const otpHash = crypto_1.default.createHash('sha256').update(otp).digest('hex');
        // Знаходимо найновіший невикористаний OTP
        const verification = await prisma_1.prisma.phoneVerification.findFirst({
            where: {
                phone,
                otpHash,
                isUsed: false,
                expiresAt: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!verification) {
            // Інкремент спроб для останнього OTP
            const latest = await prisma_1.prisma.phoneVerification.findFirst({
                where: { phone, isUsed: false },
                orderBy: { createdAt: 'desc' },
            });
            if (latest) {
                await prisma_1.prisma.phoneVerification.update({
                    where: { id: latest.id },
                    data: { attempts: { increment: 1 } },
                });
                if (latest.attempts + 1 >= latest.maxAttempts) {
                    await prisma_1.prisma.phoneVerification.update({
                        where: { id: latest.id },
                        data: { isUsed: true },
                    });
                    res.status(400).json({ error: 'Вичерпано спроби. Запросіть новий код' });
                    return;
                }
            }
            res.status(400).json({ error: 'Невірний або прострочений код' });
            return;
        }
        // Позначаємо OTP використаним
        await prisma_1.prisma.phoneVerification.update({
            where: { id: verification.id },
            data: { isUsed: true, usedAt: new Date() },
        });
        // Знаходимо або створюємо користувача
        const phoneHash = (0, encryption_1.hashForSearch)(phone);
        let user = await prisma_1.prisma.user.findUnique({ where: { phoneHash } });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    phoneEncrypted: (0, encryption_1.encrypt)(phone),
                    phoneHash,
                    displayId: generateUserDisplayId(),
                    name: name || null,
                    city: city || null,
                    role: 'SELLER',
                    isVerified: true,
                },
            });
            // Створюємо гаманець для нового юзера
            await prisma_1.prisma.wallet.create({
                data: { userId: user.id },
            });
            logger_1.logger.info(`New user registered: ${user.id}`);
        }
        else if (name || city) {
            // Оновлюємо ім'я/місто якщо передані
            user = await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    ...(name && { name }),
                    ...(city && { city }),
                },
            });
        }
        // Генеруємо токени
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
        const refreshTokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        // Зберігаємо сесію
        await prisma_1.prisma.userSession.create({
            data: {
                userId: user.id,
                refreshTokenHash,
                deviceType: req.headers['user-agent'] || null,
                ipAddress: req.ip,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 днів
            },
        });
        // Оновлюємо lastSeenAt
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastSeenAt: new Date() },
        });
        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                displayId: user.displayId,
                name: user.name,
                city: user.city,
                role: user.role,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified,
            },
        });
    }
    catch (err) {
        logger_1.logger.error('verify-otp error:', err);
        res.status(500).json({ error: 'Помилка сервера' });
    }
});
// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token обов\'язковий' });
            return;
        }
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const refreshTokenHash = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        const session = await prisma_1.prisma.userSession.findUnique({
            where: { refreshTokenHash },
            include: { user: true },
        });
        if (!session || session.expiresAt < new Date()) {
            if (session) {
                await prisma_1.prisma.userSession.delete({ where: { id: session.id } });
            }
            res.status(401).json({ error: 'Сесія закінчилась' });
            return;
        }
        const user = session.user;
        const newAccessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        // Оновлюємо lastActiveAt сесії
        await prisma_1.prisma.userSession.update({
            where: { id: session.id },
            data: { lastActiveAt: new Date() },
        });
        res.json({ accessToken: newAccessToken });
    }
    catch {
        res.status(401).json({ error: 'Невалідний refresh token' });
    }
});
// GET /api/auth/me — Get current user
router.get('/me', async (req, res) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Не авторизовано' });
            return;
        }
        const { verifyAccessToken } = await Promise.resolve().then(() => __importStar(require('../utils/jwt')));
        const payload = verifyAccessToken(header.split(' ')[1]);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, displayId: true, name: true, city: true, role: true, avatarUrl: true, isVerified: true },
        });
        if (!user) {
            res.status(404).json({ error: 'Користувач не знайдений' });
            return;
        }
        res.json(user);
    }
    catch {
        res.status(401).json({ error: 'Невалідний токен' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map