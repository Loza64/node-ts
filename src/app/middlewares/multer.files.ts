import multer, { MulterError } from "multer";
import type { Request, Response, NextFunction } from "express";
import { multerConfig } from "../config";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: multerConfig.fileSizeLimitMB * 1024 * 1024 },
});

export const uploadFile = (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.headers["content-type"];

    if (!contentType?.includes("multipart/form-data")) {
        return next();
    }

    upload.any()(req, res, (err: unknown) => {
        if (err instanceof MulterError) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (err) {
            res.status(500).json({ error: String(err) });
            return;
        }

        if (Array.isArray(req.files)) {
            // ya está bien
        } else if (req.file) {
            req.files = [req.file];
        } else if (req.files && typeof req.files === "object") {
            req.files = Object.values(req.files as Record<string, Express.Multer.File[]>).flat();
        } else {
            req.files = [];
        }

        next();
    });
};
