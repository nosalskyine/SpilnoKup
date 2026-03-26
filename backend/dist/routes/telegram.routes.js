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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSupportReply = addSupportReply;
const express_1 = require("express");
const telegram_1 = require("../utils/telegram");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// POST /api/telegram/webhook - Telegram bot webhook
router.post('/webhook', async (req, res) => {
    try {
        await (0, telegram_1.processTelegramUpdate)(req.body);
    }
    catch (err) {
        logger_1.logger.error('Telegram webhook error:', err);
    }
    res.json({ ok: true }); // Always return 200 to Telegram
});
// GET /api/telegram/test-send - Debug endpoint
router.get('/test-send', async (req, res) => {
    const { phone, otp } = req.query;
    if (!phone || !otp) {
        res.json({ error: 'Need ?phone=...&otp=...' });
        return;
    }
    const { sendOtpViaTelegram, getChatId } = await Promise.resolve().then(() => __importStar(require('../utils/telegram')));
    const chatId = getChatId(phone);
    const sent = await sendOtpViaTelegram(phone, otp);
    res.json({ sent, chatId: chatId || null, phone });
});
// Support system
const SUPPORT_GROUP_ID = process.env.SUPPORT_GROUP_ID || '-1002304389498';
const BOT_TOKEN = "8778237684:AAG81-EM0ZMbdFUd6x6id1xpSvAVN_WagNo";
const supportReplies = new Map();
// POST /api/telegram/support — user sends message
router.post('/support', async (req, res) => {
    try {
        const { message, userName, userPhone } = req.body;
        if (!message) {
            res.status(400).json({ error: 'Message required' });
            return;
        }
        const userInfo = `${userName || 'User'} (${userPhone || 'no phone'})`;
        const text = `📩 Підтримка\nВід: ${userInfo}\n\n${message}`;
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: SUPPORT_GROUP_ID, text }),
        });
        logger_1.logger.info(`Support message from ${userInfo}`);
        res.json({ ok: true });
    }
    catch (err) {
        logger_1.logger.error('Support error:', err);
        res.status(500).json({ error: 'Failed to send' });
    }
});
// GET /api/telegram/support/replies — poll for replies
router.get('/support/replies', (req, res) => {
    const { phone } = req.query;
    if (!phone) {
        res.json({ replies: [] });
        return;
    }
    const key = String(phone).replace(/\D/g, '').slice(-9);
    const replies = supportReplies.get(key) || [];
    if (replies.length > 0)
        supportReplies.delete(key);
    res.json({ replies });
});
// Store support reply (called from processTelegramUpdate for group replies)
function addSupportReply(phone, text) {
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
exports.default = router;
//# sourceMappingURL=telegram.routes.js.map