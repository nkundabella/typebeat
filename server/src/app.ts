// src/app.ts
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './services/logger';
import { securityMiddleware } from './middlewares/security';
import { errorHandler } from './middlewares/errorHandler';
import songRouter from './routes/songs';
import scoreRouter from './routes/scores';
import profileRouter from './routes/profile';

const app = express();

// Core middlewares
app.use(express.json());
app.use(...securityMiddleware);

// Simple request logger
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/songs', songRouter);
app.use('/api/scores', scoreRouter);
app.use('/api/profile', profileRouter);

// Health endpoint
app.get('/health', (_req, res) => res.json({ status: 'ok', message: 'Typebeat Backend is healthy.' }));

// Error handling (must be after routes)
app.use(errorHandler);

export default app;
