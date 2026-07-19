import multer, { MulterError } from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { multerConfig } from 'src/shared/config/express.config';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: multerConfig.fileSizeLimitMB * 1024 * 1024 },
});

export const uploadFile = (req: Request, res: Response, next: NextFunction): void => {
  const contentType = req.headers['content-type'];

  if (!contentType?.includes('multipart/form-data')) {
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

    const files = req.files;
    const singleFile = req.file;

    if (Array.isArray(files)) {
      req.files = files;
    } else if (singleFile) {
      req.files = [singleFile];
    } else if (files && typeof files === 'object') {
      req.files = Object.values(files as Record<string, Express.Multer.File[]>).flat();
    } else {
      req.files = [];
    }

    next();
  });
};
