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

        if (session.sent) {
            res.json({ ok: true, codeSent: true });
            return;
        }

        // Fetch updates from Telegram and process /start
        try {
            const updatesRes = await fetch(`${TG}/getUpdates?limit=100&timeout=0&allowed_updates=["message"]`);
            const updatesData = await updatesRes.json();

            let maxId = 0;
            if (updatesData.ok && updatesData.result) {
                for (const update of updatesData.result) {
                    if (update.update_id > maxId) maxId = update.update_id;
                    const msg = update.message;
                    if (!msg?.text) continue;
                    const text = msg.text.trim();

                    // Process ALL /start messages
                    if (text.startsWith('/start ')) {
                        const token = text.split(' ')[1];
                        const s = (0, telegram_1.getAuthSession)(token);
                        if (s && !s.sent) {
                            const chatId = msg.chat.id;
                            (0, telegram_1.saveChatId)(s.phone, chatId);
                            const sendRes = await fetch(`${TG}/sendMessage`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    chat_id: chatId,
                                    text: `Your Spil code: ${s.otp}\n\nEnter this code in the app.`
                                }),
                            });
                            if (sendRes.ok) {
                                s.sent = true;
                                logger_1.logger.info(`Code sent to ${chatId} for token ${token}`);
                            }
                        }
                    }
                }
                // Mark as read
                if (maxId > 0) {
                    await fetch(`${TG}/getUpdates?offset=${maxId + 1}&limit=1&timeout=0`);
                }
            }
        } catch (fetchErr) {
            logger_1.logger.error('Fetch updates error:', fetchErr);
        }

        res.json({ ok: true, codeSent: !!session.sent });
    }
    catch (err) {
        logger_1.logger.error('Check error:', err);
        res.status(500).json({ ok: false, error: String(err) });
    }
});

// GET /api/telegram/test-send - test if server can send Telegram messages
router.get('/test-send', async (req, res) => {
    try {
        const testRes = await fetch(`${TG}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: 664869990, text: 'Server test: fetch works!' }),
        });
        const data = await testRes.json();
        res.json({ fetchWorks: true, telegramResponse: data });
    } catch (err) {
        res.json({ fetchWorks: false, error: String(err) });
    }
});

exports.default = router;
