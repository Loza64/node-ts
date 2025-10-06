import app from "./app/app";
import { port, server } from "./app/config";

app.listen(port, () => {
    server(`http://localhost:${port}`)
})