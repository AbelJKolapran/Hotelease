import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthUser = {
  id: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      hotelId?: string;
      role?: 'OWNER' | 'STAFF';
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') as any;
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  const hotelId = req.header('x-hotel-id');
  if (!hotelId) return res.status(400).json({ error: 'x-hotel-id header required' });
  req.hotelId = hotelId;
  next();
}

import { prisma } from '../db';

export async function enforceHotelAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const hotelId = req.hotelId || req.header('x-hotel-id');
  if (!hotelId) return res.status(400).json({ error: 'x-hotel-id header required' });
  const membership = await prisma.userHotel.findUnique({
    where: { userId_hotelId: { userId: req.user.id, hotelId } }
  });
  if (!membership) return res.status(403).json({ error: 'Forbidden' });
  req.hotelId = hotelId;
  req.role = membership.role as any;
  next();
}


