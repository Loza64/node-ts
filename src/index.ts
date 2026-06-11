import app from "./app/app";
import { port, server } from "./app/config";

app.listen(port, () => {
    server(`Running on http://localhost:${port}`);
});
