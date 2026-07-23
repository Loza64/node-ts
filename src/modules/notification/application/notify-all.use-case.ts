import { SocketPublisher } from '../../../shared/realtime/socket-publisher.port';

export class NotifyAllUseCase {
  constructor(private readonly publisher: SocketPublisher) { }
  execute(message: string): void { this.publisher.broadcast({ message }) }
}
