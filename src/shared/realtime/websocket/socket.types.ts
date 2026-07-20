export interface ServerToClientEvents {
  user_joined: (payload: { socketId: string; room: string }) => void;
  user_left: (payload: { socketId: string; room: string }) => void;
  event: (payload: { from: string; room: string; message: unknown }) => void;
  notification: (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  join: (room: string, callback?: (ok: boolean) => void) => void;
  leave: (room: string, callback?: (ok: boolean) => void) => void;
  event: (payload: { room: string; message: unknown }) => void;
}

export type InterServerEvents = object;

export interface SocketData {
  userId?: string;
}
