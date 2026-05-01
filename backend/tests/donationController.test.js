const { PrismaClient } = require('@prisma/client');
const { mockDeep } = require('jest-mock-extended');

const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);

const donationController = require('../src/controllers/donationController');

describe('Donation Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1, tipo: 'admin', role: 'ADMIN' }, body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createDonation', () => {
    it('deve retornar 400 se faltar tipo', async () => {
      await donationController.createDonation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'O campo "tipo" é obrigatório e deve ser "item" ou "financeira".' });
    });

    it('deve criar doação financeira e creditar pontos se aprovada', async () => {
      req.body = { tipo: 'financeira', valor: 100 };
      prismaMock.user.findUnique.mockResolvedValue({ _count: { donations: 1 }, campanhaAtiva: false, recorrenteAtiva: false });
      
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });

      prismaMock.donation.create.mockResolvedValue({ id: 1, tipo: 'financeira', valor: 100, status: 'aprovada' });
      
      await donationController.createDonation(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        mensagem: 'Doação realizada com sucesso!'
      }));
    });
  });

  describe('getUserDonations', () => {
    it('deve listar doações do usuário', async () => {
      prismaMock.donation.findMany.mockResolvedValue([{ id: 1 }]);
      await donationController.getUserDonations(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });
  });

  describe('confirmDonationReceipt', () => {
    it('deve confirmar recebimento se for instituição', async () => {
      req.user.role = 'INSTITUTION';
      req.params.id = '1';
      prismaMock.donation.findUnique.mockResolvedValue({ id: 1, institutionId: 1, tipo: 'item', status: 'pendente', userId: 2, pontosGerados: 10 });
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.donation.update.mockResolvedValue({ id: 1, status: 'entregue' });

      await donationController.confirmDonationReceipt(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: 'Doação marcada como entregue.' }));
    });
  });

  describe('getMultiplier', () => {
    it('deve retornar multiplicador base se usuário já tiver doações', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ _count: { donations: 1 } });
      await donationController.getMultiplier(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ multiplicador: 1 }));
    });

    it('deve retornar multiplicador 3x se for primeira doação', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ _count: { donations: 0 } });
      await donationController.getMultiplier(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ multiplicador: 3 }));
    });
  });

  describe('updateDonationStatus', () => {
    it('deve retornar 403 se usuário não for admin', async () => {
      req.user.tipo = 'doador';
      await donationController.updateDonationStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('deve aprovar a doação e creditar pontos', async () => {
      req.params.id = '1';
      req.body = { status: 'aprovada' };

      const mockDoacao = { id: 1, userId: 2, status: 'pendente', pontosGerados: 100 };
      prismaMock.donation.findUnique.mockResolvedValue(mockDoacao);
      
      // Simula a transação
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock);
      });
      
      prismaMock.donation.update.mockResolvedValue({ ...mockDoacao, status: 'aprovada' });

      await donationController.updateDonationStatus(req, res);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { pontos: { increment: 100 } }
      });
      expect(res.json).toHaveBeenCalled();
    });
  });
});
