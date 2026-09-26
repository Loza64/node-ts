import CircuitBreaker from 'opossum';
import { circuitBreakerLog } from '../logger/logger';

export type CircuitState = 'closed' | 'open' | 'halfOpen';

export interface CircuitBreakerSnapshot {
  name: string;
  state: CircuitState;
  enabled: boolean;
  stats: {
    fires: number;
    successes: number;
    failures: number;
    rejects: number;
    timeouts: number;
    latencyMeanMs: number;
  };
}

const breakers = new Map<string, CircuitBreaker<unknown[], unknown>>();

export const registerCircuitBreaker = (name: string, breaker: CircuitBreaker<unknown[], unknown>): void => {
  if (breakers.has(name)) {
    circuitBreakerLog('[%s] re-registering circuit breaker (previous instance replaced)', name);
  }
  breakers.set(name, breaker);
};

const resolveState = (breaker: CircuitBreaker<unknown[], unknown>): CircuitState => {
  if (breaker.opened) return 'open';
  if (breaker.halfOpen) return 'halfOpen';
  return 'closed';
};

export const getCircuitBreakersStatus = (): CircuitBreakerSnapshot[] =>
  Array.from(breakers.values()).map((breaker) => ({
    name: breaker.name,
    state: resolveState(breaker),
    enabled: breaker.enabled,
    stats: {
      fires: breaker.stats.fires,
      successes: breaker.stats.successes,
      failures: breaker.stats.failures,
      rejects: breaker.stats.rejects,
      timeouts: breaker.stats.timeouts,
      latencyMeanMs: breaker.stats.latencyMean,
    },
  }));

export const __resetCircuitBreakerRegistry = (): void => breakers.clear();
