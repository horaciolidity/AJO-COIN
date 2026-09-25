import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SERVER_CONFIG } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    telegramId?: string;
    username?: string;
    isAdmin?: boolean;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, SERVER_CONFIG.jwtSecret, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
