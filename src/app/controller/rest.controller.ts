import { Request, Response, NextFunction } from "express";

export const hello = (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(200).json({ message: "hello server" });
};
