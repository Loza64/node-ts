import { type Request, type Response, type NextFunction } from 'express';
import { type NotifyProductUpdatedUseCase } from '../../application/notify-product-updated.use-case';

export class ProductController {
  constructor(private readonly notifyProductUpdatedUseCase: NotifyProductUpdatedUseCase) { }

  update = (req: Request, res: Response, _next: NextFunction): void => {
    const id = req.params.id as string;
    // El body no pasa por un DTO: solo se aceptan objetos planos para no propagar basura al socket.
    const body: unknown = req.body;
    const changes =
      body !== null && typeof body === 'object' && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : {};

    this.notifyProductUpdatedUseCase.execute(id, changes);

    res.status(200).json({
      message: `Producto ${id} actualizado y notificado en la sala product:${id}`,
      data: changes,
    });
  };
}
