import { NextFunction, Request, Response } from 'express';

export const validateIdParam = (
  _req: Request,
  res: Response,
  next: NextFunction,
  value: string,
): void => {
  if (!/^[1-9]\d{0,9}$/.test(value) || Number(value) > 2_147_483_647) {
    res.status(400).json({ status: 400, message: 'El id debe ser un entero positivo' });
    return;
  }
  next();
};
