import { Router } from 'express';
import get from './get.route';
import post from './post.route';
import put from './put.route';
import patch from './patch.route';
import del from './delete.route';

const router = Router();

router.use('/get', get);
router.use('/post', post);
router.use('/put', put);
router.use('/patch', patch);
router.use('/delete', del);

export default router;
