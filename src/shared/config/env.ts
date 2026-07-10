import { config } from 'dotenv';

config();

export const env = {
  PORT: Number(process.env.PORT) || 4000,
  ORIGIN: process.env.ORIGIN,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  isDev: (process.env.NODE_ENV ?? 'development') === 'development',
};
