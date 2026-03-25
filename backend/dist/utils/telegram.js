"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthSession = createAuthSession;
exports.getAuthSession = getAuthSession;
exports.saveChatId = saveChatId;
exports.getChatId = getChatId;
exports.sendOtpViaTelegram = sendOtpViaTelegram;
exports.processTelegramUpdate = processTelegramUpdate;
exports.setupTelegramWebhook = setupTelegramWebhook;
const logger_1 = require("./logger");
const BOT_TOKEN = "8778237684:AAG81-EM0ZMbdFUd6x6id1xpSvAVN_WagNo";
const SERVER_URL = process.env.SERVER_URL || "https://iscup-production-25c2.up.railway.app";
// In-memory stores
const phoneChats = new Map();
const authSessions = new Map();
// Auth sessions for token-based /start
function createAuthSession(phone, otp) {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    authSessions.set(token, { phone, otp, createdAt: Date.now() });
    logger_1.logger.info(`Auth session: ${token} for ***${phone.slice(-4)}`);
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
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }),
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
// Process incoming Telegram updates (webhook)
function processTelegramUpdate(update) {
    const message = update.message;
    if (!message?.text)
        return;
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
                logger_1.logger.info(`Code sent to ${chatId} via token ${token}`);
            }
            else {
                sendTelegramMessage(chatId, `⏰ Session expired. Try again in the app.`);
            }
        }
        else {
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
// Setup webhook for Telegram
async function setupTelegramWebhook(serverUrl) {
    const url = serverUrl || SERVER_URL;
    const webhookUrl = `${url}/api/telegram/webhook`;
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
//# sourceMappingURL=telegram.js.map