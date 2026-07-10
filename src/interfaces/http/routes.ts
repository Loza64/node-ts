import { Router } from 'express';
import { Container } from '../../composition-root';
import healthRoutes from '../../modules/health/infrastructure/http/health.routes';
import { buildUserRouter } from '../../modules/user/infrastructure/http/user.routes';
import { buildFileRouter } from '../../modules/file-upload/infrastructure/http/file.routes';
import { buildNotificationRouter } from '../../modules/notification/infrastructure/http/notification.routes';
import { buildProductRouter } from '../../modules/product/infrastructure/http/product.routes';

/**
 * Aqui la API queda organizada por RECURSO (/users, /files, /notifications)
 * en vez de por verbo HTTP (/get, /post...), que es como se estructuran
 * las REST APIs en la industria.
 */
export const buildApiRouter = (container: Container): Router => {
  const router = Router();

  router.use('/health', healthRoutes);
  router.use('/users', buildUserRouter(container.userController));
  router.use('/files', buildFileRouter(container.fileController));
  router.use('/notifications', buildNotificationRouter(container.notificationController));
  router.use('/products', buildProductRouter(container.productController));

  return router;
};
