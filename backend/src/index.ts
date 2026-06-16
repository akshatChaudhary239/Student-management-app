import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import prisma from './config/db';
import authRoutes from './modules/auth/auth.routes';
import dashboardRoutes from './modules/organizations/dashboard.routes';
import studentRoutes from './modules/members/member.routes';
import seatRoutes from './modules/members/resource.routes';
import membershipRoutes from './modules/renewals/membership.routes';
import feeRoutes from './modules/payments/fee.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import importRoutes from './modules/imports/import.routes';
import activityRoutes from './modules/history/activity.routes';
import subscriptionRoutes from './modules/organizations/subscription.routes';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware';
import { startCronJobs } from './utils/cron';

const app = express();

// Initialize background tasks
startCronJobs();

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logging
app.use('/api/', apiLimiter); // Apply rate limiter to all API routes

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/members', studentRoutes);
app.use('/api/v1/resources', seatRoutes);
app.use('/api/v1/memberships', membershipRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/import', importRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

// Health Check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
