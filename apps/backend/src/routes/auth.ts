import { Router } from 'express';
import { prisma } from '../db';
import { z } from 'zod';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  hotelName: z.string().min(1)
});

authRouter.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { email, password, fullName, hotelName } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await argon2.hash(password);
  const hotel = await prisma.hotel.create({ data: { name: hotelName } });
  const user = await prisma.user.create({ data: { email, password: passwordHash, fullName } });
  await prisma.userHotel.create({ data: { userId: user.id, hotelId: hotel.id, role: 'OWNER' } });
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  return res.status(201).json({ token, user: { id: user.id, email: user.email, fullName: user.fullName }, hotel });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email }, include: { hotels: true } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await argon2.verify(user.password, password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName } });
});


