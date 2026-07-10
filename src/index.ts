import http from 'http';
import app from './app';
import { env } from './shared/config/env';
import { serverLog } from './shared/logger/logger';
import { initSocket } from './shared/realtime/websocket/socket.gateway';

const httpServer = http.createServer(app);
initSocket(httpServer);
httpServer.listen(env.PORT, () => serverLog(`Running on http://localhost:${env.PORT}`));
