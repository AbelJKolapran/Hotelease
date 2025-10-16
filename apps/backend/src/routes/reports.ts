import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth, enforceHotelAccess } from '../middleware/auth';

export const reportsRouter = Router();

reportsRouter.get('/occupancy', requireAuth, enforceHotelAccess, async (req, res) => {
  const totalRooms = await prisma.room.count({ where: { hotelId: req.hotelId } });
  const occupied = await prisma.booking.count({ where: { hotelId: req.hotelId, status: { in: ['CHECKED_IN'] } } });
  const occupancy = totalRooms === 0 ? 0 : occupied / totalRooms;
  res.json({ totalRooms, occupied, occupancy });
});

reportsRouter.get('/revenue', requireAuth, enforceHotelAccess, async (req, res) => {
  const total = await prisma.payment.aggregate({ _sum: { amountCents: true }, where: { hotelId: req.hotelId, status: 'SUCCEEDED' } });
  res.json({ revenueCents: total._sum.amountCents ?? 0 });
});


