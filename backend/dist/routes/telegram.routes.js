"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegram_1 = require("../utils/telegram");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// POST /api/telegram/webhook - Telegram bot webhook
router.post('/webhook', (req, res) => {
    try {
        (0, telegram_1.processTelegramUpdate)(req.body);
        res.json({ ok: true });
    }
    catch (err) {
        logger_1.logger.error('Telegram webhook error:', err);
        res.json({ ok: true }); // Always return 200 to Telegram
    }
});
exports.default = router;
//# sourceMappingURL=telegram.routes.js.map