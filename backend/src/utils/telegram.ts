import { logger } from './logger';

const BOT_TOKEN = "8778237684:AAG81-EM0ZMbdFUd6x6id1xpSvAVN_WagNo";
const SERVER_URL = process.env.SERVER_URL || "https://iscup-production-25c2.up.railway.app";

// In-memory stores
const phoneChats = new Map<string, number>();
const authSessions = new Map<string, { phone: string; otp: string; createdAt: number; sent?: boolean }>();

// Auth sessions for token-based /start
export function createAuthSession(phone: string, otp: string): string {
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  authSessions.set(token, { phone, otp, createdAt: Date.now() });
  logger.info(`Auth session: ${token} for ***${phone.slice(-4)}`);
  return token;
}

export function getAuthSession(token: string) {
  return authSessions.get(token) || null;
}

export function saveChatId(phone: string, chatId: number) {
  phoneChats.set(phone.replace(/\D/g, ''), chatId);
  logger.info(`Saved chat_id ${chatId} for phone ***${phone.slice(-4)}`);
}

export function getChatId(phone: string): number | undefined {
  return phoneChats.get(phone.replace(/\D/g, ''));
}

export async function sendOtpViaTelegram(phone: string, otp: string): Promise<boolean> {
  const chatId = getChatId(phone);
  if (!chatId) {
    logger.warn(`No Telegram chat_id for phone ***${phone.slice(-4)}`);
    return false;
  }

  try {
    const message = `🔐 Ваш код підтвердження Spil: *${otp}*\n\nДійсний 5 хвилин. Не повідомляйте нікому.`;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      logger.error('Telegram send error:', err);
      return false;
    }

    logger.info(`OTP sent via Telegram to chat_id ${chatId}`);
    return true;
  } catch (err) {
    logger.error('Telegram send error:', err);
    return false;
  }
}

// Process incoming Telegram updates (webhook)
export function processTelegramUpdate(update: any) {
  const message = update.message;
  if (!message?.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const token = parts[1];

    if (token) {
      const session = authSessions.get(token);
      if (session) {
        saveChatId(session.phone, chatId);
        sendTelegramMessage(chatId, `🔐 Your Spil code: *${session.otp}*\n\nEnter this code in the app.`);
        session.sent = true;
        logger.info(`Code sent to ${chatId} via token ${token}`);
      } else {
        sendTelegramMessage(chatId, `⏰ Session expired. Try again in the app.`);
      }
    } else {
      sendTelegramMessage(chatId, `👋 Welcome to Spil bot!\n\n📲 Open the app to sign in.`);
    }
    return;
  }

  // If user sends a phone number directly
  const phoneMatch = text.match(/^\+?\d{10,13}$/);
  if (phoneMatch) {
    saveChatId(text, chatId);
    sendTelegramMessage(chatId, `✅ Номер ${text} прив'язано! Тепер OTP коди будуть приходити сюди.`);
    return;
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
  } catch (err) {
    logger.error('Telegram message error:', err);
  }
}

// Setup webhook for Telegram
export async function setupTelegramWebhook(serverUrl?: string) {
  const url = serverUrl || SERVER_URL;
  const webhookUrl = `${url}/api/telegram/webhook`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    });

    const data = await res.json();
    logger.info('Telegram webhook setup:', data);
  } catch (err) {
    logger.error('Telegram webhook setup error:', err);
  }
}
