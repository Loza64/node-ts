import { ClassConstructor } from "class-transformer/types/interfaces";
import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import 'reflect-metadata';

export default function validateDTO<T extends object>(dtoClass: ClassConstructor<T>) {

    return async (req: Request, res: Response, next: NextFunction) => {

        const dto = plainToClass(dtoClass, req.body);
        const errors = await validate(dto);
        
        if (errors.length > 0) {
            res.status(400).json({ errors })
            return;
        }

        next();
    }

}