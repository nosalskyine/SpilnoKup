import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { encrypt, hashForSearch, generateSecureToken } from '../utils/encryption';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import { sendOtpViaTelegram, createAuthSession } from '../utils/telegram';

const router = Router();

function generateUserDisplayId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const a = letters[Math.floor(Math.random() * 26)];
  const b = letters[Math.floor(Math.random() * 26)];
  const num = String(Math.floor(1000000 + Math.random() * 9000000));
  return `${a}${b}-${num}`;
}

// POST /api/auth/send-otp
function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-\(\)]/g, '');
  if (p.startsWith('8') && p.length === 10) p = '+380' + p.slice(1);
  if (p.startsWith('0') && p.length === 10) p = '+380' + p.slice(1);
  if (p.startsWith('380')) p = '+' + p;
  if (!p.startsWith('+')) p = '+' + p;
  return p;
}

router.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPhone = req.body.phone;
    if (!rawPhone || typeof rawPhone !== 'string') {
      res.status(400).json({ error: 'Телефон обов\'язковий' });
      return;
    }
    const phone = normalizePhone(rawPhone);

    // Перевірка rate limit: максимум 3 OTP за 10 хвилин
    const recentOtps = await prisma.phoneVerification.count({
      where: {
        phone,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });

    if (recentOtps >= 20) {
      res.status(429).json({ error: 'Забагато спроб. Зачекайте 10 хвилин' });
      return;
    }

    // Генерація 6-значного OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    await prisma.phoneVerification.create({
      data: {
        phone,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 хвилин
        ipAddress: req.ip,
      },
    });

    logger.info(`OTP sent to ${phone.slice(0, 6)}****`);

    // Create Telegram auth session + try to send
    const telegramToken = createAuthSession(phone, otp);
    const sentViaTelegram = await sendOtpViaTelegram(phone, otp);

    // В development повертаємо код для тестування
    if (process.env.NODE_ENV === 'development') {
      res.json({ message: 'OTP надіслано', otp, telegram: sentViaTelegram, telegramToken });
      return;
    }

    res.json({
      message: sentViaTelegram ? 'Код надіслано в Telegram' : 'OTP надіслано',
      telegram: sentViaTelegram,
      telegramToken,
    });
  } catch (err) {
    logger.error('send-otp error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone: rawPhone, otp, name, city } = req.body;
    if (!rawPhone || !otp) {
      res.status(400).json({ error: 'Телефон і OTP обов\'язкові' });
      return;
    }
    const phone = normalizePhone(rawPhone);

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Знаходимо найновіший невикористаний OTP
    const verification = await prisma.phoneVerification.findFirst({
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
      const latest = await prisma.phoneVerification.findFirst({
        where: { phone, isUsed: false },
        orderBy: { createdAt: 'desc' },
      });

      if (latest) {
        await prisma.phoneVerification.update({
          where: { id: latest.id },
          data: { attempts: { increment: 1 } },
        });

        if (latest.attempts + 1 >= latest.maxAttempts) {
          await prisma.phoneVerification.update({
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
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    // Знаходимо або створюємо користувача
    const phoneHash = hashForSearch(phone);
    let user = await prisma.user.findUnique({ where: { phoneHash } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneEncrypted: encrypt(phone),
          phoneHash,
          displayId: generateUserDisplayId(),
          name: name || null,
          city: city || null,
          role: 'SELLER',
          isVerified: true,
        },
      });

      // Створюємо гаманець з 10000 грн для нового юзера
      await prisma.wallet.create({
        data: { userId: user.id, availableBalance: 10000 },
      });

      logger.info(`New user registered: ${user.id}`);
    } else if (name || city) {
      // Оновлюємо ім'я/місто якщо передані
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name }),
          ...(city && { city }),
        },
      });
    }

    // Генеруємо токени
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Зберігаємо сесію
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        deviceType: req.headers['user-agent'] || null,
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 днів
      },
    });

    // Оновлюємо lastSeenAt
    await prisma.user.update({
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
  } catch (err) {
    logger.error('verify-otp error:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token обов\'язковий' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await prisma.userSession.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.userSession.delete({ where: { id: session.id } });
      }
      res.status(401).json({ error: 'Сесія закінчилась' });
      return;
    }

    const user = session.user;
    const newAccessToken = generateAccessToken(user.id, user.role);

    // Оновлюємо lastActiveAt сесії
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: 'Невалідний refresh token' });
  }
});

// GET /api/auth/me — Get current user
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Не авторизовано' });
      return;
    }
    const { verifyAccessToken } = await import('../utils/jwt');
    const payload = verifyAccessToken(header.split(' ')[1]);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, displayId: true, name: true, city: true, role: true, avatarUrl: true, isVerified: true },
    });
    if (!user) { res.status(404).json({ error: 'Користувач не знайдений' }); return; }
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Невалідний токен' });
  }
});

export default router;
