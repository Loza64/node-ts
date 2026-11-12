import { type User } from '../../domain/user.entity';
import { type UserRepository } from '../../domain/user.repository';

/**
 * Adaptador de salida. Implementa el puerto UserRepository.
 * Cuando conectes una base de datos real (TypeORM, Prisma...),
 * creas OTRO adaptador (ej. TypeOrmUserRepository) que implemente
 * la misma interfaz y lo cambias en el composition-root.
 * El resto de la app (use cases, controllers) no se entera del cambio.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve([...this.users.values()].find((u) => u.email === email) ?? null);
  }

  save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }
}
