import CircuitBreaker from 'opossum';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { cloudinary } from './cloudinary.config';
import { CloudinaryUploadResult, FileStorage } from './cloudinary.port';
import { AppError } from '../errors/AppError';
import { errorLog } from '../logger/logger';
import { createCircuitBreaker } from '../resilience/circuit-breaker.factory';
import { isCircuitBreakerFailure } from '../resilience/circuit-breaker.errors';

const SERVICE_UNAVAILABLE_MESSAGE = 'El servicio de almacenamiento de archivos no está disponible en este momento. Intenta de nuevo en unos segundos.';

const isClientError = (err: unknown): boolean => {
  const httpCode = (err as Partial<UploadApiErrorResponse> | undefined)?.http_code;
  return typeof httpCode === 'number' && httpCode < 500;
};

export class CloudinaryFileStorage implements FileStorage {
  private readonly uploadBreaker: CircuitBreaker<[Express.Multer.File, string], CloudinaryUploadResult>;
  private readonly destroyBreaker: CircuitBreaker<[string, string], void>;
  private readonly setTagsBreaker: CircuitBreaker<[string, string[], string], void>;

  constructor() {
    this.uploadBreaker = createCircuitBreaker(
      (file: Express.Multer.File, folder: string) => this.performUpload(file, folder),
      { name: 'cloudinary.upload', errorFilter: isClientError },
    );

    this.destroyBreaker = createCircuitBreaker(
      (publicId: string, resourceType: string) => this.performDestroy(publicId, resourceType),
      { name: 'cloudinary.destroy', errorFilter: isClientError },
    );

    this.setTagsBreaker = createCircuitBreaker(
      (publicId: string, tags: string[], resourceType: string) => this.performSetTags(publicId, tags, resourceType),
      { name: 'cloudinary.setTags', errorFilter: isClientError },
    );
  }

  async upload(file: Express.Multer.File, folder: string): Promise<CloudinaryUploadResult> {
    return this.fire(() => this.uploadBreaker.fire(file, folder), this.uploadBreaker.name);
  }

  async destroy(publicId: string, resourceType = 'image'): Promise<void> {
    await this.fire(() => this.destroyBreaker.fire(publicId, resourceType), this.destroyBreaker.name);
  }

  async setTags(publicId: string, tags: string[], resourceType = 'image'): Promise<void> {
    await this.fire(() => this.setTagsBreaker.fire(publicId, tags, resourceType), this.setTagsBreaker.name);
  }

  private performUpload(file: Express.Multer.File, folder: string): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          tags: ['general'],
          eager: [{ width: 400, height: 400, crop: 'fill', gravity: 'auto' }],
        },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }

          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            resourceType: result.resource_type,
            format: result.format,
            originalFilename: result.original_filename ?? file.originalname,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            tags: result.tags ?? [],
            eager: (result.eager ?? []).map((e: NonNullable<UploadApiResponse['eager']>[number]) => ({
              url: e.url,
              secureUrl: e.secure_url,
              width: e.width,
              height: e.height,
            })),
          });
        },
      );

      stream.end(file.buffer);
    });
  }

  private async performDestroy(publicId: string, resourceType: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }

  private async performSetTags(publicId: string, tags: string[], resourceType: string): Promise<void> {
    if (tags.length) {
      await cloudinary.api.update(publicId, { tags, resource_type: resourceType });
    } else {
      await cloudinary.uploader.remove_all_tags([publicId], { resource_type: resourceType });
    }
  }

  private async fire<TResult>(action: () => Promise<TResult>, breakerName: string): Promise<TResult> {
    try {
      return await action();
    } catch (err) {
      if (isCircuitBreakerFailure(err)) {
        errorLog('[%s] short-circuited: %s', breakerName, (err as Error).message);
        throw new AppError(SERVICE_UNAVAILABLE_MESSAGE, 503);
      }
      throw err;
    }
  }
}