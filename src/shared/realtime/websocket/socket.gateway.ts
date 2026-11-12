import { Server, type Socket } from 'socket.io';
import { type Server as HttpServer } from 'http';
import { corsConfig } from '../../config/express.config';
import { socketLog } from '../../logger/logger';
import { type ClientToServerEvents, type InterServerEvents, type ServerToClientEvents, type SocketData } from './socket.types';

export type AppServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

let io: AppServer;

export const initSocket = (httpServer: HttpServer): AppServer => {
  io = new Server(httpServer, { cors: corsConfig });

  io.on('connection', (socket: AppSocket) => {
    socketLog(`Connected: ${socket.id}`);

    // join/leave pueden ser async (ej. con el adapter de Redis): se manejan sus errores
    // para que un rechazo no termine en un unhandledRejection que tumbe el proceso.
    socket.on('join', (room, callback) => {
      Promise.resolve(socket.join(room))
        .then(() => {
          socketLog(`${socket.id} joined: ${room}`);
          callback?.(true);
        })
        .catch((err: unknown) => {
          socketLog(`${socket.id} failed to join ${room}: %O`, err);
          callback?.(false);
        });
    });

    socket.on('leave', (room, callback) => {
      Promise.resolve(socket.leave(room))
        .then(() => {
          socketLog(`${socket.id} left: ${room}`);
          callback?.(true);
        })
        .catch((err: unknown) => {
          socketLog(`${socket.id} failed to leave ${room}: %O`, err);
          callback?.(false);
        });
    });

    socket.on('event', ({ room, payload }) => {
      socketLog(`${socket.id} event: ${room}`);
      socket.to(room).emit('event', payload);
    });

    socket.on('message', ({ room, payload }) => {
      socketLog(`${socket.id} message: ${room}`);
      socket.to(room).emit('message', payload);
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
  if (!io) {throw new Error('Socket.IO has not been initialized');}
  return io;
};