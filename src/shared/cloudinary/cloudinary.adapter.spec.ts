/// <reference types="jest" />

jest.mock('./cloudinary.config', () => ({
  cloudinary: {
    uploader: {
      destroy: jest.fn(),
      upload_stream: jest.fn(),
      remove_all_tags: jest.fn(),
    },
    api: { update: jest.fn() },
  },
}));

import { cloudinary } from './cloudinary.config';
import { CloudinaryFileStorage } from './cloudinary.adapter';
import { AppError } from '../errors/AppError';
import { __resetCircuitBreakerRegistry } from '../resilience/circuit-breaker.registry';

describe('CloudinaryFileStorage circuit breaker', () => {
  beforeEach(() => {
    __resetCircuitBreakerRegistry();
    jest.clearAllMocks();
  });

  it('surfaces the original error while the circuit is closed', async () => {
    (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue({ http_code: 404, message: 'unknown public id' });

    const storage = new CloudinaryFileStorage();

    await expect(storage.destroy('missing-id')).rejects.toMatchObject({ http_code: 404 });
  });

  it('fails fast with a 503 AppError once the breaker trips, without new network calls', async () => {
    (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue({ http_code: 500, message: 'upstream down' });

    const storage = new CloudinaryFileStorage();

    // 500s are real failures: several of them should trip the breaker
    // (defaults: errorThresholdPercentage 50%, volumeThreshold 5).
    for (let i = 0; i < 6; i += 1) {
      await expect(storage.destroy('some-id')).rejects.toBeDefined();
    }

    const callsBeforeOpen = (cloudinary.uploader.destroy as jest.Mock).mock.calls.length;

    await expect(storage.destroy('some-id')).rejects.toBeInstanceOf(AppError);
    await expect(storage.destroy('some-id')).rejects.toMatchObject({ statusCode: 503 });

    // The breaker short-circuited: no additional calls reached Cloudinary.
    expect((cloudinary.uploader.destroy as jest.Mock).mock.calls.length).toBe(callsBeforeOpen);
  });
});
