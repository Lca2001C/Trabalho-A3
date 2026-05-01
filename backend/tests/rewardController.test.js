const { mockDeep } = require('jest-mock-extended');

const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);

const rewardController = require('../src/controllers/rewardController');

describe('Reward Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1 }, body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('listRewards', () => {
    it('deve listar recompensas ativas', async () => {
      const mockRewards = [{ id: 1, nome: 'Cupom iFood', ativo: true }];
      prismaMock.reward.findMany.mockResolvedValue(mockRewards);
      
      await rewardController.listRewards(req, res);
      
      expect(prismaMock.reward.findMany).toHaveBeenCalledWith({ where: { ativo: true } });
      expect(res.json).toHaveBeenCalledWith(mockRewards);
    });
  });

  describe('redeemReward', () => {
    it('deve retornar 404 se recompensa não existir', async () => {
      req.body.rewardId = '99';
      prismaMock.reward.findUnique.mockResolvedValue(null);
      
      await rewardController.redeemReward(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Recompensa não encontrada ou inativa.' });
    });

    it('deve retornar 400 se usuário não tiver pontos suficientes', async () => {
      req.body.rewardId = '1';
      prismaMock.reward.findUnique.mockResolvedValue({ id: 1, custoPontos: 500, estoque: 10, ativo: true });
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, pontos: 100 });
      
      await rewardController.redeemReward(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Saldo insuficiente. Esta recompensa custa 500 pontos e você possui 100 pontos.' });
    });

    it('deve realizar resgate com sucesso e deduzir pontos', async () => {
      req.body.rewardId = '1';
      const mockReward = { id: 1, custoPontos: 500, estoque: 10, ativo: true };
      const mockUser = { id: 1, pontos: 1000 };
      
      prismaMock.reward.findUnique.mockResolvedValue(mockReward);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });

      prismaMock.redemption.create.mockResolvedValue({ id: 1, codigo: 'CUPOM-123' });

      await rewardController.redeemReward(req, res);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { pontos: { decrement: 500 } }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: 'Resgate realizado com sucesso!' }));
    });
  });
});
