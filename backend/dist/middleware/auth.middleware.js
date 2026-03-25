"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../utils/prisma");
function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Токен не надано' });
        return;
    }
    try {
        const token = header.split(' ')[1];
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Fetch fresh role from DB
        prisma_1.prisma.user.findUnique({ where: { id: payload.userId }, select: { role: true } })
            .then((user) => {
            req.user = { userId: payload.userId, role: user?.role || payload.role };
            next();
        })
            .catch(() => {
            req.user = { userId: payload.userId, role: payload.role };
            next();
        });
    }
    catch {
        res.status(401).json({ error: 'Невалідний або прострочений токен' });
    }
}
// All authenticated users can do everything (buy + sell)
function requireRole(..._roles) {
    return (_req, _res, next) => {
        next();
    };
}
//# sourceMappingURL=auth.middleware.js.map