const { mockDeep } = require('jest-mock-extended');
const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);
const donationController = require('../src/controllers/donationController');

describe('Donation Controller', () => {
  let req, res;
  beforeEach(() => {
    req = { user: { id: 1, tipo: 'admin', role: 'ADMIN' }, body: {}, params: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.resetAllMocks();
    // Restaura os mocks do res após o reset
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
  });

  describe('getMultiplier', () => {
    it('retorna multiplicador 1 se já houver doações', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ _count: { donations: 3 } });
      await donationController.getMultiplier(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ multiplicador: 1, motivo: 'Base' }));
    });
    it('retorna multiplicador 3 na primeira doação', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ _count: { donations: 0 } });
      await donationController.getMultiplier(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ multiplicador: 3 }));
    });
    it('retorna 500 em erro interno', async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error('DB'));
      await donationController.getMultiplier(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createDonation', () => {
    it('400 se tipo ausente', async () => {
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('400 se tipo inválido', async () => {
      req.body = { tipo: 'invalido' };
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('400 para item sem campo item', async () => {
      req.body = { tipo: 'item' };
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('400 para financeira sem valor', async () => {
      req.body = { tipo: 'financeira', valor: 0 };
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('404 se institutionId não existir', async () => {
      req.body = { tipo: 'financeira', valor: 50, institutionId: 99 };
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ _count: { donations: 1 }, campanhaAtiva: false, recorrenteAtiva: false })
        .mockResolvedValueOnce(null);
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('400 se instituição não estiver aprovada', async () => {
      req.body = { tipo: 'financeira', valor: 50, institutionId: 2 };
      // findUnique: 1ª chamada = calcularPontos (user), 2ª chamada = validação institutionId
      prismaMock.user.findUnique
        .mockResolvedValueOnce({ id: 2, role: 'INSTITUTION', status: 'PENDING' }) // validação institution
        .mockResolvedValueOnce({ _count: { donations: 1 }, campanhaAtiva: false, recorrenteAtiva: false }); // calcularPontos
      // A validação de institution acontece ANTES de calcularPontos no código
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('usa multiplicador 4x para campanha ativa', async () => {
      req.body = { tipo: 'financeira', valor: 100, isCampaign: true };
      prismaMock.user.findUnique.mockResolvedValue({ _count: { donations: 5 }, campanhaAtiva: true, recorrenteAtiva: false });
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.donation.create.mockResolvedValue({ id: 3, tipo: 'financeira', valor: 100, status: 'aprovada', item: null, criadoEm: new Date(), pontosGerados: 800 });
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('usa multiplicador 2.5x para doação recorrente', async () => {
      req.body = { tipo: 'financeira', valor: 100 };
      prismaMock.user.findUnique.mockResolvedValue({ _count: { donations: 5 }, campanhaAtiva: false, recorrenteAtiva: true });
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.donation.create.mockResolvedValue({ id: 4, tipo: 'financeira', valor: 100, status: 'aprovada', item: null, criadoEm: new Date(), pontosGerados: 500 });
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    it('cria doação financeira com sucesso', async () => {
      req.body = { tipo: 'financeira', valor: 100 };
      prismaMock.user.findUnique.mockResolvedValue({ _count: { donations: 1 }, campanhaAtiva: false, recorrenteAtiva: false });
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.donation.create.mockResolvedValue({ id: 1, tipo: 'financeira', valor: 100, status: 'aprovada', item: null, criadoEm: new Date(), pontosGerados: 200 });
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: 'Doação realizada com sucesso!' }));
    });
    it('cria doação de item com mensagem de pendência', async () => {
      req.body = { tipo: 'item', item: 'Camisas' };
      prismaMock.user.findUnique.mockResolvedValue({ _count: { donations: 0 }, campanhaAtiva: false, recorrenteAtiva: false });
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.donation.create.mockResolvedValue({ id: 2, tipo: 'item', valor: null, status: 'pendente', item: 'Camisas', criadoEm: new Date(), pontosGerados: 15 });
      await donationController.createDonation(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ pontosGanhos: 0 }));
    });
    it('retorna 500 em erro interno', async () => {
      req.body = { tipo: 'financeira', valor: 100 };
      prismaMock.user.findUnique.mockRejectedValue(new Error('DB'));
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUserDonations', () => {
    it('lista doações do usuário', async () => {
      prismaMock.donation.findMany.mockResolvedValue([{ id: 1 }]);
      await donationController.getUserDonations(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });
    it('retorna 500 em erro', async () => {
      prismaMock.donation.findMany.mockRejectedValue(new Error('DB'));
      await donationController.getUserDonations(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getDonationById', () => {
    it('400 se id inválido', async () => {
      req.params.id = 'abc';
      await donationController.getDonationById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('404 se doação não encontrada', async () => {
      req.params.id = '99';
      prismaMock.donation.findUnique.mockResolvedValue(null);
      await donationController.getDonationById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('404 se pertence a outro usuário e não é admin', async () => {
      req.user = { id: 1, tipo: 'doador' };
      req.params.id = '5';
      prismaMock.donation.findUnique.mockResolvedValue({ id: 5, userId: 2 });
      await donationController.getDonationById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('retorna doação do próprio usuário', async () => {
      req.user = { id: 1, tipo: 'doador' };
      req.params.id = '5';
      const mockD = { id: 5, userId: 1 };
      prismaMock.donation.findUnique.mockResolvedValue(mockD);
      await donationController.getDonationById(req, res);
      expect(res.json).toHaveBeenCalledWith(mockD);
    });
    it('retorna 500 em erro', async () => {
      req.params.id = '1';
      prismaMock.donation.findUnique.mockRejectedValue(new Error('DB'));
      await donationController.getDonationById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getInstitutionDonations', () => {
    it('403 se não for INSTITUTION', async () => {
      req.user.role = 'USER';
      await donationController.getInstitutionDonations(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
    it('retorna doações e total da ONG', async () => {
      req.user.role = 'INSTITUTION';
      prismaMock.donation.findMany.mockResolvedValue([{ id: 1 }]);
      prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: 500 } });
      await donationController.getInstitutionDonations(req, res);
      expect(res.json).toHaveBeenCalledWith({ doacoes: [{ id: 1 }], totalDinheiro: 500 });
    });
    it('retorna 500 em erro', async () => {
      req.user.role = 'INSTITUTION';
      prismaMock.donation.findMany.mockRejectedValue(new Error('DB'));
      await donationController.getInstitutionDonations(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('confirmDonationReceipt', () => {
    it('403 se não for INSTITUTION', async () => {
      req.user.role = 'USER';
      req.params.id = '1';
      await donationController.confirmDonationReceipt(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
    it('400 se id inválido', async () => {
      req.user.role = 'INSTITUTION';
      req.params.id = 'abc';
      await donationController.confirmDonationReceipt(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('404 se doação não encontrada', async () => {
      req.user.role = 'INSTITUTION';
      req.params.id = '99';
      prismaMock.donation.findUnique.mockResolvedValue(null);
      await donationController.confirmDonationReceipt(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('403 se doação é de outra ONG', async () => {
      req.user = { id: 1, role: 'INSTITUTION' };
      req.params.id = '5';
      prismaMock.donation.findUnique.mockResolvedValue({ id: 5, institutionId: 99 });
      await donationController.confirmDonationReceipt(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
    it('confirma recebimento de item pendente e credita pontos', async () => {
      req.user = { id: 1, role: 'INSTITUTION' };
      req.params.id = '5';
      const mockD = { id: 5, institutionId: 1, tipo: 'item', status: 'pendente', userId: 2, pontosGerados: 15 };
      prismaMock.donation.findUnique.mockResolvedValue(mockD);
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.donation.update.mockResolvedValue({ ...mockD, status: 'entregue' });
      await donationController.confirmDonationReceipt(req, res);
      expect(prismaMock.user.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: 'Doação marcada como entregue.' }));
    });
    it('confirma recebimento de doação financeira (sem creditar pontos)', async () => {
      req.user = { id: 1, role: 'INSTITUTION' };
      req.params.id = '6';
      const mockD = { id: 6, institutionId: 1, tipo: 'financeira', status: 'aprovada', userId: 2, pontosGerados: 200 };
      prismaMock.donation.findUnique.mockResolvedValue(mockD);
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.donation.update.mockResolvedValue({ ...mockD, status: 'entregue' });
      await donationController.confirmDonationReceipt(req, res);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
    it('retorna 500 em erro', async () => {
      req.user = { id: 1, role: 'INSTITUTION' };
      req.params.id = '5';
      prismaMock.donation.findUnique.mockRejectedValue(new Error('DB'));
      await donationController.confirmDonationReceipt(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateDonationStatus', () => {
    it('403 se não for admin', async () => {
      req.user.role = 'USER';
      await donationController.updateDonationStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
    it('400 se id inválido', async () => {
      req.params.id = 'abc';
      req.body = { status: 'aprovada' };
      await donationController.updateDonationStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('400 se status inválido', async () => {
      req.params.id = '1';
      req.body = { status: 'invalido' };
      await donationController.updateDonationStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    it('404 se doação não existe', async () => {
      req.params.id = '99';
      req.body = { status: 'aprovada' };
      prismaMock.donation.findUnique.mockResolvedValue(null);
      await donationController.updateDonationStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    it('aprova doação e credita pontos', async () => {
      req.params.id = '1';
      req.body = { status: 'aprovada' };
      const mockD = { id: 1, userId: 2, status: 'pendente', pontosGerados: 100 };
      prismaMock.donation.findUnique.mockResolvedValue(mockD);
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.donation.update.mockResolvedValue({ ...mockD, status: 'aprovada' });
      await donationController.updateDonationStatus(req, res);
      expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id: 2 }, data: { pontos: { increment: 100 } } });
    });
    it('atualiza status sem creditar pontos se já estava aprovada', async () => {
      req.params.id = '1';
      req.body = { status: 'entregue' };
      const mockD = { id: 1, userId: 2, status: 'aprovada', pontosGerados: 100 };
      prismaMock.donation.findUnique.mockResolvedValue(mockD);
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.donation.update.mockResolvedValue({ ...mockD, status: 'entregue' });
      await donationController.updateDonationStatus(req, res);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
    it('retorna 500 em erro', async () => {
      req.params.id = '1';
      req.body = { status: 'aprovada' };
      prismaMock.donation.findUnique.mockRejectedValue(new Error('DB'));
      await donationController.updateDonationStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getInstitutionFinance', () => {
    it('403 se não for INSTITUTION', async () => {
      req.user.role = 'USER';
      await donationController.getInstitutionFinance(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
    it('retorna KPIs financeiros da ONG', async () => {
      req.user.role = 'INSTITUTION';
      prismaMock.donation.findMany.mockResolvedValue([
        { id: 1, valor: 200, criadoEm: new Date(), item: null, user: { nome: 'João' } },
        { id: 2, valor: -50, criadoEm: new Date(), item: 'Saque PIX', user: null },
      ]);
      await donationController.getInstitutionFinance(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ kpis: expect.any(Object), movimentacoes: expect.any(Array) }));
    });
    it('retorna 500 em erro', async () => {
      req.user.role = 'INSTITUTION';
      prismaMock.donation.findMany.mockRejectedValue(new Error('DB'));
      await donationController.getInstitutionFinance(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getInstitutionReceipts', () => {
    it('403 se não for INSTITUTION', async () => {
      req.user.role = 'USER';
      await donationController.getInstitutionReceipts(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
    it('retorna comprovantes formatados', async () => {
      req.user.role = 'INSTITUTION';
      prismaMock.donation.findMany.mockResolvedValue([
        { id: 1, valor: 100, criadoEm: new Date(), user: { nome: 'Ana', email: 'ana@email.com' } },
      ]);
      await donationController.getInstitutionReceipts(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ ref: 'Comprovante #00001', doador: 'Ana' }),
      ]));
    });
    it('retorna 500 em erro', async () => {
      req.user.role = 'INSTITUTION';
      prismaMock.donation.findMany.mockRejectedValue(new Error('DB'));
      await donationController.getInstitutionReceipts(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
