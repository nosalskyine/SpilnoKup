"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegram_1 = require("../utils/telegram");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8778237684:AAG81-EM0ZMbdFUd6x6id1xpSvAVN_WagNo";
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;

// POST /api/telegram/webhook
router.post('/webhook', (req, res) => {
    try {
        (0, telegram_1.processTelegramUpdate)(req.body);
        res.json({ ok: true });
    }
    catch (err) {
        res.json({ ok: true });
    }
});

// POST /api/telegram/check - iOS calls this after user presses Start
// Fetches latest Telegram updates, processes them, sends code if token matched
router.post('/check', async (req, res) => {
    try {
        const { telegramToken } = req.body;

        // Fetch latest updates from Telegram
        const updatesRes = await fetch(`${TG}/getUpdates?limit=20&timeout=0`);
        const updatesData = await updatesRes.json();

        if (updatesData.ok && updatesData.result.length > 0) {
            let maxId = 0;
            for (const update of updatesData.result) {
                if (update.update_id > maxId) maxId = update.update_id;
                (0, telegram_1.processTelegramUpdate)(update);
            }
            // Mark as read
            await fetch(`${TG}/getUpdates?offset=${maxId + 1}&limit=1&timeout=0`);
        }

        // Check if token was used (code was sent)
        const session = (0, telegram_1.getAuthSession)(telegramToken);
        if (session && session.sent) {
            res.json({ ok: true, codeSent: true });
        } else if (session) {
            res.json({ ok: true, codeSent: false, message: 'Press Start in Telegram bot' });
        } else {
            res.json({ ok: false, message: 'Session not found' });
        }
    }
    catch (err) {
        logger_1.logger.error('Check error:', err);
        res.status(500).json({ ok: false });
    }
});

exports.default = router;
