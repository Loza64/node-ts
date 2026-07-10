import { Router } from 'express';

const router = Router();

router.get('/hello', (_req, res) => {
  res.status(200).json({ message: 'hello server' });
});

export default router;
