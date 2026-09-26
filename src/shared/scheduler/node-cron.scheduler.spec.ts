/// <reference types="jest" />

const mockTask = { start: jest.fn(), stop: jest.fn() };
const mockSchedule = jest.fn().mockReturnValue(mockTask);
const mockValidate = jest.fn().mockReturnValue(true);

jest.mock('node-cron', () => ({
  __esModule: true,
  default: {
    schedule: (...args: unknown[]) => mockSchedule(...args),
    validate: (...args: unknown[]) => mockValidate(...args),
  },
}));

import cron from 'node-cron';
import { NodeCronScheduler } from './node-cron.scheduler';
import { CronJob } from './scheduler.port';

describe('NodeCronScheduler', () => {
  const makeJob = (overrides: Partial<CronJob> = {}): CronJob => ({
    name: 'test-job',
    cronExpression: '* * * * *',
    run: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockValidate.mockReturnValue(true);
  });

  it('rejects an invalid cron expression instead of scheduling it', () => {
    mockValidate.mockReturnValue(false);
    const scheduler = new NodeCronScheduler();

    expect(() => scheduler.register(makeJob({ cronExpression: 'not-a-cron' }))).toThrow(/inválida/);
    expect(cron.schedule).not.toHaveBeenCalled();
  });

  it('schedules the job without starting it', () => {
    const scheduler = new NodeCronScheduler();

    scheduler.register(makeJob());

    expect(mockSchedule).toHaveBeenCalledWith(
      '* * * * *',
      expect.any(Function),
      expect.objectContaining({ name: 'test-job', scheduled: false }),
    );
    expect(mockTask.start).not.toHaveBeenCalled();
  });

  it('start() activates every registered job', () => {
    const scheduler = new NodeCronScheduler();
    scheduler.register(makeJob({ name: 'a' }));
    scheduler.register(makeJob({ name: 'b' }));

    scheduler.start();

    expect(mockTask.start).toHaveBeenCalledTimes(2);
  });

  it('stop() stops every registered job', () => {
    const scheduler = new NodeCronScheduler();
    scheduler.register(makeJob());

    scheduler.stop();

    expect(mockTask.stop).toHaveBeenCalledTimes(1);
  });

  it('runs the job on tick', async () => {
    const job = makeJob();
    new NodeCronScheduler().register(job);

    const tick = mockSchedule.mock.calls[0][1] as () => Promise<void>;
    await tick();

    expect(job.run).toHaveBeenCalledTimes(1);
  });

  it('skips a tick while the previous run of the same job is still in flight', async () => {
    let resolveFirstRun: () => void = () => {};
    const job = makeJob({
      run: jest.fn().mockImplementation(
        () => new Promise<void>((resolve) => { resolveFirstRun = resolve; }),
      ),
    });
    new NodeCronScheduler().register(job);
    const tick = mockSchedule.mock.calls[0][1] as () => Promise<void>;

    const firstTick = tick();
    await tick();

    expect(job.run).toHaveBeenCalledTimes(1);

    resolveFirstRun();
    await firstTick;
  });

  it('does not apply the overlap guard when preventOverlap is false', async () => {
    const job = makeJob({ preventOverlap: false });
    new NodeCronScheduler().register(job);
    const tick = mockSchedule.mock.calls[0][1] as () => Promise<void>;

    await Promise.all([tick(), tick()]);

    expect(job.run).toHaveBeenCalledTimes(2);
  });

  it('logs the failure instead of throwing when a job fails', async () => {
    const job = makeJob({ run: jest.fn().mockRejectedValue(new Error('boom')) });
    new NodeCronScheduler().register(job);
    const tick = mockSchedule.mock.calls[0][1] as () => Promise<void>;

    await expect(tick()).resolves.toBeUndefined();
  });
});
