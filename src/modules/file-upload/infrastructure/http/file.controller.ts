import { Request, Response, NextFunction } from 'express';
import { UploadFilesUseCase } from '../../application/upload-files.use-case';

export class FileController {
  constructor(private readonly uploadFilesUseCase: UploadFilesUseCase) {}

  upload = (req: Request, res: Response, _next: NextFunction): void => {
    const files = (req.files as Express.Multer.File[]) ?? [];
    const result = this.uploadFilesUseCase.execute(files);
    res.status(200).json(result);
  };
}
