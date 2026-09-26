import 'express';

declare global {
    namespace Express {
        interface Request {
            files?: Express.Multer.File[];
        }
    }
}
