"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveChatId = saveChatId;
exports.getChatId = getChatId;
exports.sendOtpViaTelegram = sendOtpViaTelegram;
exports.sendOtpDirect = sendOtpDirect;
exports.processTelegramUpdate = processTelegramUpdate;
exports.setupTelegramWebhook = setupTelegramWebhook;
exports.createAuthSession = createAuthSession;
exports.getAuthSession = getAuthSession;
exports.getSessionByPhone = getSessionByPhone;
exports.startPolling = startPolling;
const logger_1 = require("./logger");
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8778237684:AAG81-EM0ZMbdFUd6x6id1xpSvAVN_WagNo";
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;
const phoneChats = new Map();
const authSessions = new Map();
const phoneSessions = new Map();

function createAuthSession(phone, otp) {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    authSessions.set(token, { phone, otp, createdAt: Date.now() });
    phoneSessions.set(phone.replace(/\D/g, ''), { otp, token, createdAt: Date.now() });
    logger_1.logger.info(`Auth session created: ${token} for ***${phone.slice(-4)}`);
    return token;
}
function getAuthSession(token) {
    return authSessions.get(token) || null;
}
function getSessionByPhone(phone) {
    return phoneSessions.get(phone.replace(/\D/g, '')) || null;
}
function saveChatId(phone, chatId) {
    phoneChats.set(phone.replace(/\D/g, ''), chatId);
    logger_1.logger.info(`Saved chat_id ${chatId} for phone ***${phone.slice(-4)}`);
}
function getChatId(phone) {
    return phoneChats.get(phone.replace(/\D/g, ''));
}
async function sendTelegramMessage(chatId, text) {
    try {
        const res = await fetch(`${TG}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text }),
        });
        if (!res.ok) {
            const err = await res.json();
            logger_1.logger.error('TG send error:', JSON.stringify(err));
            return false;
        }
        return true;
    } catch (err) {
        logger_1.logger.error('TG send error:', err);
        return false;
    }
}
async function sendOtpViaTelegram(phone, otp) {
    const chatId = getChatId(phone);
    if (!chatId) {
        logger_1.logger.warn(`No chat_id for ***${phone.slice(-4)}`);
        return false;
    }
    return sendOtpDirect(chatId, otp);
}
async function sendOtpDirect(chatId, otp) {
    const text = `Your Spil code: ${otp}\n\nValid for 5 minutes.`;
    return sendTelegramMessage(chatId, text);
}
function processTelegramUpdate(update) {
    const message = update.message;
    if (!message?.text) return;
    const chatId = message.chat.id;
    const text = message.text.trim();
    logger_1.logger.info(`TG message from ${chatId}: ${text}`);
    if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const token = parts[1];
        if (token) {
            const session = authSessions.get(token);
            if (session) {
                saveChatId(session.phone, chatId);
                sendTelegramMessage(chatId, `Your Spil code: ${session.otp}\n\nEnter this code in the app.`);
                session.sent = true;
                logger_1.logger.info(`Auth token ${token} used, code sent to ${chatId}`);
            } else {
                sendTelegramMessage(chatId, `Session expired. Go back to the app and try again.`);
            }
        } else {
            sendTelegramMessage(chatId, `Welcome to Spil bot!\n\nOpen the Spil app and follow the registration steps.`);
        }
        return;
    }
    const phoneMatch = text.match(/^\+?\d{10,13}$/);
    if (phoneMatch) {
        saveChatId(text, chatId);
        sendTelegramMessage(chatId, `Phone ${text} linked! Codes will be sent here.`);
        return;
    }
    sendTelegramMessage(chatId, `Open the Spil app to sign in.`);
}

// Polling fallback - check for new messages every 2 seconds
let pollingOffset = 0;
let pollingActive = false;
async function startPolling() {
    if (pollingActive) return;
    pollingActive = true;
    logger_1.logger.info('Telegram polling started');
    while (pollingActive) {
        try {
            const res = await fetch(`${TG}/getUpdates?offset=${pollingOffset}&timeout=10&limit=10`);
            const data = await res.json();
            if (data.ok && data.result.length > 0) {
                for (const update of data.result) {
                    pollingOffset = update.update_id + 1;
                    processTelegramUpdate(update);
                }
            }
        } catch (err) {
            logger_1.logger.error('Polling error:', err);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

async function setupTelegramWebhook(serverUrl) {
    // Delete webhook and use polling instead - more reliable
    try {
        await fetch(`${TG}/deleteWebhook`);
        logger_1.logger.info('Webhook deleted, switching to polling');
        startPolling();
    } catch (err) {
        logger_1.logger.error('Setup error:', err);
        startPolling();
    }
}
