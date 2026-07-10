import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { corsConfig, socketIO } from "./config";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../@types/socket/socket.types";

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

let io: AppServer;

export const initSocket = (httpServer: HttpServer): AppServer => {
  io = new Server(httpServer, {
    cors: corsConfig,
  });

  io.on("connection", (socket: AppSocket) => {
    socketIO(`Connected: ${socket.id}`);

    socket.on("join_room", (room, callback) => {
      socket.join(room);
      socketIO(`${socket.id} joined: ${room}`);
      socket.to(room).emit("user_joined", { socketId: socket.id, room });
      callback?.(true);
    });

    socket.on("leave_room", (room, callback) => {
      socket.leave(room);
      socketIO(`${socket.id} left: ${room}`);
      socket.to(room).emit("user_left", { socketId: socket.id, room });
      callback?.(true);
    });

    socket.on("room_message", ({ room, message }) => {
      socket.to(room).emit("room_message", { from: socket.id, room, message });
    });

    socket.on("disconnect", (reason) => {
      socketIO(`Disconnected: ${socket.id} — ${reason}`);
    });

    socket.on("error", (err) => {
      socketIO(`Error ${socket.id}: ${err.message}`);
    });
  });

  return io;
};

export const getSocketIO = (): AppServer => {
  if (!io) throw new Error("Socket.IO has not been initialized");
  return io;
};

// Para emitir desde controllers/services -> emitToRoom('product:12321', 'room_message', {...})
export const emitToRoom = <Event extends keyof ServerToClientEvents>(room: string, event: Event, ...args: Parameters<ServerToClientEvents[Event]>
): void => {
  (getSocketIO().to(room).emit as (...a: unknown[]) => void)(event, ...args);
};