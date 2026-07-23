// socket.types.ts
export interface RoomEventPayload<T = unknown> { room: string, payload: T }

export interface ServerToClientEvents {
  event: (payload: unknown) => void;
  message: (payload: unknown) => void;
  notification: (payload: unknown) => void;
}

export interface ClientToServerEvents {
  join: (room: string, callback?: (ok: boolean) => void) => void;
  leave: (room: string, callback?: (ok: boolean) => void) => void;
  event: (data: RoomEventPayload) => void;
  message: (data: RoomEventPayload) => void;
}

export type InterServerEvents = object;

export interface SocketData { userId?: string }
