export interface SocketPublisher {
  broadcast(payload: unknown): void;
  emitToRoom(room: string, payload: unknown): void;
}
