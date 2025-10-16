import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';

export const tenantRouter = Router();

tenantRouter.get('/my-hotels', requireAuth, async (req, res) => {
  const hotels = await prisma.userHotel.findMany({
    where: { userId: req.user!.id },
    include: { hotel: true }
  });
  res.json(
    hotels.map((uh) => ({ hotel: uh.hotel, role: uh.role }))
  );
});


