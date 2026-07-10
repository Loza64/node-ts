export interface UploadedFileSummary {
  name: string;
  size: number;
  mimetype: string;
}

export interface UploadFilesResult {
  total: number;
  files: UploadedFileSummary[];
}

export class UploadFilesUseCase {
  execute(files: Express.Multer.File[]): UploadFilesResult {
    return {
      total: files.length,
      files: files.map((f) => ({
        name: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
      })),
    };
  }
}
