// Ensure we load environment variables from the backend .env even when run from monorepo root
import dotenv from 'dotenv';
dotenv.config({ path: process.cwd().includes('apps\\backend') || process.cwd().includes('apps/backend') ? '.env' : 'apps/backend/.env' });
import express from 'express';
import cors from 'cors';
import { prisma } from './db';

import { authRouter } from './routes/auth';
import { tenantRouter } from './routes/tenant';
import { hotelsRouter } from './routes/hotels';
import { roomsRouter } from './routes/rooms';
import { customersRouter } from './routes/customers';
import { bookingsRouter } from './routes/bookings';
import { paymentsRouter } from './routes/payments';
import { reportsRouter } from './routes/reports';


const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/tenant', tenantRouter);
app.use('/api/hotels', hotelsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reports', reportsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`HotelEase backend running on port ${port}`);
});


