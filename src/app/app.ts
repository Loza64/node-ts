import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './routes/_index.route';
import { errorHandler } from './middlewares/errorHandler';
import { corsConfig, jsonConfig, urlEncodeConfig } from './config';

const app = express();

app.use(helmet());
app.use(cors(corsConfig));
app.use(express.json(jsonConfig));
app.use(express.urlencoded(urlEncodeConfig));
app.use(morgan("dev"));


app.use('/api/', router);

app.use(errorHandler);

export default app;
