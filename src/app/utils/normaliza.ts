export interface NormalizedRequest extends Request {
    files: Express.Multer.File[];
}