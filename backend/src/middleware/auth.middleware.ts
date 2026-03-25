import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';

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
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Невалідний або прострочений токен' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Недостатньо прав' });
      return;
    }
    next();
  };
}
