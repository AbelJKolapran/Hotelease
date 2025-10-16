import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth, enforceHotelAccess } from '../middleware/auth';
import { z } from 'zod';

export const bookingsRouter = Router();

bookingsRouter.get('/', requireAuth, enforceHotelAccess, async (req, res) => {
  const bookings = await prisma.booking.findMany({ where: { hotelId: req.hotelId }, include: { room: true, customer: true } });
  res.json(bookings);
});

const bookingSchema = z.object({
  roomId: z.string().min(1),
  customerId: z.string().min(1),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  totalCents: z.number().int().nonnegative()
});

bookingsRouter.post('/', requireAuth, enforceHotelAccess, async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { roomId, customerId, checkInDate, checkOutDate, totalCents } = parsed.data;
  // Ensure room belongs to hotel and is available for dates
  const room = await prisma.room.findFirst({ where: { id: roomId, hotelId: req.hotelId } });
  if (!room) return res.status(400).json({ error: 'Invalid room' });
  const overlapping = await prisma.booking.findFirst({
    where: {
      hotelId: req.hotelId!,
      roomId,
      status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      NOT: [
        { checkOutDate: { lte: new Date(checkInDate) } },
        { checkInDate: { gte: new Date(checkOutDate) } }
      ]
    }
  });
  if (overlapping) return res.status(409).json({ error: 'Room not available' });
  const booking = await prisma.booking.create({
    data: {
      hotelId: req.hotelId!,
      roomId,
      customerId,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      totalCents
    }
  });
  res.status(201).json(booking);
});

bookingsRouter.post('/:id/checkin', requireAuth, enforceHotelAccess, async (req, res) => {
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'CHECKED_IN' }
  });
  res.json(booking);
});

bookingsRouter.post('/:id/checkout', requireAuth, enforceHotelAccess, async (req, res) => {
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'CHECKED_OUT' }
  });
  res.json(booking);
});


