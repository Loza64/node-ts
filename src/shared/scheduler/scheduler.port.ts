export interface CronJob {
  readonly name: string;
  readonly cronExpression: string;
  readonly preventOverlap?: boolean;
  run(): Promise<void>;
}

export interface Scheduler {
  register(job: CronJob): void;
  start(): void;
  stop(): void;
}
