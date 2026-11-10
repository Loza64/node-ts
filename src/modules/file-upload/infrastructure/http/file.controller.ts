import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../../shared/errors/AppError';
import { UploadFilesUseCase } from '../../application/upload-files.use-case';

export class FileController {
  constructor(private readonly uploadFilesUseCase: UploadFilesUseCase) {}

  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = (req.files as Express.Multer.File[]) ?? [];
      if (files.length === 0) {
        throw new AppError('No se recibió ningún archivo', 400);
      }

      const result = await this.uploadFilesUseCase.execute(files);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };
}
