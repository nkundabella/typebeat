// src/config/env.ts
import { cleanEnv, str, port } from 'envalid';

export const env = cleanEnv(process.env, {
  PORT: port({ default: 5000 }),
  DATABASE_URL: str(),
});
