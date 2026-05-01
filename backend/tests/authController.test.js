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
    process.env.JWT_SECRET = 'test_secret';
    req = { body: {}, user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('Register', () => {
    it('deve retornar 400 se faltar campos obrigatórios', async () => {
      req.body = { email: 'teste@email.com' }; // Faltando nome e senha
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Os campos nome, email e senha são obrigatórios.' });
    });

    it('deve retornar 409 se email já existe', async () => {
      req.body = { nome: 'João', email: 'joao@email.com', senha: '123' };
      prismaMock.user.findUnique.mockResolvedValue({ id: 1 }); // Email já cadastrado
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Este email já está cadastrado.' });
    });

    it('deve registrar usuário com sucesso', async () => {
      req.body = { nome: 'Maria', email: 'maria@email.com', senha: '123' };
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 2, nome: 'Maria', email: 'maria@email.com', role: 'USER', status: 'APPROVED'
      });

      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        mensagem: 'Usuário cadastrado com sucesso!',
        token: expect.any(String),
        usuario: expect.objectContaining({ nome: 'Maria' })
      }));
    });
  });

  describe('Login', () => {
    it('deve retornar 400 se e-mail ou senha faltarem', async () => {
      req.body = { email: 'teste@email.com' };
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Os campos email e senha são obrigatórios.' });
    });

    it('deve retornar 401 se usuário não for encontrado', async () => {
      req.body = { email: 'teste@email.com', senha: '123' };
      prismaMock.user.findUnique.mockResolvedValue(null);
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ erro: 'E-mail não encontrado na base de dados.' });
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
        token: expect.any(String),
        nome: 'Teste',
        role: 'DOADOR',
        status: 'APPROVED'
      }));
    });
  });

  describe('Me', () => {
    it('deve retornar 404 se usuário logado não for encontrado na base', async () => {
      req.user = { id: 99 };
      prismaMock.user.findUnique.mockResolvedValue(null);
      await authController.me(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado.' });
    });

    it('deve retornar os dados do usuário com sucesso', async () => {
      req.user = { id: 1 };
      const mockUser = { id: 1, nome: 'João', email: 'joao@email.com' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      await authController.me(req, res);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Update Profile', () => {
    it('deve atualizar os dados do perfil', async () => {
      req.user = { id: 1 };
      req.body = { nome: 'Novo Nome', telefone: '123456789' };
      const mockUpdated = { id: 1, nome: 'Novo Nome', telefone: '123456789' };
      prismaMock.user.update.mockResolvedValue(mockUpdated);

      await authController.updateProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Perfil atualizado com sucesso!',
        user: mockUpdated
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ nome: 'Novo Nome', telefone: '123456789' }),
        select: expect.any(Object)
      });
    });
  });

  describe('Get Approved Institutions', () => {
    it('deve retornar lista de ongs aprovadas', async () => {
      const mockOngs = [{ id: 1, nome: 'ONG Teste' }];
      prismaMock.user.findMany.mockResolvedValue(mockOngs);
      await authController.getApprovedInstitutions(req, res);
      expect(res.json).toHaveBeenCalledWith(mockOngs);
    });
  });
});
