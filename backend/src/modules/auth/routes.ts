import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../../db/pool";
import { env } from "../../config/env";

const router = Router();

const registerSchema = z.object({
  hotelName: z.string().min(1),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8),
});

router.post("/register", async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error.flatten());
  const { hotelName, ownerEmail, ownerPassword } = parse.data;

  const passwordHash = await bcrypt.hash(ownerPassword, 10);

  try {
    const r1 = await pool.query<{ id: string }>(
      "INSERT INTO public.hotels(name) VALUES ($1) RETURNING id",
      [hotelName]
    );
    const hotelId = r1.rows[0].id;
    await pool.query(
      "INSERT INTO public.users(email, password_hash, role, hotel_id) VALUES ($1,$2,'owner',$3)",
      [ownerEmail, passwordHash, hotelId]
    );

    const token = jwt.sign(
      { sub: ownerEmail, role: "owner", hotelId },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );
    res.status(201).json({ token, hotelId });
  } catch (e) {
    res.status(400).json({ message: (e as Error).message });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json(parse.error.flatten());
  const { email, password } = parse.data;

  const { rows } = await pool.query<{ id: string; password_hash: string; role: string; hotel_id: string }>(
    "SELECT id, password_hash, role, hotel_id FROM public.users WHERE email=$1",
    [email]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { sub: email, role: user.role, hotelId: user.hotel_id },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
  res.json({ token, hotelId: user.hotel_id, role: user.role });
});

export default router;

