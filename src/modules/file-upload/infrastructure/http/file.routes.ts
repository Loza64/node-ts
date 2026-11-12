import { Router } from 'express';
import { uploadFile } from '../../../../shared/middlewares/upload-file.middleware';
import { type FileController } from './file.controller';

export const buildFileRouter = (controller: FileController): Router => {
  const router = Router();

  router.post('/upload', uploadFile, controller.upload);

  return router;
};
