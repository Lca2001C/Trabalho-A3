const bcrypt = require('bcryptjs');
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

  // ─── Register ───────────────────────────────────────────────────────────────

  describe('register', () => {
    it('deve retornar 400 se nome estiver faltando', async () => {
      req.body = { email: 'a@a.com', senha: '123' };
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Os campos nome, email e senha são obrigatórios.' });
    });

    it('deve retornar 400 se email estiver faltando', async () => {
      req.body = { nome: 'Ana', senha: '123' };
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 400 se senha estiver faltando', async () => {
      req.body = { nome: 'Ana', email: 'a@a.com' };
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 409 se email já existir', async () => {
      req.body = { nome: 'João', email: 'joao@email.com', senha: '123' };
      prismaMock.user.findUnique.mockResolvedValue({ id: 1 });
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Este email já está cadastrado.' });
    });

    it('deve retornar 409 se CNPJ já existir', async () => {
      req.body = { nome: 'ONG', email: 'ong@email.com', senha: '123', role: 'INSTITUTION', cnpj: '12.345.678/0001-99' };
      // Primeira chamada (email) retorna null, segunda (cnpj) retorna usuário
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 2 });
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Este CPF/CNPJ já está cadastrado em outra conta.' });
    });

    it('deve registrar usuário USER com sucesso', async () => {
      req.body = { nome: 'Maria', email: 'maria@email.com', senha: '123' };
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 2, nome: 'Maria', email: 'maria@email.com', role: 'USER', status: 'APPROVED', pontos: 0,
      });
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        mensagem: 'Usuário cadastrado com sucesso!',
        token: expect.any(String),
        usuario: expect.objectContaining({ nome: 'Maria', role: 'USER', status: 'APPROVED' }),
      }));
    });

    it('deve registrar INSTITUTION com status PENDING', async () => {
      req.body = { nome: 'ONG Boa', email: 'ong@email.com', senha: '123', role: 'INSTITUTION', cnpj: '12345678000199', telefone: '999', endereco: 'Rua X', descricaoInstituicao: 'Ajudamos' };
      prismaMock.user.findUnique.mockResolvedValue(null); // email ok, cnpj ok
      prismaMock.user.create.mockResolvedValue({
        id: 3, nome: 'ONG Boa', email: 'ong@email.com', role: 'INSTITUTION', status: 'PENDING', pontos: 0,
      });
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        usuario: expect.objectContaining({ status: 'PENDING' }),
      }));
    });

    it('deve retornar 500 em caso de erro interno', async () => {
      req.body = { nome: 'Ana', email: 'a@a.com', senha: '123' };
      prismaMock.user.findUnique.mockRejectedValue(new Error('DB Error'));
      await authController.register(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao registrar usuário.' });
    });
  });

  // ─── Login ───────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('deve retornar 400 se email faltar', async () => {
      req.body = { senha: '123' };
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Os campos email e senha são obrigatórios.' });
    });

    it('deve retornar 400 se senha faltar', async () => {
      req.body = { email: 'a@a.com' };
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 401 se usuário não existir', async () => {
      req.body = { email: 'a@a.com', senha: '123' };
      prismaMock.user.findUnique.mockResolvedValue(null);
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ erro: 'E-mail não encontrado na base de dados.' });
    });

    it('deve retornar 401 se senha estiver errada', async () => {
      req.body = { email: 'a@a.com', senha: 'errada' };
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1, email: 'a@a.com', senha: await bcrypt.hash('correta', 10), role: 'USER', status: 'APPROVED',
      });
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Email ou senha incorretos.' });
    });

    it('deve retornar 403 se conta for REJECTED', async () => {
      req.body = { email: 'a@a.com', senha: 'senha' };
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1, email: 'a@a.com', senha: await bcrypt.hash('senha', 10),
        role: 'USER', status: 'REJECTED', rejectionReason: 'Documentos inválidos',
      });
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ erro: 'Sua conta foi recusada' }));
    });

    it('deve retornar 403 se REJECTED sem motivo', async () => {
      req.body = { email: 'a@a.com', senha: 'senha' };
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1, email: 'a@a.com', senha: await bcrypt.hash('senha', 10),
        role: 'USER', status: 'REJECTED', rejectionReason: null,
      });
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        motivo: 'Sem detalhes fornecidos. Entre em contato com o suporte.',
      }));
    });

    it('deve retornar 403 se INSTITUTION com status PENDING', async () => {
      req.body = { email: 'ong@email.com', senha: 'senha' };
      prismaMock.user.findUnique.mockResolvedValue({
        id: 2, email: 'ong@email.com', senha: await bcrypt.hash('senha', 10),
        role: 'INSTITUTION', status: 'PENDING',
      });
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Sua conta ainda está em análise pelo administrador.' });
    });

    it('deve logar com sucesso e retornar token', async () => {
      req.body = { email: 'a@a.com', senha: 'senha' };
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1, nome: 'Usuário', email: 'a@a.com', senha: await bcrypt.hash('senha', 10),
        role: 'USER', status: 'APPROVED', pontos: 100,
      });
      await authController.login(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: expect.any(String),
        nome: 'Usuário',
        role: 'USER',
        status: 'APPROVED',
        pontos: 100,
      }));
    });

    it('deve retornar 500 em caso de erro interno', async () => {
      req.body = { email: 'a@a.com', senha: '123' };
      prismaMock.user.findUnique.mockRejectedValue(new Error('DB Error'));
      await authController.login(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao fazer login.' });
    });
  });

  // ─── Me ──────────────────────────────────────────────────────────────────────

  describe('me', () => {
    it('deve retornar 404 se usuário não existir no banco', async () => {
      req.user = { id: 99 };
      prismaMock.user.findUnique.mockResolvedValue(null);
      await authController.me(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado.' });
    });

    it('deve retornar os dados do usuário logado', async () => {
      req.user = { id: 1 };
      const mockUser = { id: 1, nome: 'João', email: 'joao@email.com', role: 'USER' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      await authController.me(req, res);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('deve retornar 500 em caso de erro interno', async () => {
      req.user = { id: 1 };
      prismaMock.user.findUnique.mockRejectedValue(new Error('DB Error'));
      await authController.me(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao buscar dados do usuário.' });
    });
  });

  // ─── UpdateProfile ───────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('deve atualizar perfil com sucesso', async () => {
      req.user = { id: 1 };
      req.body = { nome: 'Novo Nome', telefone: '11999999999', endereco: 'Rua A', descricaoInstituicao: 'Desc', necessidadesUrgentes: 'Roupas' };
      const mockUpdated = { id: 1, nome: 'Novo Nome', telefone: '11999999999', endereco: 'Rua A', email: 'a@a.com', cnpj: null, descricaoInstituicao: 'Desc', necessidadesUrgentes: 'Roupas' };
      prismaMock.user.update.mockResolvedValue(mockUpdated);
      await authController.updateProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Perfil atualizado com sucesso!', user: mockUpdated });
    });

    it('deve atualizar somente campos enviados (parcial)', async () => {
      req.user = { id: 1 };
      req.body = { nome: 'Só Nome' };
      prismaMock.user.update.mockResolvedValue({ id: 1, nome: 'Só Nome', email: 'a@a.com', telefone: null, endereco: null, cnpj: null, descricaoInstituicao: null, necessidadesUrgentes: null });
      await authController.updateProfile(req, res);
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { nome: 'Só Nome' },
      }));
    });

    it('deve retornar 500 em caso de erro interno', async () => {
      req.user = { id: 1 };
      req.body = { nome: 'X' };
      prismaMock.user.update.mockRejectedValue(new Error('DB Error'));
      await authController.updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao atualizar perfil.' });
    });
  });

  // ─── GetApprovedInstitutions ──────────────────────────────────────────────────

  describe('getApprovedInstitutions', () => {
    it('deve retornar lista de ONGs aprovadas', async () => {
      const mockOngs = [{ id: 1, nome: 'ONG Esperança', descricaoInstituicao: 'Ajuda', necessidadesUrgentes: 'Roupas' }];
      prismaMock.user.findMany.mockResolvedValue(mockOngs);
      await authController.getApprovedInstitutions(req, res);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { role: 'INSTITUTION', status: 'APPROVED' },
      }));
      expect(res.json).toHaveBeenCalledWith(mockOngs);
    });

    it('deve retornar 500 em caso de erro interno', async () => {
      prismaMock.user.findMany.mockRejectedValue(new Error('DB Error'));
      await authController.getApprovedInstitutions(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao buscar ONGs.' });
    });
  });
});
