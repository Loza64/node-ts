import { CreateUserUseCase } from './create-user.use-case';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';

describe('CreateUserUseCase', () => {
  const buildRepositoryMock = (): jest.Mocked<UserRepository> => ({
    findByEmail: jest.fn(),
    save: jest.fn(async (user: User) => user),
  });

  it('creates a user when the email is not taken', async () => {
    const repository = buildRepositoryMock();
    repository.findByEmail.mockResolvedValue(null);
    const useCase = new CreateUserUseCase(repository);

    const user = await useCase.execute({
      name: 'Loza Dev',
      email: 'loza@example.com',
      password: 'supersecret',
    });

    expect(user.email).toBe('loza@example.com');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('throws when the email is already registered', async () => {
    const repository = buildRepositoryMock();
    repository.findByEmail.mockResolvedValue(
      new User('1', 'Existing', 'loza@example.com', 'hash'),
    );
    const useCase = new CreateUserUseCase(repository);

    await expect(
      useCase.execute({ name: 'Loza Dev', email: 'loza@example.com', password: 'supersecret' }),
    ).rejects.toThrow('Ya existe un usuario con ese correo');
  });
});
