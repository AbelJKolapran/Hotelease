import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth, enforceHotelAccess } from '../middleware/auth';
import { z } from 'zod';

export const roomsRouter = Router();

roomsRouter.get('/', requireAuth, enforceHotelAccess, async (req, res) => {
  const rooms = await prisma.room.findMany({ where: { hotelId: req.hotelId } });
  res.json(rooms);
});

const roomSchema = z.object({ number: z.string().min(1), type: z.string().min(1), rateCents: z.number().int().nonnegative() });

roomsRouter.post('/', requireAuth, enforceHotelAccess, async (req, res) => {
  const parsed = roomSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const room = await prisma.room.create({ data: { ...parsed.data, hotelId: req.hotelId! } });
  res.status(201).json(room);
});


