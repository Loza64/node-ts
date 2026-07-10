import { env } from './env';

export const corsConfig = {
  origin: env.ORIGIN || '*',
  credentials: !!env.ORIGIN,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const jsonConfig = {
  limit: '10mb',
  strict: false,
  inflate: true,
  type: 'application/json',
};

export const urlEncodeConfig = {
  extended: true,
  limit: '50mb',
  parameterLimit: 1000,
};

// Unica fuente de verdad para multer
export const multerConfig = {
  fileSizeLimitMB: 10,
};
