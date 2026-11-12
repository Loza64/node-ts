import { type CloudinaryUploadResult, type FileStorage } from '../../../shared/cloudinary/cloudinary.port';
import { UploadFilesUseCase } from './upload-files.use-case';

describe('UploadFilesUseCase', () => {
  it('uploads each file to the configured folder and returns public storage details', async () => {
    const uploadResult: CloudinaryUploadResult = {
      publicId: 'uploads/file-1',
      url: 'http://cloudinary.example/file-1',
      secureUrl: 'https://cloudinary.example/file-1',
      resourceType: 'image',
      format: 'png',
      originalFilename: 'file-1.png',
      width: 100,
      height: 100,
      bytes: 42,
      tags: [],
      eager: [],
    };
    const fileStorage: jest.Mocked<FileStorage> = {
      upload: jest.fn().mockResolvedValue(uploadResult),
      destroy: jest.fn(),
      setTags: jest.fn(),
    };
    const useCase = new UploadFilesUseCase(fileStorage, 'test-uploads');
    const file = {
      originalname: 'file-1.png',
      size: 42,
      mimetype: 'image/png',
    } as Express.Multer.File;

    await expect(useCase.execute([file])).resolves.toEqual({
      total: 1,
      files: [
        {
          name: 'file-1.png',
          size: 42,
          mimetype: 'image/png',
          publicId: 'uploads/file-1',
          url: 'http://cloudinary.example/file-1',
          secureUrl: 'https://cloudinary.example/file-1',
          resourceType: 'image',
        },
      ],
    });
    expect(fileStorage.upload).toHaveBeenCalledWith(file, 'test-uploads');
  });
});
