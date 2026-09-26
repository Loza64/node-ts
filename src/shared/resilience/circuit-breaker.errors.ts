type OpossumErrorCode = 'EOPENBREAKER' | 'ETIMEDOUT' | 'ESHUTDOWN' | 'ESEMLOCKED';

const hasCode = (err: unknown, code: OpossumErrorCode): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: unknown }).code === code;

export const isCircuitOpenError = (err: unknown): boolean => hasCode(err, 'EOPENBREAKER');

export const isCircuitTimeoutError = (err: unknown): boolean => hasCode(err, 'ETIMEDOUT');

export const isCircuitBreakerFailure = (err: unknown): boolean =>
  isCircuitOpenError(err) || isCircuitTimeoutError(err) || hasCode(err, 'ESHUTDOWN') || hasCode(err, 'ESEMLOCKED');
