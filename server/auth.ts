import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { type Request, type Response, type NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_for_demo';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = { id: payload.userId };
  next();
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}
