import express from 'express';
import morgan from 'morgan';
import router from './routes/_index.route';
import { corsconfig, jsonConfig, urlencodeconfig } from './config';
import cors from 'cors'
import helmet from 'helmet';

const app = express();

app.use(helmet())
app.use(cors(corsconfig))
app.use(express.json(jsonConfig))
app.use(express.urlencoded(urlencodeconfig));
app.use(morgan("dev"))
app.use('/server/rest/api/fetch/json/request', router)

export default app;