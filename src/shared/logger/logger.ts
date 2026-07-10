import debug from 'debug';

export const serverLog = debug('nodets:[server]');
export const socketLog = debug('nodets:[socket]');
export const errorLog = debug('nodets:[error]');
export const databaseLog = debug('nodets:[database]');
export const inputLog = debug('nodets:[input]');
