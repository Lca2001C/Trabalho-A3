const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { mockDeep } = require('jest-mock-extended');

const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);

const authController = require('../src/controllers/authController');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('Login', () => {
    it('deve retornar 400 se e-mail ou senha faltarem', async () => {
      req.body = { email: 'teste@email.com' };
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'E-mail e senha são obrigatórios.' });
    });

    it('deve retornar 404 se usuário não for encontrado', async () => {
      req.body = { email: 'teste@email.com', senha: '123' };
      prismaMock.user.findUnique.mockResolvedValue(null);
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado.' });
    });

    it('deve logar com sucesso', async () => {
      req.body = { email: 'teste@email.com', senha: 'password' };
      
      const mockUser = {
        id: 1,
        nome: 'Teste',
        email: 'teste@email.com',
        senha: await bcrypt.hash('password', 10),
        role: 'DOADOR',
        status: 'APPROVED',
      };
      
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      
      await authController.login(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        mensagem: 'Login realizado com sucesso.',
        token: expect.any(String)
      }));
    });
  });
});
