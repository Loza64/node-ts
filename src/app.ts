import 'reflect-metadata';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { buildContainer, Container } from './composition-root';
import { buildApiRouter } from './interfaces/http/routes';
import { errorHandler } from './shared/middlewares/error-handler.middleware';
import { corsConfig, jsonConfig, urlEncodeConfig } from './shared/config/express.config';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

export const createApp = (container: Container = buildContainer()): Express => {
  const app = express();

  app.use(helmet());
  app.use(cors(corsConfig));
  app.use(express.json(jsonConfig));
  app.use(express.urlencoded(urlEncodeConfig));
  app.use(morgan('dev'));

  app.use('/api', buildApiRouter(container));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(errorHandler);

  return app;
};
