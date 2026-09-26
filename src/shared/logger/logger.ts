import debug from 'debug';

export const serverLog = debug('nodets:[server]');
export const socketLog = debug('nodets:[socket]');
export const swaggerLog = debug('nodets:[swagger]');
export const errorLog = debug('nodets:[error]');
export const databaseLog = debug('nodets:[database]');
export const inputLog = debug('nodets:[input]');
export const circuitBreakerLog = debug('nodets:[circuit-breaker]');
