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
