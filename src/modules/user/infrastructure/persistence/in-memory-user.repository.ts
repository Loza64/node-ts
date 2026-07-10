import { User } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

/**
 * Adaptador de salida. Implementa el puerto UserRepository.
 * Cuando conectes una base de datos real (TypeORM, Prisma...),
 * creas OTRO adaptador (ej. TypeOrmUserRepository) que implemente
 * la misma interfaz y lo cambias en el composition-root.
 * El resto de la app (use cases, controllers) no se entera del cambio.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find((u) => u.email === email) ?? null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}
