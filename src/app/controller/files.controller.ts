import { Request, Response, NextFunction } from "express";

export const uploadFilesCloud = (req: Request, res: Response, _next: NextFunction): void => {
  const files = (req.files as Express.Multer.File[]) ?? [];

  res.status(200).json({
    total: files.length,
    names: files.map(f => f.originalname),
    sizes: files.map(f => f.size),
    mimetypes: files.map(f => f.mimetype),
  });
};

export const createUser = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(201).json({ message: "User created", data: req.body });
};