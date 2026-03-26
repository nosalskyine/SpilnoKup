import { Router, Request, Response } from 'express';
import { processTelegramUpdate } from '../utils/telegram';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/telegram/webhook - Telegram bot webhook
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    await processTelegramUpdate(req.body);
  } catch (err) {
    logger.error('Telegram webhook error:', err);
  }
  res.json({ ok: true }); // Always return 200 to Telegram
});

// GET /api/telegram/test-send - Debug endpoint
router.get('/test-send', async (req: Request, res: Response) => {
  const { phone, otp } = req.query;
  if (!phone || !otp) {
    res.json({ error: 'Need ?phone=...&otp=...' });
    return;
  }
  const { sendOtpViaTelegram, getChatId } = await import('../utils/telegram');
  const chatId = getChatId(phone as string);
  const sent = await sendOtpViaTelegram(phone as string, otp as string);
  res.json({ sent, chatId: chatId || null, phone });
});

// Support system
const SUPPORT_GROUP_ID = process.env.SUPPORT_GROUP_ID || '-1002304389498';
const BOT_TOKEN = "8778237684:AAG81-EM0ZMbdFUd6x6id1xpSvAVN_WagNo";
const supportReplies = new Map<string, Array<{text: string; time: string}>>();

// POST /api/telegram/support — user sends message
router.post('/support', async (req: Request, res: Response) => {
  try {
    const { message, userName, userPhone } = req.body;
    if (!message) { res.status(400).json({ error: 'Message required' }); return; }

    const userInfo = `${userName || 'User'} (${userPhone || 'no phone'})`;
    const text = `📩 Підтримка\nВід: ${userInfo}\n\n${message}`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: SUPPORT_GROUP_ID, text }),
    });

    logger.info(`Support message from ${userInfo}`);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Support error:', err);
    res.status(500).json({ error: 'Failed to send' });
  }
});

// GET /api/telegram/support/replies — poll for replies
router.get('/support/replies', (req: Request, res: Response) => {
  const { phone } = req.query;
  if (!phone) { res.json({ replies: [] }); return; }
  const key = String(phone).replace(/\D/g, '').slice(-9);
  const replies = supportReplies.get(key) || [];
  if (replies.length > 0) supportReplies.delete(key);
  res.json({ replies });
});

// Store support reply (called from processTelegramUpdate for group replies)
export function addSupportReply(phone: string, text: string) {
  const key = phone.replace(/\D/g, '').slice(-9);
  const arr = supportReplies.get(key) || [];
  arr.push({ text, time: new Date().toISOString() });
  supportReplies.set(key, arr);
  // Also store under other formats
  [phone, '+380' + key.slice(-9), '0' + key.slice(-9)].forEach(k => {
    const nk = k.replace(/\D/g, '').slice(-9);
    if (nk !== key) {
      const a = supportReplies.get(nk) || [];
      a.push({ text, time: new Date().toISOString() });
      supportReplies.set(nk, a);
    }
  });
}

export default router;
