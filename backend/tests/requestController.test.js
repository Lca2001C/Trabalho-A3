const { mockDeep } = require('jest-mock-extended');
const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);
const requestController = require('../src/controllers/requestController');

describe('Request Controller', () => {
  let req, res;
  beforeEach(() => {
    req = { user: { id: 1, role: 'INSTITUTION' }, body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  // ─── getRequests ──────────────────────────────────────────────────────────────

  describe('getRequests', () => {
    it('403 se não for INSTITUTION', async () => {
      req.user.role = 'USER';
      await requestController.getRequests(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Apenas ONGs podem acessar solicitações.' });
    });

    it('retorna lista de solicitações formatadas', async () => {
      prismaMock.request.findMany.mockResolvedValue([
        { id: 1, name: 'Cobertores', qty: 10, urgency: 'Alta', status: 'Pendente', criadoEm: new Date('2025-01-15') },
      ]);
      await requestController.getRequests(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 1, name: 'Cobertores', qty: 10, urgency: 'Alta' }),
      ]));
    });

    it('retorna 500 em erro', async () => {
      prismaMock.request.findMany.mockRejectedValue(new Error('DB'));
      await requestController.getRequests(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao buscar solicitações.' });
    });
  });

  // ─── createRequest ────────────────────────────────────────────────────────────

  describe('createRequest', () => {
    it('403 se não for INSTITUTION', async () => {
      req.user.role = 'USER';
      await requestController.createRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Apenas ONGs podem criar solicitações.' });
    });

    it('400 se name ausente', async () => {
      req.body = { qty: 5 };
      await requestController.createRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Os campos name e qty são obrigatórios.' });
    });

    it('400 se qty ausente', async () => {
      req.body = { name: 'Roupas' };
      await requestController.createRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('400 se urgência inválida', async () => {
      req.body = { name: 'Roupas', qty: 5, urgency: 'Urgentissimo' };
      await requestController.createRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Urgência inválida. Use: Baixa, Média ou Alta.' });
    });

    it('cria solicitação com urgência informada', async () => {
      req.body = { name: 'Cobertores', qty: 10, urgency: 'Alta' };
      const mockReq = { id: 1, name: 'Cobertores', qty: 10, urgency: 'Alta', status: 'Pendente', criadoEm: new Date() };
      prismaMock.request.create.mockResolvedValue(mockReq);
      await requestController.createRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Cobertores', urgency: 'Alta' }));
    });

    it('cria solicitação com urgência padrão (Média) quando não informada', async () => {
      req.body = { name: 'Alimentos', qty: 20 };
      const mockReq = { id: 2, name: 'Alimentos', qty: 20, urgency: 'Média', status: 'Pendente', criadoEm: new Date() };
      prismaMock.request.create.mockResolvedValue(mockReq);
      await requestController.createRequest(req, res);
      expect(prismaMock.request.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ urgency: 'Média' }),
      }));
    });

    it('retorna 500 em erro', async () => {
      req.body = { name: 'X', qty: 1 };
      prismaMock.request.create.mockRejectedValue(new Error('DB'));
      await requestController.createRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao criar solicitação.' });
    });
  });

  // ─── updateRequestStatus ──────────────────────────────────────────────────────

  describe('updateRequestStatus', () => {
    it('404 se solicitação não encontrada', async () => {
      req.params.id = '99';
      req.body = { status: 'Atendido' };
      prismaMock.request.findUnique.mockResolvedValue(null);
      await requestController.updateRequestStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Solicitação não encontrada.' });
    });

    it('403 se ONG diferente e não for ADMIN', async () => {
      req.user = { id: 1, role: 'INSTITUTION' };
      req.params.id = '5';
      req.body = { status: 'Atendido' };
      prismaMock.request.findUnique.mockResolvedValue({ id: 5, institutionId: 99 });
      await requestController.updateRequestStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Sem permissão.' });
    });

    it('atualiza status da própria ONG', async () => {
      req.user = { id: 1, role: 'INSTITUTION' };
      req.params.id = '1';
      req.body = { status: 'Atendido' };
      prismaMock.request.findUnique.mockResolvedValue({ id: 1, institutionId: 1 });
      prismaMock.request.update.mockResolvedValue({ id: 1, status: 'Atendido' });
      await requestController.updateRequestStatus(req, res);
      expect(prismaMock.request.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { status: 'Atendido' } });
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Status atualizado.', status: 'Atendido' });
    });

    it('ADMIN pode atualizar qualquer solicitação', async () => {
      req.user = { id: 1, role: 'ADMIN' };
      req.params.id = '5';
      req.body = { status: 'Pendente' };
      prismaMock.request.findUnique.mockResolvedValue({ id: 5, institutionId: 99 });
      prismaMock.request.update.mockResolvedValue({ id: 5, status: 'Pendente' });
      await requestController.updateRequestStatus(req, res);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Status atualizado.', status: 'Pendente' });
    });

    it('400 se status fora da lista permitida', async () => {
      req.user = { id: 1, role: 'ADMIN' };
      req.params.id = '5';
      req.body = { status: 'Cancelado' };
      await requestController.updateRequestStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Status inválido. Use: Pendente, Atendido.' });
    });

    it('retorna 500 em erro', async () => {
      req.params.id = '1';
      req.body = { status: 'Atendido' };
      prismaMock.request.findUnique.mockRejectedValue(new Error('DB'));
      await requestController.updateRequestStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno.' });
    });
  });
});
