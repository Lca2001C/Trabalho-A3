const { mockDeep } = require('jest-mock-extended');

const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);

const adminController = require('../src/controllers/adminController');

describe('Admin Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1, role: 'ADMIN' }, body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getAdminStats', () => {

    it('deve retornar as estatísticas corretamente', async () => {
      prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: 500 } });
      prismaMock.donation.count.mockResolvedValue(10);
      prismaMock.user.count.mockImplementation(async ({ where }) => {
        if (where.role === 'INSTITUTION') return 5;
        return 20; // fallback for DOADOR
      });
      prismaMock.donation.groupBy.mockResolvedValue([
        { tipo: 'financeira', _count: { tipo: 8 } },
        { tipo: 'item', _count: { tipo: 2 } }
      ]);
      prismaMock.$queryRaw.mockResolvedValue([]); // Mock para os gráficos de meses

      await adminController.getAdminStats(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        kpis: expect.objectContaining({
          totalDoado: 'R$ 500,00',
          totalDoacoes: '10',
          ongsCadastradas: '5',
          usuariosCadastrados: '20'
        }),
        pieData: expect.arrayContaining([
          expect.objectContaining({ name: 'Financeira', value: 80 }),
          expect.objectContaining({ name: 'Itens', value: 20 })
        ]),
        chartData: expect.any(Array)
      }));
    });
  });

  describe('approveInstitution', () => {
    it('deve aprovar uma instituição', async () => {
      req.params.id = '2';
      req.body = { status: 'APPROVED' };
      
      const mockOng = { id: 2, role: 'INSTITUTION', status: 'PENDING', email: 'ong@test.com' };
      prismaMock.user.findUnique.mockResolvedValue(mockOng);
      prismaMock.user.update.mockResolvedValue({ ...mockOng, status: 'APPROVED' });

      await adminController.approveInstitution(req, res);
      
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { status: 'APPROVED' }
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: 'Instituição aprovada com sucesso!' }));
    });
  });

  describe('promoteToAdmin', () => {
    it('deve alterar role de um usuário', async () => {
      req.params.id = '3';
      req.body = { newRole: 'ADMIN' };
      
      prismaMock.user.findUnique.mockResolvedValue({ id: 3, role: 'USER', nome: 'João' });
      prismaMock.user.update.mockResolvedValue({ id: 3, role: 'ADMIN' });

      await adminController.promoteToAdmin(req, res);
      
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { role: 'ADMIN', status: 'APPROVED' }
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: 'João agora é administrador.' })); // the mock user doesn't have nome, so it resolves to undefined or we should mock it
    });
  });
});
