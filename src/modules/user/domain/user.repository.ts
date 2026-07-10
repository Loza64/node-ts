import { User } from './user.entity';

/**
 * Puerto de salida (output port). El dominio y la capa de aplicación
 * dependen de esta interfaz, nunca de una implementación concreta
 * (TypeORM, Prisma, memoria, etc). Eso es Inversión de Dependencias (DIP).
 */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
