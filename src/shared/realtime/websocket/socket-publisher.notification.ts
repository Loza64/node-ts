import { SocketPublisher } from '../socket-publisher.port';
import { getSocketIO } from './socket.gateway';

export class SocketPublisherNotification implements SocketPublisher {
  broadcast(payload: unknown): void {
    getSocketIO().emit('notification', payload)
  }

  emitToRoom(room: string, payload: unknown): void {
    getSocketIO().to(room).emit('event', payload)
  }
}
