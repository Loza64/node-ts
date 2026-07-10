import { Router } from 'express';
import { NotificationController } from './notification.controller';

export const buildNotificationRouter = (controller: NotificationController): Router => {
  const router = Router();

  router.get('/notify', controller.notifyAll);

  return router;
};
