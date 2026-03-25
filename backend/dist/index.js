"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const prisma_1 = require("./utils/prisma");
const redis_1 = require("./utils/redis");
const logger_1 = require("./utils/logger");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const deals_routes_1 = __importDefault(require("./routes/deals.routes"));
const wallet_routes_1 = __importDefault(require("./routes/wallet.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const qr_routes_1 = __importDefault(require("./routes/qr.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const socket_1 = require("./socket");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = http_1.default.createServer(app);
exports.httpServer = httpServer;
const PORT = parseInt(process.env.PORT || '3001', 10);
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'development' ? true : process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
}));
// Socket.io
(0, socket_1.setupSocket)(httpServer);
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/deals', deals_routes_1.default);
app.use('/api/wallet', wallet_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/qr', qr_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
// Health check
app.get('/health', async (_req, res) => {
    let database = 'connected';
    let redisStatus = 'connected';
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
    }
    catch {
        database = 'error';
    }
    if ((0, redis_1.isRedisConnected)() && redis_1.redis) {
        try {
            await redis_1.redis.ping();
        }
        catch {
            redisStatus = 'not connected';
        }
    }
    else {
        redisStatus = 'not connected (optional)';
    }
    const status = database === 'connected' ? 'ok' : 'degraded';
    res.json({
        status,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        database,
        redis: redisStatus,
        environment: process.env.NODE_ENV || 'development',
    });
});
// Start server
httpServer.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT}`);
});
// Graceful shutdown
async function shutdown() {
    logger_1.logger.info('Shutting down...');
    httpServer.close(async () => {
        await prisma_1.prisma.$disconnect();
        if (redis_1.redis && (0, redis_1.isRedisConnected)())
            await redis_1.redis.quit();
        logger_1.logger.info('Shutdown complete');
        process.exit(0);
    });
    setTimeout(() => {
        logger_1.logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
//# sourceMappingURL=index.js.map