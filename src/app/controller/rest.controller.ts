import { Request, Response, NextFunction } from "express";
import { getSocketIO } from "../socket";

export const hello = (_req: Request, res: Response, _next: NextFunction): void => {
  res.status(200).json({ message: "hello server" });
};

export const notifyAll = (_req: Request, res: Response, _next: NextFunction): void => {
  const io = getSocketIO();

  io.emit("notification", { message: "Hola a todos desde el servidor" });

  res.status(200).json({ status: 200, message: "Notificación enviada" });
};
