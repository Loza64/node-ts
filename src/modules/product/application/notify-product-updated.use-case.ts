import { NotificationPublisher } from '../../../shared/realtime/notification-publisher.port';

export class NotifyProductUpdatedUseCase {
  constructor(private readonly publisher: NotificationPublisher) { }

  execute(productId: string, changes: Record<string, unknown>): void {
    const room = `product:${productId}`;
    this.publisher.emitToRoom(room, { productId, changes });
  }
}
