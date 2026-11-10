import {
  asClass,
  asValue,
  createContainer,
  InjectionMode,
  Lifetime,
  type AwilixContainer,
} from 'awilix';
import { InMemoryUserRepository } from './modules/user/infrastructure/persistence/in-memory-user.repository';
import { CreateUserUseCase } from './modules/user/application/create-user.use-case';
import { UserController } from './modules/user/infrastructure/http/user.controller';

import { UploadFilesUseCase } from './modules/file-upload/application/upload-files.use-case';
import { FileController } from './modules/file-upload/infrastructure/http/file.controller';
import { CloudinaryFileStorage } from './shared/cloudinary/cloudinary.adapter';
import { env } from './shared/config/env';

import { SocketPublisherNotification } from './shared/realtime/websocket/socket-publisher.notification';
import { NotifyAllUseCase } from './modules/notification/application/notify-all.use-case';
import { NotificationController } from './modules/notification/infrastructure/http/notification.controller';

import { NotifyProductUpdatedUseCase } from './modules/product/application/notify-product-updated.use-case';
import { ProductController } from './modules/product/infrastructure/http/product.controller';

export interface Cradle {
  userRepository: InMemoryUserRepository;
  createUserUseCase: CreateUserUseCase;
  userController: UserController;
  fileStorage: CloudinaryFileStorage;
  uploadFilesUseCase: UploadFilesUseCase;
  fileController: FileController;
  publisher: SocketPublisherNotification;
  notifyAllUseCase: NotifyAllUseCase;
  notificationController: NotificationController;
  notifyProductUpdatedUseCase: NotifyProductUpdatedUseCase;
  productController: ProductController;
  folder: string;
}

export type Container = AwilixContainer<Cradle>;

export const buildContainer = (): Container => {
  const container = createContainer<Cradle>({
    injectionMode: InjectionMode.CLASSIC,
  });

  container.register({
    userRepository: asClass(InMemoryUserRepository, { lifetime: Lifetime.SINGLETON }),
    createUserUseCase: asClass(CreateUserUseCase, { lifetime: Lifetime.SINGLETON }),
    userController: asClass(UserController, { lifetime: Lifetime.SINGLETON }),

    fileStorage: asClass(CloudinaryFileStorage, { lifetime: Lifetime.SINGLETON }),
    uploadFilesUseCase: asClass(UploadFilesUseCase, { lifetime: Lifetime.SINGLETON }),
    fileController: asClass(FileController, { lifetime: Lifetime.SINGLETON }),

    publisher: asClass(SocketPublisherNotification, { lifetime: Lifetime.SINGLETON }),
    notifyAllUseCase: asClass(NotifyAllUseCase, { lifetime: Lifetime.SINGLETON }),
    notificationController: asClass(NotificationController, { lifetime: Lifetime.SINGLETON }),

    notifyProductUpdatedUseCase: asClass(NotifyProductUpdatedUseCase, { lifetime: Lifetime.SINGLETON }),
    productController: asClass(ProductController, { lifetime: Lifetime.SINGLETON }),

    folder: asValue(env.CLOUDINARY_FOLDER),
  });

  return container;
};
