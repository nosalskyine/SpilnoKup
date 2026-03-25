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

// POST /api/telegram/check
// iOS calls this after user presses Start in Telegram
// Fetches new messages, finds /start with token, sends code
router.post('/check', async (req, res) => {
    try {
        const { telegramToken } = req.body;
        if (!telegramToken) {
            res.json({ ok: false, message: 'No token' });
            return;
        }

        const session = (0, telegram_1.getAuthSession)(telegramToken);
        if (!session) {
            res.json({ ok: false, message: 'Session expired' });
            return;
        }

        // If code already sent
        if (session.sent) {
            res.json({ ok: true, codeSent: true });
            return;
        }

        // Fetch latest updates directly from Telegram
        // First delete webhook to allow getUpdates
        await fetch(`${TG}/deleteWebhook`);

        const updatesRes = await fetch(`${TG}/getUpdates?limit=50&timeout=0`);
        const updatesData = await updatesRes.json();

        let found = false;
        let maxId = 0;

        if (updatesData.ok && updatesData.result.length > 0) {
            for (const update of updatesData.result) {
                if (update.update_id > maxId) maxId = update.update_id;

                const msg = update.message;
                if (!msg?.text) continue;

                const text = msg.text.trim();
                if (text.startsWith('/start')) {
                    const parts = text.split(' ');
                    const token = parts[1];

                    if (token === telegramToken) {
                        const chatId = msg.chat.id;
                        // Save phone -> chatId mapping
                        (0, telegram_1.saveChatId)(session.phone, chatId);
                        // Send the code
                        await fetch(`${TG}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: chatId,
                                text: `Your Spil code: ${session.otp}\n\nEnter this code in the app.`
                            }),
                        });
                        session.sent = true;
                        found = true;
                        logger_1.logger.info(`Code sent to chat ${chatId} for token ${token}`);
                    }

                    // Also process other /start commands
                    if (token && token !== telegramToken) {
                        const otherSession = (0, telegram_1.getAuthSession)(token);
                        if (otherSession && !otherSession.sent) {
                            const chatId = msg.chat.id;
                            (0, telegram_1.saveChatId)(otherSession.phone, chatId);
                            await fetch(`${TG}/sendMessage`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    chat_id: chatId,
                                    text: `Your Spil code: ${otherSession.otp}\n\nEnter this code in the app.`
                                }),
                            });
                            otherSession.sent = true;
                        }
                    }
                }
            }
            // Mark updates as read
            if (maxId > 0) {
                await fetch(`${TG}/getUpdates?offset=${maxId + 1}&limit=1&timeout=0`);
            }
        }

        res.json({ ok: true, codeSent: found });
    }
    catch (err) {
        logger_1.logger.error('Check error:', err);
        res.status(500).json({ ok: false, error: String(err) });
    }
});

exports.default = router;
