import { Router } from 'express';
import { hello } from '../controller/rest.controller';

const router = Router();

router.get("/hello", hello);

export default router;
