import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { errorLog } from "../config";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    errorLog("Operational error: %s", err.message);
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
    return;
  }

  const isDev = process.env.NODE_ENV === "development";
  errorLog("Unexpected error: %O", err);

  res.status(500).json({
    status: 500,
    message: isDev && err instanceof Error ? err.message : "Internal server error",
  });
};
