import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { errorLog } from '../logger/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    errorLog('Operational error: %s', err.message);
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
    return;
  }

  errorLog('Unexpected error: %O', err);

  res.status(500).json({
    status: 500,
    message: env.isDev && err instanceof Error ? err.message : 'Internal server error',
  });
};
