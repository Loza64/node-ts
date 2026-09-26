import cron, { ScheduledTask } from 'node-cron';
import { errorLog, serverLog } from '../logger/logger';

export interface CreateCronJobOptions {
  /** Nombre del job, solo para logs/identificación (ej: 'orphan-photos-cleanup'). */
  name: string;
  /** Expresión cron estándar de 5 campos (ej: '0 * * * *' = cada hora, al minuto 0). */
  cronExpression: string;
  /** Acción a ejecutar en cada tick. Puede ser async. */
  task: () => Promise<void> | void;
}

/**
 * Registra (pero no arranca por sí solo un servidor) un cron job genérico.
 *
 * Se separa el registro de node-cron en un factory para poder:
 *  - Reusar el mismo patrón de logging/overlap-protection en cualquier job.
 *  - Testear/inspeccionar el schedule sin depender de un timer real.
 *  - Pararlo limpio en el shutdown del proceso.
 *
 * Uso típico en `index.ts`:
 *
 *   const job = createCronJob({
 *     name: 'example-job',
 *     cronExpression: '0 * * * *',
 *     task: async () => { ... },
 *   });
 *
 *   // en el shutdown:
 *   job.stop();
 */
export const createCronJob = ({ name, cronExpression, task }: CreateCronJobOptions): ScheduledTask => {
  if (!cron.validate(cronExpression)) {
    throw new Error(`Expresión cron inválida para el job "${name}": "${cronExpression}"`);
  }

  let running = false;

  const scheduledTask = cron.schedule(
    cronExpression,
    async () => {
      // Evita que dos corridas se pisen si una tarea tarda más que el intervalo del cron.
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
