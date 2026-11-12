import { type Request, type Response, type NextFunction } from 'express';
import { type CreateUserUseCase } from '../../application/create-user.use-case';
import { type CreateUserDto } from '../../application/create-user.dto';

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
      // req.body ya fue validado y transformado por validateDTO(CreateUserDto) en la ruta
      const user = await this.createUserUseCase.execute(req.body as CreateUserDto);
      res.status(201).json({ message: 'User created', data: user.toPublic() });
    } catch (err) {
      next(err);
    }
  };
}
