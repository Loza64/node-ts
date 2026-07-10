import { Router } from 'express';
import { ProductController } from './product.controller';

export const buildProductRouter = (controller: ProductController): Router => {
  const router = Router();

  router.patch('/:id', controller.update);

  return router;
};
