import { AppError } from '../../../shared/errors/AppError';
import { encryptPass } from '../../../shared/utils/bcrypt.util';
import { User } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';
import { CreateUserDto } from './create-user.dto';

/**
 * Un Use Case = una acción de negocio, con nombre de negocio (verbo + sustantivo).
 * No sabe nada de Express, req/res, ni de la base de datos concreta:
 * solo orquesta el dominio a través de los puertos (repositorios).
 * Esto es lo que hace que sea 100% testeable sin levantar un servidor HTTP.
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);

    if (existing) {
      throw new AppError('Ya existe un usuario con ese correo', 409);
    }

    const passwordHash = await encryptPass(input.password);
    const user = new User(crypto.randomUUID(), input.name, input.email, passwordHash);

    return this.userRepository.save(user);
  }
}
