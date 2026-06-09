// src/middlewares/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { logger } from '../services/logger';

export const validate = (schema: ZodSchema<any>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      logger.warn('Validation failed', { errors: result.error.format() });
      return _res.status(400).json({ error: result.error.errors });
    }
    // replace request data with parsed data
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;
    next();
  };
};
