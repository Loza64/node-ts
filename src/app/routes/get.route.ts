import { Router } from 'express';
import { hello, notifyAll } from '../controller/rest.controller';

const router = Router();

router.get("/hello", hello);
router.get("/notify", notifyAll);

export default router;
