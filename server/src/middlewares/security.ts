import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';

export const securityMiddleware: RequestHandler[] = [
  helmet(),
  cors({
    origin: '*', // as requested
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  })
];
