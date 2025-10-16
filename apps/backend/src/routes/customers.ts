import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth, enforceHotelAccess } from '../middleware/auth';
import { z } from 'zod';

export const customersRouter = Router();

customersRouter.get('/', requireAuth, enforceHotelAccess, async (req, res) => {
  const customers = await prisma.customer.findMany({ where: { hotelId: req.hotelId } });
  res.json(customers);
});

const customerSchema = z.object({ firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional() });

customersRouter.post('/', requireAuth, enforceHotelAccess, async (req, res) => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const customer = await prisma.customer.create({ data: { ...parsed.data, hotelId: req.hotelId! } });
  res.status(201).json(customer);
});


