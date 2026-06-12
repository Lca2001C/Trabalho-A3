const { mockDeep } = require('jest-mock-extended');
const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);
const rewardController = require('../src/controllers/rewardController');

describe('Reward Controller', () => {
  let req, res;
  beforeEach(() => {
    req = { user: { id: 1 }, body: {}, params: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('listRewards', () => {
    it('retorna lista de recompensas ativas', async () => {
      prismaMock.reward.findMany.mockResolvedValue([{ id: 1, nome: 'Cupom', ativo: true }]);
      await rewardController.listRewards(req, res);
      expect(prismaMock.reward.findMany).toHaveBeenCalledWith({ where: { ativo: true } });
      expect(res.json).toHaveBeenCalledWith([{ id: 1, nome: 'Cupom', ativo: true }]);
    });
    it('retorna 500 em erro', async () => {
      prismaMock.reward.findMany.mockRejectedValue(new Error('DB'));
      await rewardController.listRewards(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao buscar recompensas.' });
    });
  });

  describe('redeemReward', () => {
    it('400 se rewardId não informado', async () => {
      await rewardController.redeemReward(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'O ID da recompensa é obrigatório e deve ser numérico.' });
    });
    it('404 se recompensa não encontrada', async () => {
      req.body.rewardId = '99';
      prismaMock.reward.findUnique.mockResolvedValue(null);
      await rewardController.redeemReward(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('404 se recompensa inativa', async () => {
      req.body.rewardId = '1';
      prismaMock.reward.findUnique.mockResolvedValue({ id: 1, ativo: false, estoque: 5, custoPontos: 100 });
      await rewardController.redeemReward(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('400 se estoque esgotado', async () => {
      req.body.rewardId = '1';
      prismaMock.reward.findUnique.mockResolvedValue({ id: 1, ativo: true, estoque: 0, custoPontos: 100 });
      await rewardController.redeemReward(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Recompensa esgotada (sem estoque).' });
    });
    it('400 se saldo insuficiente', async () => {
      req.body.rewardId = '1';
      prismaMock.reward.findUnique.mockResolvedValue({ id: 1, ativo: true, estoque: 5, custoPontos: 500 });
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, pontos: 100 });
      await rewardController.redeemReward(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Saldo insuficiente. Esta recompensa custa 500 pontos e você possui 100 pontos.' });
    });
    it('realiza resgate com sucesso', async () => {
      req.body.rewardId = '1';
      prismaMock.reward.findUnique.mockResolvedValue({ id: 1, ativo: true, estoque: 10, custoPontos: 200 });
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, pontos: 1000 });
      // O controller agora usa os pontos reais retornados pelo update (pós-transação)
      prismaMock.user.update.mockResolvedValue({ pontos: 800 });
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.redemption.create.mockResolvedValue({ id: 1 });
      await rewardController.redeemReward(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        mensagem: 'Resgate realizado com sucesso!',
        codigo: expect.stringContaining('CONECTABEM-'),
        pontosRestantes: 800,
      }));
    });
    it('retorna 500 em erro', async () => {
      req.body.rewardId = '1';
      prismaMock.reward.findUnique.mockRejectedValue(new Error('DB'));
      await rewardController.redeemReward(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao processar resgate.' });
    });
  });

  describe('getUserRedemptions', () => {
    it('retorna histórico de resgates do usuário', async () => {
      prismaMock.redemption.findMany.mockResolvedValue([{ id: 1, rewardId: 1 }]);
      await rewardController.getUserRedemptions(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, rewardId: 1 }]);
    });
    it('retorna 500 em erro', async () => {
      prismaMock.redemption.findMany.mockRejectedValue(new Error('DB'));
      await rewardController.getUserRedemptions(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao buscar histórico de resgates.' });
    });
  });

  describe('getRanking', () => {
    it('retorna ranking geral (period=all)', async () => {
      req.query.period = 'all';
      prismaMock.user.findMany.mockResolvedValue([
        { id: 2, nome: 'Top', pontos: 999, avatar: null },
        { id: 1, nome: 'Eu', pontos: 500, avatar: null },
      ]);
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, nome: 'Eu', pontos: 500, avatar: null });
      await rewardController.getRanking(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        ranking: expect.arrayContaining([expect.objectContaining({ pos: 1, name: 'Top' })]),
        period: 'all',
      }));
    });
    it('calcula myPosition quando usuário não está no top10 (all)', async () => {
      req.query.period = 'all';
      const top10 = Array.from({ length: 10 }, (_, i) => ({ id: i + 10, nome: `User${i}`, pontos: 1000 - i * 10, avatar: null }));
      prismaMock.user.findMany.mockResolvedValue(top10);
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, nome: 'Eu', pontos: 5, avatar: null });
      await rewardController.getRanking(req, res);
      const result = res.json.mock.calls[0][0];
      expect(result.myPosition).not.toBeNull();
      expect(result.myPosition.isMe).toBe(true);
    });
    it('retorna ranking mensal com myPosition quando usuário não está no top10', async () => {
      req.user = { id: 1 };
      req.query.period = 'monthly';
      // top10 não inclui o usuário id=1
      prismaMock.donation.groupBy.mockResolvedValue([{ userId: 2, _sum: { pontosGerados: 300 } }]);
      prismaMock.user.findMany.mockResolvedValue([{ id: 2, nome: 'Ana', pontos: 300, avatar: null }]);
      // aggregate para o usuário logado — tem pontos no período
      prismaMock.donation.aggregate.mockResolvedValue({ _sum: { pontosGerados: 50 } });
      // findUnique para myUser
      prismaMock.user.findUnique.mockResolvedValue({ id: 1, nome: 'Eu', avatar: null });
      await rewardController.getRanking(req, res);
      const result = res.json.mock.calls[0][0];
      expect(result.period).toBe('monthly');
      expect(result.myPosition).not.toBeNull();
      expect(result.myPosition.isMe).toBe(true);
      expect(result.myPosition.points).toBe(50);
    });
    it('retorna myPosition null quando findUnique retorna null (período)', async () => {
      req.user = { id: 1 };
      req.query.period = 'weekly';
      prismaMock.donation.groupBy.mockResolvedValue([]);
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.donation.aggregate.mockResolvedValue({ _sum: { pontosGerados: null } });
      prismaMock.user.findUnique.mockResolvedValue(null);
      await rewardController.getRanking(req, res);
      const result = res.json.mock.calls[0][0];
      expect(result.myPosition).toBeNull();
    });
    it('retorna 500 em erro', async () => {
      req.query.period = 'all';
      prismaMock.user.findMany.mockRejectedValue(new Error('DB'));
      await rewardController.getRanking(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao buscar ranking.' });
    });
  });
});
