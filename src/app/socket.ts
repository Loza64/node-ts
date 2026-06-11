import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { corsConfig, socketIO } from "./config";

let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: corsConfig
  });

  io.on("connection", (socket) => {
    socketIO(`Conected: ${socket.id}`);

    // Unirse a una sala
    socket.on("join_room", (data: { room: string } & object) => {
      socket.join(data.room);
      socketIO(`${socket.id} se unió a: ${data.room}`);
      socket.to(data.room).emit("user_joined", {
        socketId: socket.id,
        ...data,
      });
    });

    // Enviar mensaje a una sala
    socket.on("room_message", (data: { room: string } & object) => {
      socket.to(data.room).emit("room_message", {
        from: socket.id,
        ...data,
      });
    });

    // Salir de una sala
    socket.on("leave_room", (data: { room: string } & object) => {
      socket.leave(data.room);
      socketIO(`${socket.id} salió de: ${data.room}`);
      socket.to(data.room).emit("user_left", {
        socketId: socket.id,
        ...data,
      });
    });

    socket.on("disconnect", (reason) => {
      socketIO(`Disconected: ${socket.id} — ${reason}`);
    });

    socket.on("error", (err) => {
      socketIO(`Error ${socket.id}: ${err.message}`);
    });
  });

  return io;
};

export const getSocketIO = (): Server => {
  if (!io) throw new Error("Socket.IO no ha sido inicializado");
  return io;
};