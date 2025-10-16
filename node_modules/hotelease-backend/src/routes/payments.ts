import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth, enforceHotelAccess } from '../middleware/auth';
import { z } from 'zod';

export const paymentsRouter = Router();

paymentsRouter.get('/', requireAuth, enforceHotelAccess, async (req, res) => {
  const payments = await prisma.payment.findMany({ where: { hotelId: req.hotelId } });
  res.json(payments);
});

const paymentSchema = z.object({ bookingId: z.string().min(1), amountCents: z.number().int().positive(), currency: z.string().default('USD') });

paymentsRouter.post('/', requireAuth, enforceHotelAccess, async (req, res) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { bookingId, amountCents, currency } = parsed.data;
  const booking = await prisma.booking.findFirst({ where: { id: bookingId, hotelId: req.hotelId } });
  if (!booking) return res.status(400).json({ error: 'Invalid booking' });
  const payment = await prisma.payment.create({ data: { hotelId: req.hotelId!, bookingId, amountCents, currency, status: 'SUCCEEDED' } });
  res.status(201).json(payment);
});


