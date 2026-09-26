import CircuitBreaker from 'opossum';
import { env } from '../config/env';
import { circuitBreakerLog, errorLog } from '../logger/logger';
import { registerCircuitBreaker } from './circuit-breaker.registry';

export interface CreateCircuitBreakerOptions<TArgs extends unknown[]>
  extends Partial<Omit<CircuitBreaker.Options<TArgs>, 'name'>> {
  name: string;
}

const defaultOptions = (): Partial<CircuitBreaker.Options<unknown[]>> => ({
  timeout: env.CB_TIMEOUT_MS,
  errorThresholdPercentage: env.CB_ERROR_THRESHOLD_PERCENTAGE,
  resetTimeout: env.CB_RESET_TIMEOUT_MS,
  volumeThreshold: env.CB_VOLUME_THRESHOLD,
  rollingCountTimeout: 10_000,
  rollingCountBuckets: 10,
});

export function createCircuitBreaker<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options: CreateCircuitBreakerOptions<TArgs>,
): CircuitBreaker<TArgs, TResult> {
  const breaker = new CircuitBreaker<TArgs, TResult>(action, {
    ...defaultOptions(),
    ...options,
  });

  breaker.on('open', () => circuitBreakerLog('[%s] OPEN — short-circuiting calls', breaker.name));
  breaker.on('halfOpen', () => circuitBreakerLog('[%s] HALF-OPEN — probing with the next call', breaker.name));
  breaker.on('close', () => circuitBreakerLog('[%s] CLOSED — calls flowing normally again', breaker.name));
  breaker.on('timeout', () => circuitBreakerLog('[%s] call timed out after %dms', breaker.name, options.timeout ?? env.CB_TIMEOUT_MS));
  breaker.on('reject', () => circuitBreakerLog('[%s] call rejected, circuit is open', breaker.name));
  breaker.on('failure', (err) => errorLog('[%s] call failed: %O', breaker.name, err));

  registerCircuitBreaker(breaker.name, breaker);

  return breaker;
}
