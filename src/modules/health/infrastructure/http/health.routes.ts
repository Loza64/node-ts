import { Router } from 'express';
import { getCircuitBreakersStatus } from '../../../../shared/resilience/circuit-breaker.registry';

const router = Router();

/**
 * @swagger
 * /api/health/hello:
 *   get:
 *     summary: Chequeo simple de que el server está vivo
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: El server responde
 */
router.get('/hello', (_req, res) => {
  res.status(200).json({ message: 'hello server' });
});

/**
 * @swagger
 * /api/health/circuit-breakers:
 *   get:
 *     summary: Estado actual de los circuit breakers registrados
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Lista de circuit breakers con su estado y estadísticas
 */
router.get('/circuit-breakers', (_req, res) => {
  res.status(200).json({ data: getCircuitBreakersStatus() });
});

export default router;
