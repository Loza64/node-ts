import { Router } from 'express';
import { uploadFile } from '../middlewares/multer.files';
import { uploadFilesCloud, createUser } from '../controller/files.controller';
import validateDTO from '../middlewares/validator.dto';
import { CreateUserDto } from '../dtos/CreateUser.dto';

const router = Router();

router.post('/upload/files', uploadFile, uploadFilesCloud);
router.post('/users', validateDTO(CreateUserDto), createUser);

export default router;
