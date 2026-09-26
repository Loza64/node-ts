export interface CloudinaryEagerTransformation {
  url: string;
  secureUrl: string;
  width: number;
  height: number;
}

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  originalFilename: string;
  width: number;
  height: number;
  bytes: number;
  tags: string[];
  eager: CloudinaryEagerTransformation[];
}

export interface FileStorage {
  upload(file: Express.Multer.File, folder: string): Promise<CloudinaryUploadResult>;
  destroy(publicId: string, resourceType?: string): Promise<void>;

  setTags(publicId: string, tags: string[], resourceType?: string): Promise<void>;
}
