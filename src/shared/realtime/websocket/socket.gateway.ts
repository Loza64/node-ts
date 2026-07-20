import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { corsConfig } from '../../config/express.config';
import { socketLog } from '../../logger/logger';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './socket.types';

export type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

let io: AppServer;

export const initSocket = (httpServer: HttpServer): AppServer => {
  io = new Server(httpServer, {
    cors: corsConfig,
  });

  io.on('connection', (socket: AppSocket) => {
    socketLog(`Connected: ${socket.id}`);

    socket.on('join', (room, callback) => {
      socket.join(room);
      socketLog(`${socket.id} joined: ${room}`);
      socket.to(room).emit('user_joined', { socketId: socket.id, room });
      callback?.(true);
    });

    socket.on('leave', (room, callback) => {
      socket.leave(room);
      socketLog(`${socket.id} left: ${room}`);
      socket.to(room).emit('user_left', { socketId: socket.id, room });
      callback?.(true);
    });

    socket.on('event', ({ room, message }) => {
      socket.to(room).emit('event', { from: socket.id, room, message });
    });

    socket.on('disconnect', (reason) => {
      socketLog(`Disconnected: ${socket.id} — ${reason}`);
    });

    socket.on('error', (err) => {
      socketLog(`Error ${socket.id}: ${err.message}`);
    });
  });

  return io;
};

export const getSocketIO = (): AppServer => {
  if (!io) throw new Error('Socket.IO has not been initialized');
  return io;
};
