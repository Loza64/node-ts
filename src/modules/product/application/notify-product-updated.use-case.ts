import { SocketPublisher } from '../../../shared/realtime/socket-publisher.port';

export class NotifyProductUpdatedUseCase {
  constructor(private readonly publisher: SocketPublisher) { }

  execute(productId: string, changes: Record<string, unknown>): void {
    const room = `product:${productId}`;
    this.publisher.emitToRoom(room, { productId, changes });
  }
}
