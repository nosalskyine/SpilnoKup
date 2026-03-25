import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { prisma } from './utils/prisma';
import { redis, isRedisConnected } from './utils/redis';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import dealsRoutes from './routes/deals.routes';
import walletRoutes from './routes/wallet.routes';
import ordersRoutes from './routes/orders.routes';
import qrRoutes from './routes/qr.routes';
import chatRoutes from './routes/chat.routes';
import { setupSocket } from './socket';

const app = express();
const httpServer = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? true : process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Socket.io
setupSocket(httpServer);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', async (_req, res) => {
  let database = 'connected';
  let redisStatus = 'connected';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'error';
  }

  if (isRedisConnected() && redis) {
    try { await redis.ping(); } catch { redisStatus = 'not connected'; }
  } else {
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
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down...');
  httpServer.close(async () => {
    await prisma.$disconnect();
    if (redis && isRedisConnected()) await redis.quit();
    logger.info('Shutdown complete');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { app, httpServer };
