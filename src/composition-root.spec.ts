import { buildContainer } from './composition-root';
import { FileController } from './modules/file-upload/infrastructure/http/file.controller';
import { NotificationController } from './modules/notification/infrastructure/http/notification.controller';
import { ProductController } from './modules/product/infrastructure/http/product.controller';
import { UserController } from './modules/user/infrastructure/http/user.controller';

describe('buildContainer', () => {
  it('resolves registered controllers and shared dependencies as singletons', () => {
    const container = buildContainer();

    expect(container.resolve('userController')).toBeInstanceOf(UserController);
    expect(container.resolve('fileController')).toBeInstanceOf(FileController);
    expect(container.resolve('notificationController')).toBeInstanceOf(NotificationController);
    expect(container.resolve('productController')).toBeInstanceOf(ProductController);

    expect(container.resolve('userController')).toBe(container.resolve('userController'));
    expect(container.resolve('publisher')).toBe(container.resolve('publisher'));
    expect(container.resolve('notifyAllUseCase')).toBe(container.resolve('notifyAllUseCase'));
    expect(container.resolve('notifyProductUpdatedUseCase')).toBe(
      container.resolve('notifyProductUpdatedUseCase'),
    );
  });
});
