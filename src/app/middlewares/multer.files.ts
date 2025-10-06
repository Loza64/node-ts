import multer, { MulterError } from "multer";
import type { Request, Response, NextFunction } from "express";
import { NormalizedRequest } from "../utils/normalize";

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
        return next();
    }

    upload.any()(req, res, (err: unknown) => {
        if (err instanceof MulterError) return res.status(400).json({ error: err.message });

        if (err) return res.status(500).json({ error: String(err) });

        const r = req as unknown as NormalizedRequest;

        if (Array.isArray(req.files)) {
            r.files = req.files;
        } else if (req.file) {
            r.files = [req.file];
        } else if (req.files && typeof req.files === "object") {
            r.files = Object.values(req.files).flat();
        } else {
            r.files = [];
        }

        next();
    });
};