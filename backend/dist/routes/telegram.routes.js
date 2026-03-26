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
// GET /api/telegram/support/replies - Get support replies for user
router.get('/support/replies', async (req, res) => {
    try {
        const phone = req.query.phone;
        if (!phone) { res.json({ replies: [] }); return; }
        const { getSupportReplies } = require('../utils/telegram');
        const replies = getSupportReplies(phone);
        res.json({ replies });
    } catch (err) {
        res.json({ replies: [] });
    }
});

// POST /api/telegram/support - Send support message
router.post('/support', async (req, res) => {
    try {
        const { message, userName, userPhone, userChatId } = req.body;
        if (!message) {
            res.status(400).json({ ok: false, error: 'Message required' });
            return;
        }
        const { sendSupportMessage, getChatId } = require('../utils/telegram');
        const chatId = userChatId || getChatId(userPhone) || null;
        const sent = await sendSupportMessage(chatId, userName || 'User', userPhone || '', message);
        res.json({ ok: sent });
    } catch (err) {
        logger_1.logger.error('Support error:', err);
        res.status(500).json({ ok: false });
    }
});
exports.default = router;
//# sourceMappingURL=telegram.routes.js.map