import 'reflect-metadata';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { NextFunction, Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export const validateDTO = <T extends object>(dtoClass: ClassConstructor<T>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      const messages = errors.flatMap((err) => Object.values(err.constraints ?? {}));
      res.status(400).json({
        status: 400,
        message: messages.join(', '),
      });
      return;
    }

    req.body = dto;
    next();
  };
};
