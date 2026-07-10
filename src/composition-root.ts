import { InMemoryUserRepository } from './modules/user/infrastructure/persistence/in-memory-user.repository';
import { CreateUserUseCase } from './modules/user/application/create-user.use-case';
import { UserController } from './modules/user/infrastructure/http/user.controller';

import { UploadFilesUseCase } from './modules/file-upload/application/upload-files.use-case';
import { FileController } from './modules/file-upload/infrastructure/http/file.controller';

import { SocketNotificationPublisher } from './shared/realtime/websocket/socket-notification.publisher';
import { NotifyAllUseCase } from './modules/notification/application/notify-all.use-case';
import { NotificationController } from './modules/notification/infrastructure/http/notification.controller';

import { NotifyProductUpdatedUseCase } from './modules/product/application/notify-product-updated.use-case';
import { ProductController } from './modules/product/infrastructure/http/product.controller';

export const buildContainer = () => {
  // --- Modulo user --- ejemplo
  const userRepository = new InMemoryUserRepository();
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const userController = new UserController(createUserUseCase);

  // --- Modulo file-upload ---
  const uploadFilesUseCase = new UploadFilesUseCase();
  const fileController = new FileController(uploadFilesUseCase);

  // --- Puerto de tiempo real (shared), una sola instancia compartida ---
  const notificationPublisher = new SocketNotificationPublisher();

  // --- Modulo notification ---
  const notifyAllUseCase = new NotifyAllUseCase(notificationPublisher);
  const notificationController = new NotificationController(notifyAllUseCase);

  const notifyProductUpdatedUseCase = new NotifyProductUpdatedUseCase(notificationPublisher);
  const productController = new ProductController(notifyProductUpdatedUseCase);

  return { userController, fileController, notificationController, productController };
};

export type Container = ReturnType<typeof buildContainer>;
