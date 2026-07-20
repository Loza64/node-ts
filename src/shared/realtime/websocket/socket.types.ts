export interface ServerToClientEvents {
  event: (payload: { from: string; room: string; message: unknown }) => void;
  message: (payload: { from: string; room: string; payload: unknown }) => void;
  notification: (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  join: (room: string, callback?: (ok: boolean) => void) => void;
  leave: (room: string, callback?: (ok: boolean) => void) => void;
  event: (payload: { room: string; message: unknown }) => void;
  message: (payload: { room: string; payload: unknown }) => void;
}

export type InterServerEvents = object;

export interface SocketData {
  userId?: string;
}
