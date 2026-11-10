import { once } from 'node:events';
import http from 'http';
import { createApp } from './app';
import { env } from './shared/config/env';
import { errorLog, serverLog, swaggerLog } from './shared/logger/logger';
import { initSocket } from './shared/realtime/websocket/socket.gateway';

const bootstrap = async (): Promise<void> => {
  const app = createApp();
  const httpServer = http.createServer(app);
  const socketServer = initSocket(httpServer);

  const listening = once(httpServer, 'listening');
  httpServer.listen(env.PORT);
  await listening;

  serverLog(`Running on http://localhost:${env.PORT}`);
  swaggerLog(`Available on http://localhost:${env.PORT}/api-docs`);

  let shuttingDown = false;
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    serverLog('Received %s, shutting down gracefully...', signal);

    try {
      await socketServer.close();
      serverLog('HTTP and Socket.IO servers closed');
    } catch (err) {
      errorLog('Failed to close servers cleanly: %O', err);
      process.exitCode = 1;
    }
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
};

bootstrap().catch((err: unknown) => {
  errorLog('Failed to start the server: %O', err);
  process.exitCode = 1;
});
