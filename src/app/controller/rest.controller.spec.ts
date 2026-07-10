import { Request, Response } from 'express';
import { hello } from './rest.controller';

describe('rest.controller', () => {
  const mockResponse = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('hello', () => {
    it('responds with 200 and a greeting payload', () => {
      const req = {} as Request;
      const res = mockResponse();

      hello(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'hello server' });
    });
  });
});
