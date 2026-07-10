import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../application/create-user.use-case';

/**
 * El controller es un "adaptador de entrada" (input adapter).
 * Su única responsabilidad: leer el request, invocar el use case,
 * traducir el resultado (o el error) a una respuesta HTTP.
 * No contiene reglas de negocio.
 */
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      res.status(201).json({ message: 'User created', data: user.toPublic() });
    } catch (err) {
      next(err);
    }
  };
}
