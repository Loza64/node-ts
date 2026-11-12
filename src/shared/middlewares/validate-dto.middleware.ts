import 'reflect-metadata';
import { type ClassConstructor } from 'class-transformer/types/interfaces';
import { type NextFunction, type Request, type Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { flattenValidationErrors } from './validation-errors.util';

export const validateDTO = <T extends object>(dtoClass: ClassConstructor<T>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      res.status(400).json({
        status: 400,
        message: flattenValidationErrors(errors).join(', '),
      });
      return;
    }

    req.body = dto;
    next();
  };
};
