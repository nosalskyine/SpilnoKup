import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from './utils/jwt';
import { logger } from './utils/logger';

let io: Server;

export function getIO(): Server {
  return io;
}

export function setupSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.userId;
      (socket as any).role = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);
    logger.info(`Socket connected: ${userId}`);

    socket.on('join:deal', (dealId: string) => {
      socket.join(`deal:${dealId}`);
    });

    socket.on('leave:deal', (dealId: string) => {
      socket.leave(`deal:${dealId}`);
    });

    socket.on('join:conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('chat:typing', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('chat:typing', { userId, conversationId: data.conversationId });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${userId}`);
    });
  });

  return io;
}
