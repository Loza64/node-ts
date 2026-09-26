import cron, { ScheduledTask } from 'node-cron';
import { errorLog, serverLog } from '../logger/logger';

export interface CreateCronJobOptions {
  name: string;
  cronExpression: string;
  task: () => Promise<void> | void;
}

export const createCronJob = ({ name, cronExpression, task }: CreateCronJobOptions): ScheduledTask => {
  if (!cron.validate(cronExpression)) {
    throw new Error(`Expresión cron inválida para el job "${name}": "${cronExpression}"`);
  }

  let running = false;

  const scheduledTask = cron.schedule(
    cronExpression,
    async () => {
      if (running) {
        serverLog('Job "%s": corrida anterior aún en curso, se omite este tick', name);
        return;
      }
      running = true;
      try {
        await task();
      } catch (err) {
        errorLog('Fallo inesperado en el job "%s": %O', name, err);
      } finally {
        running = false;
      }
    },
    { name },
  );

  serverLog('Job "%s" registrado (cron: "%s")', name, cronExpression);

  return scheduledTask;
};
