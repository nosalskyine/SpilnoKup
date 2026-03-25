"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveChatId = saveChatId;
exports.getChatId = getChatId;
exports.sendOtpViaTelegram = sendOtpViaTelegram;
exports.processTelegramUpdate = processTelegramUpdate;
exports.setupTelegramWebhook = setupTelegramWebhook;
exports.createAuthSession = createAuthSession;
exports.getAuthSession = getAuthSession;
const logger_1 = require("./logger");
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8778237684:AAG81-EM0ZMbdFUd6x6id1xpSvAVN_WagNo";
const phoneChats = new Map();
// Auth sessions: token -> { phone, otp }
const authSessions = new Map();
function createAuthSession(phone, otp) {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    authSessions.set(token, { phone, otp, createdAt: Date.now() });
    logger_1.logger.info(`Auth session created: ${token} for ***${phone.slice(-4)}`);
    return token;
}
function getAuthSession(token) {
    return authSessions.get(token) || null;
}
function saveChatId(phone, chatId) {
    phoneChats.set(phone.replace(/\D/g, ''), chatId);
    logger_1.logger.info(`Saved chat_id ${chatId} for phone ***${phone.slice(-4)}`);
}
function getChatId(phone) {
    return phoneChats.get(phone.replace(/\D/g, ''));
}
async function sendOtpViaTelegram(phone, otp) {
    const chatId = getChatId(phone);
    if (!chatId) {
        logger_1.logger.warn(`No Telegram chat_id for phone ***${phone.slice(-4)}`);
        return false;
    }
    try {
        const message = `🔐 Ваш код підтвердження Spil: *${otp}*\n\nДійсний 5 хвилин. Не повідомляйте нікому.`;
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
        });
        if (!res.ok) {
            const err = await res.json();
            logger_1.logger.error('Telegram send error:', err);
            return false;
        }
        logger_1.logger.info(`OTP sent via Telegram to chat_id ${chatId}`);
        return true;
    }
    catch (err) {
        logger_1.logger.error('Telegram send error:', err);
        return false;
    }
}
function processTelegramUpdate(update) {
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
                // Found session - save chat_id and send OTP
                saveChatId(session.phone, chatId);
                sendTelegramMessage(chatId, `✅ Номер прив'язано!\n\n🔐 Ваш код підтвердження: *${session.otp}*\n\nВведіть цей код у додатку Spil.`);
                logger_1.logger.info(`Auth session ${token} used by chat_id ${chatId}`);
            } else {
                sendTelegramMessage(chatId, `❌ Сесія не знайдена або застаріла.\n\nПоверніться до додатку Spil і спробуйте знову.`);
            }
        } else {
            sendTelegramMessage(chatId, `👋 Привіт! Це бот СпільноКуп.\n\n📲 Щоб увійти, відкрийте додаток Spil, введіть номер телефону і натисніть "Відкрити Telegram".\n\nБот автоматично надішле вам код підтвердження.`);
        }
        return;
    }
    // If user sends a phone number directly
    const phoneMatch = text.match(/^\+?\d{10,13}$/);
    if (phoneMatch) {
        saveChatId(text, chatId);
        sendTelegramMessage(chatId, `✅ Номер ${text} прив'язано!\n\nТепер коди підтвердження будуть приходити сюди.`);
        return;
    }
    sendTelegramMessage(chatId, `📲 Для входу відкрийте додаток Spil і дотримуйтесь інструкцій.`);
}
async function sendTelegramMessage(chatId, text) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
        });
    }
    catch (err) {
        logger_1.logger.error('Telegram message error:', err);
    }
}
async function setupTelegramWebhook(serverUrl) {
    const webhookUrl = `${serverUrl}/api/telegram/webhook`;
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl }),
        });
        const data = await res.json();
        logger_1.logger.info('Telegram webhook setup:', data);
    }
    catch (err) {
        logger_1.logger.error('Telegram webhook setup error:', err);
    }
}
