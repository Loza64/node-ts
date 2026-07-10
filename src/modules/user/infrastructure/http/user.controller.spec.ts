import { Request, Response } from 'express';
import { UserController } from './user.controller';
import { CreateUserUseCase } from '../../application/create-user.use-case';
import { User } from '../../domain/user.entity';

describe('UserController', () => {
  const mockResponse = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('responds with 201 and the public shape of the created user', async () => {
    const useCase = { execute: jest.fn() } as unknown as jest.Mocked<CreateUserUseCase>;
    useCase.execute.mockResolvedValue(new User('1', 'Loza Dev', 'loza@example.com', 'hash'));

    const controller = new UserController(useCase);
    const req = { body: { name: 'Loza Dev', email: 'loza@example.com', password: '12345678' } } as Request;
    const res = mockResponse();

    await controller.create(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created',
      data: { id: '1', name: 'Loza Dev', email: 'loza@example.com', createdAt: expect.any(Date) },
    });
  });
});
