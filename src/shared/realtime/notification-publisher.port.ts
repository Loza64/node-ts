/**
 * Puerto: el caso de uso solo sabe que existe "algo" que publica
 * notificaciones. No sabe si es socket.io, un pub/sub de Redis,
 * o un mock en un test.
 */
export interface NotificationPublisher {
  broadcast(message: string): void;
  emitToRoom(room: string, message: string): void;
}
