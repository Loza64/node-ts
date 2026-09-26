/// <reference types="jest" />

import { createCircuitBreaker } from './circuit-breaker.factory';
import { getCircuitBreakersStatus, __resetCircuitBreakerRegistry } from './circuit-breaker.registry';
import { isCircuitOpenError } from './circuit-breaker.errors';

describe('createCircuitBreaker (smoke)', () => {
  beforeEach(() => __resetCircuitBreakerRegistry());

  it('opens after enough failures and short-circuits further calls with EOPENBREAKER', async () => {
    const action = jest.fn().mockRejectedValue(new Error('boom'));

    const breaker = createCircuitBreaker(action, {
      name: 'test.breaker',
      timeout: 100,
      errorThresholdPercentage: 1,
      volumeThreshold: 1,
      resetTimeout: 50,
    });

    await expect(breaker.fire()).rejects.toThrow('boom');
    expect(breaker.opened).toBe(true);

    let openError: unknown;
    try {
      await breaker.fire();
    } catch (err) {
      openError = err;
    }
    expect(isCircuitOpenError(openError)).toBe(true);
    expect(action).toHaveBeenCalledTimes(1);

    const status = getCircuitBreakersStatus();
    expect(status).toEqual([
      expect.objectContaining({ name: 'test.breaker', state: 'open' }),
    ]);
  });

  it('errorFilter keeps client-style errors from tripping the breaker', async () => {
    const action = jest.fn().mockRejectedValue({ http_code: 404, message: 'not found' });

    const breaker = createCircuitBreaker(action, {
      name: 'test.breaker.filtered',
      errorThresholdPercentage: 1,
      volumeThreshold: 1,
      errorFilter: (err: any) => typeof err?.http_code === 'number' && err.http_code < 500,
    });

    await expect(breaker.fire()).rejects.toMatchObject({ http_code: 404 });
    await expect(breaker.fire()).rejects.toMatchObject({ http_code: 404 });

    expect(breaker.opened).toBe(false);
  });
});
