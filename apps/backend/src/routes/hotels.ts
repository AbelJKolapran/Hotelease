import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

export const hotelsRouter = Router();

hotelsRouter.get('/', requireAuth, async (req, res) => {
  const hotels = await prisma.userHotel.findMany({
    where: { userId: req.user!.id },
    include: { hotel: true }
  });
  res.json(hotels.map((uh) => uh.hotel));
});

const createSchema = z.object({ name: z.string().min(1), address: z.string().optional() });

hotelsRouter.post('/', requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const hotel = await prisma.hotel.create({ data: parsed.data });
  await prisma.userHotel.create({ data: { userId: req.user!.id, hotelId: hotel.id, role: 'OWNER' } });
  res.status(201).json(hotel);
});


