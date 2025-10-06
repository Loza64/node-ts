import { Request, Response, NextFunction } from "express";
import { NormalizedRequest } from "../utils/normalize";

export const uploadFilesCloud = (req: Request, res: Response, next: NextFunction) => {
    const r = req as unknown as NormalizedRequest;
    const files = r.files ?? [];

    res.status(200).json({
        total: files.length,
        names: files.map(file => file.originalname),
        sizes: files.map(file => file.size),
        mimetypes: files.map(file => file.mimetype)
    });
};
