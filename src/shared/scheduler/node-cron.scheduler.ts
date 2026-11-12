import cron, { type ScheduledTask } from 'node-cron';
import { errorLog, serverLog } from '../logger/logger';
import { type CronJob, type Scheduler } from './scheduler.port';

interface RegisteredJob {
  job: CronJob;
  task: ScheduledTask;
}

export class NodeCronScheduler implements Scheduler {
  
  private readonly registeredJobs: RegisteredJob[] = [];

  register(job: CronJob): void {
    if (!cron.validate(job.cronExpression)) {
      throw new Error(`Expresión cron inválida para el job "${job.name}": "${job.cronExpression}"`);
    }

    // node-cron v4: createTask crea la tarea sin iniciarla (reemplaza `scheduled: false`)
    const task = cron.createTask(job.cronExpression, this.toTickHandler(job), {
      name: job.name,
    });

    this.registeredJobs.push({ job, task });
    serverLog('Job "%s" registrado (cron: "%s")', job.name, job.cronExpression);
  }

  start(): void {
    this.registeredJobs.forEach(({ job, task }) => this.safely(job.name, 'start', () => task.start()));
  }

  stop(): void {
    this.registeredJobs.forEach(({ job, task }) => this.safely(job.name, 'stop', () => task.stop()));
  }

  /** node-cron v4 puede devolver una promesa en start/stop: un fallo se registra en vez de tumbar el proceso. */
  private safely(jobName: string, action: string, fn: () => void | Promise<void>): void {
    try {
      Promise.resolve(fn()).catch((err: unknown) => {
        errorLog('Job "%s": fallo al hacer %s: %O', jobName, action, err);
      });
    } catch (err) {
      errorLog('Job "%s": fallo al hacer %s: %O', jobName, action, err);
    }
  }

  private toTickHandler(job: CronJob): () => Promise<void> {
    const preventOverlap = job.preventOverlap ?? true;
    let running = false;

    return async () => {
      if (preventOverlap && running) {
        serverLog('Job "%s": la corrida anterior aún está en curso, se omite este tick', job.name);
        return;
      }

      running = true;
      try {
        await job.run();
      } catch (err) {
        errorLog('Job "%s" falló de forma inesperada: %O', job.name, err);
      } finally {
        running = false;
      }
    };
  }
}
