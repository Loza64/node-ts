import { NotificationPublisher } from '../notification-publisher.port';
import { getSocketIO } from './socket.gateway';

export class SocketNotificationPublisher implements NotificationPublisher {
  broadcast(message: string): void {
    getSocketIO().emit('notification', { message });
  }

  emitToRoom(room: string, message: string): void {
    getSocketIO().to(room).emit('event', { from: 'server', room, message });
  }
}
