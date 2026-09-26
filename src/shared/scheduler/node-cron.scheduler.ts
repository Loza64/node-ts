import cron, { ScheduledTask } from 'node-cron';
import { errorLog, serverLog } from '../logger/logger';
import { CronJob, Scheduler } from './scheduler.port';

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

    const task = cron.schedule(job.cronExpression, this.toTickHandler(job), {
      name: job.name,
      scheduled: false,
    });

    this.registeredJobs.push({ job, task });
    serverLog('Job "%s" registrado (cron: "%s")', job.name, job.cronExpression);
  }

  start(): void {
    this.registeredJobs.forEach(({ task }) => task.start());
  }

  stop(): void {
    this.registeredJobs.forEach(({ task }) => task.stop());
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
