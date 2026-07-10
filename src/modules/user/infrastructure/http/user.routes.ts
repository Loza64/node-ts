import { Router } from 'express';
import { validateDTO } from '../../../../shared/middlewares/validate-dto.middleware';
import { CreateUserDto } from '../../application/create-user.dto';
import { UserController } from './user.controller';

export const buildUserRouter = (controller: UserController): Router => {
  const router = Router();

  router.post('/', validateDTO(CreateUserDto), controller.create);

  return router;
};
