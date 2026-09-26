import { env } from './env';

const origin = env.ORIGIN ? env.ORIGIN.trim().split(',') : '*'

export const corsConfig = {
  origin: origin,
  credentials: !!env.ORIGIN,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Api-Key'],
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

export const multerConfig = {
  fileSizeLimitMB: 10,
};
