import { FileStorage } from '../../../shared/cloudinary/cloudinary.port';

export interface UploadedFileSummary {
  name: string;
  size: number;
  mimetype: string;
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: string;
}

export interface UploadFilesResult {
  total: number;
  files: UploadedFileSummary[];
}

export class UploadFilesUseCase {
  constructor(
    private readonly fileStorage: FileStorage,
    private readonly folder: string,
  ) {}

  async execute(files: Express.Multer.File[]): Promise<UploadFilesResult> {
    const uploads = await Promise.all(
      files.map(async (file) => ({
        file,
        result: await this.fileStorage.upload(file, this.folder),
      })),
    );

    return {
      total: uploads.length,
      files: uploads.map(({ file, result }) => ({
        name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        publicId: result.publicId,
        url: result.url,
        secureUrl: result.secureUrl,
        resourceType: result.resourceType,
      })),
    };
  }
}
