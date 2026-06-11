import http from "http";
import app from "./app/app";
import { PORT, server } from "./app/config";
import { initSocket } from "./app/socket";

const httpServer = http.createServer(app);
initSocket(httpServer);
httpServer.listen(PORT, () => server(`Running on http://localhost:${PORT}`));
