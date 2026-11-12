import { Router } from 'express';
import { type NotificationController } from './notification.controller';

export const buildNotificationRouter = (controller: NotificationController): Router => {
  const router = Router();

  router.get('/notify', controller.notifyAll);

  return router;
};
