import { Request, Response, NextFunction } from 'express';
import { NotifyProductUpdatedUseCase } from '../../application/notify-product-updated.use-case';

export class ProductController {
  constructor(private readonly notifyProductUpdatedUseCase: NotifyProductUpdatedUseCase) { }

  update = (req: Request, res: Response, _next: NextFunction): void => {
    const id = req.params.id as string;

    this.notifyProductUpdatedUseCase.execute(id, req.body);

    res.status(200).json({
      message: `Producto ${id} actualizado y notificado en la sala product:${id}`,
      data: req.body,
    });
  };
}
