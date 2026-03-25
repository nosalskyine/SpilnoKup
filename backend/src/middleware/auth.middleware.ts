import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../utils/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Токен не надано' });
    return;
  }

  try {
    const token = header.split(' ')[1];
    const payload: JwtPayload = verifyAccessToken(token);

    // Fetch fresh role from DB
    prisma.user.findUnique({ where: { id: payload.userId }, select: { role: true } })
      .then((user) => {
        req.user = { userId: payload.userId, role: user?.role || payload.role };
        next();
      })
      .catch(() => {
        req.user = { userId: payload.userId, role: payload.role };
        next();
      });
  } catch {
    res.status(401).json({ error: 'Невалідний або прострочений токен' });
  }
}

// All authenticated users can do everything (buy + sell)
export function requireRole(..._roles: string[]) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
}
