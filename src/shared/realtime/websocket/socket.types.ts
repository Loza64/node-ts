export interface ServerToClientEvents {
  user_joined: (payload: { socketId: string; room: string }) => void;
  user_left: (payload: { socketId: string; room: string }) => void;
  room_message: (payload: { from: string; room: string; message: unknown }) => void;
  notification: (payload: { message: string }) => void;
}

export interface ClientToServerEvents {
  join_room: (room: string, callback?: (ok: boolean) => void) => void;
  leave_room: (room: string, callback?: (ok: boolean) => void) => void;
  room_message: (payload: { room: string; message: unknown }) => void;
}

export type InterServerEvents = object;

export interface SocketData {
  userId?: string;
}
