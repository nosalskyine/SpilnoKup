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
const prisma_1 = require("./prisma");
const BOT_TOKEN = "8778237684:AAG81-EM0ZMbdFUd6x6id1xpSvAVN_WagNo";
const SERVER_URL = process.env.SERVER_URL || "https://iscup-production-25c2.up.railway.app";
// In-memory chatId store (persists during server lifetime)
const phoneChats = new Map();
// Auth sessions — store in memory + DB fallback
const authSessions = new Map();
function createAuthSession(phone, otp) {
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    authSessions.set(token, { phone, otp, createdAt: Date.now() });
    // Also store in DB for persistence across restarts
    prisma_1.prisma.phoneVerification.updateMany({
        where: { phone, otpHash: require('crypto').createHash('sha256').update(otp).digest('hex'), isUsed: false },
        data: { ipAddress: `tg:${token}` }, // Store token in ipAddress field
    }).catch(() => { });
    logger_1.logger.info(`Auth session: ${token} for ***${phone.slice(-4)}`);
    return token;
}
function getAuthSession(token) {
    return authSessions.get(token) || null;
}
// Try to find session in DB if not in memory (after server restart)
async function findSessionInDB(token) {
    try {
        const record = await prisma_1.prisma.phoneVerification.findFirst({
            where: { ipAddress: `tg:${token}`, isUsed: false, expiresAt: { gte: new Date() } },
            orderBy: { createdAt: 'desc' },
        });
        if (record) {
            return { phone: record.phone, otp: '' }; // We don't need OTP here, just phone→chatId mapping
        }
    }
    catch { }
    return null;
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
        const message = `🔐 Ваш код Spil: *${otp}*\n\nДійсний 5 хвилин.`;
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
        });
        if (!res.ok) {
            logger_1.logger.error('Telegram send error:', await res.json());
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
async function processTelegramUpdate(update) {
    // Handle support replies from group
    if (update.message?.reply_to_message && update.message.chat.id === SUPPORT_GROUP_ID) {
        await handleSupportReply(update);
        return;
    }
    const message = update.message;
    if (!message?.text)
        return;
    const chatId = message.chat.id;
    const text = message.text.trim();
    // Ignore group messages that aren't replies
    if (chatId === SUPPORT_GROUP_ID) return;
    if (text.startsWith('/start')) {
        const parts = text.split(' ');
        const token = parts[1];
        if (token) {
            // Check memory first, then DB
            let session = authSessions.get(token);
            if (!session) {
                const dbSession = await findSessionInDB(token);
                if (dbSession)
                    session = { ...dbSession, createdAt: Date.now() };
            }
            if (session) {
                saveChatId(session.phone, chatId);
                // Find the latest OTP for this phone
                const latestOtp = await prisma_1.prisma.phoneVerification.findFirst({
                    where: { phone: session.phone, isUsed: false, expiresAt: { gte: new Date() } },
                    orderBy: { createdAt: 'desc' },
                }).catch(() => null);
                if (latestOtp) {
                    // We need the actual OTP — get it from memory session or generate message without it
                    const otpCode = session.otp || '(введіть код з додатку)';
                    await sendTelegramMessage(chatId, `🔐 Ваш код Spil: *${otpCode}*\n\nВведіть цей код в додатку.`);
                    if (session.otp)
                        session.sent = true;
                    logger_1.logger.info(`Code sent to ${chatId} via token ${token}`);
                }
                else {
                    await sendTelegramMessage(chatId, `⏰ Код прострочений. Спробуйте ще раз в додатку.`);
                }
            }
            else {
                await sendTelegramMessage(chatId, `⏰ Сесія не знайдена. Спробуйте ще раз в додатку.`);
            }
        }
        else {
            await sendTelegramMessage(chatId, `👋 Привіт! Це бот Spil.\n\n📲 Відкрийте додаток Spil щоб увійти.`);
        }
        return;
    }
    const phoneMatch = text.match(/^\+?\d{10,13}$/);
    if (phoneMatch) {
        saveChatId(text, chatId);
        await sendTelegramMessage(chatId, `✅ Номер ${text} прив'язано!`);
        return;
    }
}
async function sendTelegramMessage(chatId, text) {
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
        });
        if (!res.ok)
            logger_1.logger.error('TG send fail:', await res.text());
    }
    catch (err) {
        logger_1.logger.error('Telegram message error:', err);
    }
}
// ── Support system ──
const SUPPORT_GROUP_ID = -5110200458;
const supportTickets = new Map();
const supportReplies = new Map(); // phoneKey -> [{text, time, from}]
exports.sendSupportMessage = sendSupportMessage;
exports.handleSupportReply = handleSupportReply;
exports.getSupportReplies = getSupportReplies;

function getSupportReplies(phone) {
    const key = phone.replace(/\D/g, '');
    const replies = supportReplies.get(key) || [];
    supportReplies.delete(key); // Clear after reading
    return replies;
}

async function sendSupportMessage(userChatId, userName, userPhone, message) {
    try {
        // Include chatId in text so we can extract it from reply
        const chatIdTag = userChatId ? `[uid:${userChatId}]` : `[phone:${(userPhone||'').replace(/\D/g,'')}]`;
        const text = `📩 *Звернення в підтримку*\n\n👤 ${userName}\n📱 ${userPhone||'не вказано'}\n\n💬 ${message}\n\n_Відповідайте reply на це повідомлення_\n${chatIdTag}`;
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: SUPPORT_GROUP_ID, text, parse_mode: 'Markdown' }),
        });
        const data = await res.json();
        if (data.ok) {
            supportTickets.set(data.result.message_id, { userChatId, userName, userPhone });
            logger_1.logger.info(`Support msg sent, msgId: ${data.result.message_id}, chatId: ${userChatId}`);
            return true;
        }
        logger_1.logger.error('Support send fail:', data);
        return false;
    } catch (err) {
        logger_1.logger.error('Support send error:', err);
        return false;
    }
}

async function handleSupportReply(update) {
    const msg = update.message;
    if (!msg || !msg.reply_to_message || msg.chat.id !== SUPPORT_GROUP_ID) return false;
    if (msg.from.is_bot) return false;

    // Try to find ticket in memory
    const replyToId = msg.reply_to_message.message_id;
    let ticket = supportTickets.get(replyToId);

    // If not in memory, extract chatId from the original message text
    if (!ticket && msg.reply_to_message.text) {
        const uidMatch = msg.reply_to_message.text.match(/\[uid:(\d+)\]/);
        const phoneMatch = msg.reply_to_message.text.match(/\[phone:(\d+)\]/);
        if (uidMatch) {
            ticket = { userChatId: parseInt(uidMatch[1]) };
        } else if (phoneMatch) {
            const chatId = getChatId(phoneMatch[1]);
            if (chatId) ticket = { userChatId: chatId };
        }
    }

    if (!ticket || !ticket.userChatId) {
        logger_1.logger.warn('Support reply: no ticket/chatId found for msgId ' + replyToId);
        return false;
    }

    // Save reply to in-app support chat (not Telegram)
    const phone = ticket.userPhone || '';
    const phoneKey = phone.replace(/\D/g, '') || String(ticket.userChatId);
    if (!supportReplies.has(phoneKey)) supportReplies.set(phoneKey, []);
    supportReplies.get(phoneKey).push({ text: msg.text, time: new Date().toISOString(), from: msg.from.first_name || 'Підтримка' });
    logger_1.logger.info(`Support reply sent to ${ticket.userChatId}`);
    return true;
}

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
        logger_1.logger.info('Telegram webhook:', data);
    }
    catch (err) {
        logger_1.logger.error('Webhook setup error:', err);
    }
}
//# sourceMappingURL=telegram.js.map