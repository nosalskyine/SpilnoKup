"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveChatId = saveChatId;
exports.getChatId = getChatId;
exports.sendOtpViaTelegram = sendOtpViaTelegram;
exports.processTelegramUpdate = processTelegramUpdate;
exports.setupTelegramWebhook = setupTelegramWebhook;
const logger_1 = require("./logger");
const BOT_TOKEN = "8778237684:AAG81-EM0ZMbdFUd6x6id1xpSvAVN_WagNo";
// In-memory store for phone -> chatId mapping
// In production, use the database
const phoneChats = new Map();
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
        const phone = parts[1]; // /start +380XXXXXXXXX
        if (phone) {
            saveChatId(phone, chatId);
            sendTelegramMessage(chatId, `✅ Telegram підключено!\n\n📱 Телефон: ${phone}\n\nТепер ви будете отримувати коди підтвердження в цей чат.\n\nПоверніться до додатку Spil і продовжте реєстрацію.`);
        }
        else {
            sendTelegramMessage(chatId, `👋 Привіт! Це бот Spil.\n\n📲 Щоб підключити Telegram, відкрийте додаток Spil і натисніть "Увійти через Telegram".\n\nБот автоматично надішле вам код підтвердження.`);
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
            body: JSON.stringify({ chat_id: chatId, text }),
        });
    }
    catch (err) {
        logger_1.logger.error('Telegram message error:', err);
    }
}
// Setup webhook for Telegram
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
//# sourceMappingURL=telegram.js.map