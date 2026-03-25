"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = getIO;
exports.setupSocket = setupSocket;
const socket_io_1 = require("socket.io");
const jwt_1 = require("./utils/jwt");
const logger_1 = require("./utils/logger");
let io;
function getIO() {
    return io;
}
function setupSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error('Authentication required'));
        try {
            const payload = (0, jwt_1.verifyAccessToken)(token);
            socket.userId = payload.userId;
            socket.role = payload.role;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        socket.join(`user:${userId}`);
        logger_1.logger.info(`Socket connected: ${userId}`);
        socket.on('join:deal', (dealId) => {
            socket.join(`deal:${dealId}`);
        });
        socket.on('leave:deal', (dealId) => {
            socket.leave(`deal:${dealId}`);
        });
        socket.on('join:conversation', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
        });
        socket.on('chat:typing', (data) => {
            socket.to(`conversation:${data.conversationId}`).emit('chat:typing', { userId, conversationId: data.conversationId });
        });
        socket.on('disconnect', () => {
            logger_1.logger.info(`Socket disconnected: ${userId}`);
        });
    });
    return io;
}
//# sourceMappingURL=socket.js.map