import express from 'express'
import { uploadFile } from '../middlewares/multer.files';
import { uploadFilesCloud } from '../controller/files.controller';

const router = express.Router();

router.post('/upload/files', uploadFile, uploadFilesCloud)

export default router