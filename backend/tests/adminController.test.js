const { mockDeep } = require('jest-mock-extended');

const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);

const adminController = require('../src/controllers/adminController');

describe('Admin Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1, role: 'ADMIN' }, body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ─── getAllInstitutions ───────────────────────────────────────────────────────

  describe('getAllInstitutions', () => {
    it('deve retornar lista de todas as ONGs', async () => {
      const mockList = [{ id: 1, nome: 'ONG A', role: 'INSTITUTION' }];
      prismaMock.user.findMany.mockResolvedValue(mockList);
      await adminController.getAllInstitutions(req, res);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { role: 'INSTITUTION' },
      }));
      expect(res.json).toHaveBeenCalledWith(mockList);
    });

    it('deve retornar 500 em caso de erro', async () => {
      prismaMock.user.findMany.mockRejectedValue(new Error('DB fail'));
      await adminController.getAllInstitutions(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao buscar instituições.' });
    });
  });

  // ─── approveInstitution ───────────────────────────────────────────────────────

  describe('approveInstitution', () => {
    it('deve retornar 404 se instituição não existir', async () => {
      req.params.id = '99';
      prismaMock.user.findUnique.mockResolvedValue(null);
      await adminController.approveInstitution(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Instituição não encontrada.' });
    });

    it('deve retornar 404 se usuário não for INSTITUTION', async () => {
      req.params.id = '2';
      prismaMock.user.findUnique.mockResolvedValue({ id: 2, role: 'USER' });
      await adminController.approveInstitution(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve aprovar instituição com sucesso', async () => {
      req.params.id = '2';
      const mockOng = { id: 2, role: 'INSTITUTION', status: 'PENDING' };
      prismaMock.user.findUnique.mockResolvedValue(mockOng);
      prismaMock.user.update.mockResolvedValue({ ...mockOng, status: 'APPROVED' });
      prismaMock.user.findMany.mockResolvedValue([{ ...mockOng, status: 'APPROVED' }]);
      await adminController.approveInstitution(req, res);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { status: 'APPROVED' },
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: 'Instituição aprovada com sucesso!' }));
    });

    it('deve retornar 500 em caso de erro', async () => {
      req.params.id = '2';
      prismaMock.user.findUnique.mockRejectedValue(new Error('DB fail'));
      await adminController.approveInstitution(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao aprovar instituição.' });
    });
  });

  // ─── rejectInstitution ───────────────────────────────────────────────────────

  describe('rejectInstitution', () => {
    it('deve retornar 404 se instituição não existir', async () => {
      req.params.id = '99';
      req.body = { reason: 'Documentos inválidos' };
      prismaMock.user.findUnique.mockResolvedValue(null);
      await adminController.rejectInstitution(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Instituição não encontrada.' });
    });

    it('deve retornar 404 se usuário não for INSTITUTION', async () => {
      req.params.id = '2';
      prismaMock.user.findUnique.mockResolvedValue({ id: 2, role: 'USER' });
      await adminController.rejectInstitution(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve rejeitar instituição com motivo informado', async () => {
      req.params.id = '2';
      req.body = { reason: 'CNPJ inválido' };
      const mockOng = { id: 2, role: 'INSTITUTION', status: 'PENDING' };
      prismaMock.user.findUnique.mockResolvedValue(mockOng);
      prismaMock.user.update.mockResolvedValue({ ...mockOng, status: 'REJECTED' });
      prismaMock.user.findMany.mockResolvedValue([{ ...mockOng, status: 'REJECTED' }]);
      await adminController.rejectInstitution(req, res);
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { status: 'REJECTED', rejectionReason: 'CNPJ inválido' },
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: 'Instituição rejeitada com sucesso.' }));
    });

    it('deve rejeitar com motivo padrão se reason não informado', async () => {
      req.params.id = '2';
      req.body = {};
      prismaMock.user.findUnique.mockResolvedValue({ id: 2, role: 'INSTITUTION' });
      prismaMock.user.update.mockResolvedValue({});
      prismaMock.user.findMany.mockResolvedValue([]);
      await adminController.rejectInstitution(req, res);
      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { status: 'REJECTED', rejectionReason: 'Motivo não especificado pela moderação.' },
      }));
    });

    it('deve retornar 500 em caso de erro', async () => {
      req.params.id = '2';
      prismaMock.user.findUnique.mockRejectedValue(new Error('DB fail'));
      await adminController.rejectInstitution(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao modificar status.' });
    });
  });

  // ─── getAdminStats ───────────────────────────────────────────────────────────

  describe('getAdminStats', () => {
    it('deve retornar estatísticas corretamente', async () => {
      prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: 500 } });
      prismaMock.donation.count.mockResolvedValue(10);
      prismaMock.user.count.mockImplementation(async ({ where }) =>
        where.role === 'INSTITUTION' ? 5 : 20
      );
      prismaMock.$queryRaw.mockResolvedValue([
        { mes: 1, ano: 2025, total: 3 },
        { mes: 2, ano: 2025, total: 7 },
      ]);
      prismaMock.donation.groupBy.mockResolvedValue([
        { tipo: 'financeira', _count: { tipo: 8 } },
        { tipo: 'item', _count: { tipo: 2 } },
      ]);
      await adminController.getAdminStats(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        kpis: expect.objectContaining({ totalDoado: 'R$ 500,00', totalDoacoes: '10' }),
        chartData: expect.arrayContaining([expect.objectContaining({ name: 'Jan', value: 3 })]),
        pieData: expect.arrayContaining([
          expect.objectContaining({ name: 'Financeira', value: 80 }),
          expect.objectContaining({ name: 'Itens', value: 20 }),
        ]),
      }));
    });

    it('deve tratar _sum.valor nulo como zero', async () => {
      prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: null } });
      prismaMock.donation.count.mockResolvedValue(0);
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.$queryRaw.mockResolvedValue([]);
      prismaMock.donation.groupBy.mockResolvedValue([]);
      await adminController.getAdminStats(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        kpis: expect.objectContaining({ totalDoado: 'R$ 0,00' }),
        pieData: [],
      }));
    });

    it('deve retornar 500 em caso de erro', async () => {
      prismaMock.donation.aggregate.mockRejectedValue(new Error('DB fail'));
      await adminController.getAdminStats(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao buscar estatísticas.' });
    });
  });

  // ─── getAllDonations ──────────────────────────────────────────────────────────

  describe('getAllDonations', () => {
    const mockDoacoes = [
      { id: 1, criadoEm: new Date('2025-01-15'), tipo: 'financeira', valor: 100, item: null, user: { id: 1, nome: 'João' }, institution: { id: 2, nome: 'ONG A' } },
      { id: 2, criadoEm: new Date('2025-02-20'), tipo: 'item', valor: null, item: 'Camisas', user: null, institution: null },
    ];

    it('deve retornar doações com paginação padrão', async () => {
      req.query = {};
      prismaMock.donation.count.mockResolvedValue(2);
      prismaMock.donation.findMany.mockResolvedValue(mockDoacoes);
      await adminController.getAllDonations(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        meta: expect.objectContaining({ page: 1, limit: 20, total: 2 }),
        data: expect.arrayContaining([
          expect.objectContaining({ doador: 'João', tipo: 'Financeira', destinatario: 'ONG A' }),
          expect.objectContaining({ doador: 'Anônimo', tipo: 'Itens', valorItens: 'Camisas', destinatario: 'Sem destinatário' }),
        ]),
      }));
    });

    it('deve filtrar por search', async () => {
      req.query = { search: 'João', page: '1', limit: '10' };
      prismaMock.donation.count.mockResolvedValue(1);
      prismaMock.donation.findMany.mockResolvedValue([mockDoacoes[0]]);
      await adminController.getAllDonations(req, res);
      expect(prismaMock.donation.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) }));
    });

    it('deve retornar 500 em caso de erro', async () => {
      req.query = {};
      prismaMock.donation.count.mockRejectedValue(new Error('DB fail'));
      await adminController.getAllDonations(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao buscar doações.' });
    });
  });

  // ─── getAllUsers ──────────────────────────────────────────────────────────────

  describe('getAllUsers', () => {
    const mockUsers = [
      { id: 1, nome: 'Ana', email: 'ana@email.com', role: 'USER', status: 'APPROVED' },
      { id: 2, nome: 'ONG X', email: 'ong@email.com', role: 'INSTITUTION', status: 'PENDING' },
      { id: 3, nome: 'Admin', email: 'admin@email.com', role: 'ADMIN', status: 'APPROVED' },
      { id: 4, nome: 'Unknown', email: 'u@email.com', role: 'OTHER', status: 'OTHER' },
    ];

    it('deve retornar todos os usuários sem filtro', async () => {
      req.query = {};
      prismaMock.user.findMany.mockResolvedValue(mockUsers);
      await adminController.getAllUsers(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ tipo: 'Doador', status: 'Ativo' }),
        expect.objectContaining({ tipo: 'ONG', status: 'Pendente' }),
        expect.objectContaining({ tipo: 'Administrador', status: 'Ativo' }),
        expect.objectContaining({ tipo: 'OTHER', status: 'OTHER' }), // fallback para tipos desconhecidos
      ]));
    });

    it('deve filtrar por role Doadores', async () => {
      req.query = { role: 'Doadores' };
      prismaMock.user.findMany.mockResolvedValue([mockUsers[0]]);
      await adminController.getAllUsers(req, res);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ role: 'USER' }),
      }));
    });

    it('deve filtrar por search', async () => {
      req.query = { search: 'Ana' };
      prismaMock.user.findMany.mockResolvedValue([mockUsers[0]]);
      await adminController.getAllUsers(req, res);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      }));
    });

    it('deve retornar 500 em caso de erro', async () => {
      req.query = {};
      prismaMock.user.findMany.mockRejectedValue(new Error('DB fail'));
      await adminController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao buscar usuários.' });
    });
  });

  // ─── promoteToAdmin ───────────────────────────────────────────────────────────

  describe('promoteToAdmin', () => {
    it('deve retornar 404 se usuário não existir', async () => {
      req.params.id = '99';
      prismaMock.user.findUnique.mockResolvedValue(null);
      await adminController.promoteToAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado.' });
    });

    it('deve retornar 400 se usuário já for admin', async () => {
      req.params.id = '2';
      prismaMock.user.findUnique.mockResolvedValue({ id: 2, role: 'ADMIN', nome: 'Admin' });
      await adminController.promoteToAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário já é administrador.' });
    });

    it('deve promover usuário a admin com sucesso', async () => {
      req.params.id = '3';
      prismaMock.user.findUnique.mockResolvedValue({ id: 3, role: 'USER', nome: 'João' });
      prismaMock.user.update.mockResolvedValue({ id: 3, role: 'ADMIN' });
      await adminController.promoteToAdmin(req, res);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { role: 'ADMIN', status: 'APPROVED' },
      });
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'João agora é administrador.' });
    });

    it('deve retornar 500 em caso de erro', async () => {
      req.params.id = '3';
      prismaMock.user.findUnique.mockRejectedValue(new Error('DB fail'));
      await adminController.promoteToAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno.' });
    });
  });

  // ─── demoteAdmin ─────────────────────────────────────────────────────────────

  describe('demoteAdmin', () => {
    it('deve retornar 404 se usuário não existir', async () => {
      req.params.id = '99';
      prismaMock.user.findUnique.mockResolvedValue(null);
      await adminController.demoteAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Usuário não encontrado.' });
    });

    it('deve retornar 400 se tentar remover sua própria role', async () => {
      req.user = { id: 1 };
      req.params.id = '1';
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, role: 'ADMIN', nome: 'Self' });
      await adminController.demoteAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Você não pode remover sua própria role.' });
    });

    it('deve rebaixar admin com sucesso', async () => {
      req.user = { id: 1 };
      req.params.id = '2';
      prismaMock.user.findUnique.mockResolvedValue({ id: 2, role: 'ADMIN', nome: 'Outro' });
      prismaMock.user.update.mockResolvedValue({ id: 2, role: 'USER' });
      await adminController.demoteAdmin(req, res);
      expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id: 2 }, data: { role: 'USER' } });
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Outro voltou a ser doador.' });
    });

    it('deve retornar 500 em caso de erro', async () => {
      req.params.id = '2';
      prismaMock.user.findUnique.mockRejectedValue(new Error('DB fail'));
      await adminController.demoteAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno.' });
    });
  });

  // ─── getReports ───────────────────────────────────────────────────────────────

  describe('getReports', () => {
    it('deve retornar relatório com datas padrão', async () => {
      req.query = {};
      prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: 1200 } });
      prismaMock.donation.count.mockResolvedValue(15);
      prismaMock.user.count.mockResolvedValue(8);
      prismaMock.$queryRaw.mockResolvedValue([
        { mes: 3, ano: 2025, total: 5, valor: 600 },
      ]);
      prismaMock.donation.groupBy.mockResolvedValue([
        { tipo: 'financeira', _count: { tipo: 10 }, _sum: { valor: 1000 } },
        { tipo: 'item', _count: { tipo: 5 }, _sum: { valor: 0 } },
      ]);
      await adminController.getReports(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        kpis: expect.objectContaining({
          totalFinanceiro: expect.stringContaining('R$'),
          totalDoacoes: 15,
          totalUsuarios: 8,
          ticketMedio: expect.stringContaining('R$'),
        }),
        chartData: expect.arrayContaining([expect.objectContaining({ name: 'Mar', value: 5 })]),
      }));
    });

    it('deve retornar relatório com filtro de datas específico', async () => {
      req.query = { from: '2025-01-01', to: '2025-03-31' };
      prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: null } });
      prismaMock.donation.count.mockResolvedValue(0);
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.$queryRaw.mockResolvedValue([]);
      prismaMock.donation.groupBy.mockResolvedValue([]);
      await adminController.getReports(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        kpis: expect.objectContaining({ totalDoacoes: 0, ticketMedio: 'R$ 0.00' }),
      }));
    });

    it('deve retornar 500 em caso de erro', async () => {
      req.query = {};
      prismaMock.donation.aggregate.mockRejectedValue(new Error('DB fail'));
      await adminController.getReports(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao gerar relatório.' });
    });
  });

  // ─── createReward ─────────────────────────────────────────────────────────────

  describe('createReward', () => {
    it('deve retornar 400 se nome ou tipo faltarem', async () => {
      req.body = { descricao: 'Sem nome e tipo' };
      await adminController.createReward(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Nome e tipo são obrigatórios.' });
    });

    it('deve criar recompensa com sucesso', async () => {
      req.body = { nome: 'Cupom iFood', tipo: 'desconto', custoPontos: '500', estoque: '10', preco: '29.90', pontosBonus: '50', imagemUrl: 'http://img.com/a.png' };
      const mockReward = { id: 1, nome: 'Cupom iFood', tipo: 'desconto', custoPontos: 500, estoque: 10, preco: 29.90, pontosBonus: 50, ativo: true };
      prismaMock.reward.create.mockResolvedValue(mockReward);
      await adminController.createReward(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReward);
    });

    it('deve criar recompensa sem preco e pontosBonus (null)', async () => {
      req.body = { nome: 'Item', tipo: 'produto' };
      const mockReward = { id: 2, nome: 'Item', tipo: 'produto', custoPontos: 0, estoque: 0, preco: null, pontosBonus: null, ativo: true };
      prismaMock.reward.create.mockResolvedValue(mockReward);
      await adminController.createReward(req, res);
      expect(prismaMock.reward.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ preco: null, pontosBonus: null }),
      }));
    });

    it('deve retornar 500 em caso de erro', async () => {
      req.body = { nome: 'X', tipo: 'Y' };
      prismaMock.reward.create.mockRejectedValue(new Error('DB fail'));
      await adminController.createReward(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao criar produto.' });
    });
  });

  // ─── updateReward ─────────────────────────────────────────────────────────────

  describe('updateReward', () => {
    it('deve atualizar recompensa com sucesso', async () => {
      req.params.id = '1';
      req.body = { nome: 'Novo Nome', tipo: 'produto', custoPontos: '300', estoque: '5', preco: '19.90', pontosBonus: '0', ativo: true, imagemUrl: 'http://img.com/b.png' };
      const mockUpdated = { id: 1, nome: 'Novo Nome' };
      prismaMock.reward.update.mockResolvedValue(mockUpdated);
      await adminController.updateReward(req, res);
      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('deve tratar preco e pontosBonus como null quando string vazia', async () => {
      req.params.id = '1';
      req.body = { nome: 'Item', tipo: 'produto', custoPontos: '100', estoque: '2', preco: '', pontosBonus: '', ativo: false, imagemUrl: '' };
      prismaMock.reward.update.mockResolvedValue({ id: 1 });
      await adminController.updateReward(req, res);
      expect(prismaMock.reward.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ preco: null, pontosBonus: null, ativo: false }),
      }));
    });

    it('deve retornar 500 em caso de erro', async () => {
      req.params.id = '1';
      req.body = { nome: 'X', tipo: 'Y' };
      prismaMock.reward.update.mockRejectedValue(new Error('DB fail'));
      await adminController.updateReward(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao atualizar produto.' });
    });
  });

  // ─── deleteReward ─────────────────────────────────────────────────────────────

  describe('deleteReward', () => {
    it('deve excluir recompensa com sucesso', async () => {
      req.params.id = '1';
      prismaMock.reward.delete.mockResolvedValue({ id: 1 });
      await adminController.deleteReward(req, res);
      expect(prismaMock.reward.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Produto removido com sucesso.' });
    });

    it('deve retornar 500 em caso de erro', async () => {
      req.params.id = '1';
      prismaMock.reward.delete.mockRejectedValue(new Error('DB fail'));
      await adminController.deleteReward(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao remover produto.' });
    });
  });
});
