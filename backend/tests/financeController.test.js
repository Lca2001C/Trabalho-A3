const { mockDeep } = require('jest-mock-extended');

const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);

const financeController = require('../src/controllers/financeController');

describe('Finance Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1, role: 'INSTITUTION' }, body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('withdraw', () => {
    it('deve retornar 403 se usuário não for instituição', async () => {
      req.user.role = 'USER';
      await financeController.withdraw(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Apenas instituições podem sacar.' });
    });

    it('deve retornar 400 se saldo for insuficiente', async () => {
      req.body = { amount: 1000, pixKey: '123', pixType: 'CPF' };
      
      prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: 500 } }); // Saldo de 500
      
      await financeController.withdraw(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Saldo insuficiente para realizar este saque.' });
    });

    it('deve processar o saque com sucesso', async () => {
      req.body = { amount: 500, pixKey: '123', pixType: 'CPF' };
      
      prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: 1000 } }); // Saldo de 1000
      prismaMock.donation.create.mockResolvedValue({ id: 99, valor: -500 }); // Registro de saque

      await financeController.withdraw(req, res);
      
      expect(prismaMock.donation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 1,
          institutionId: 1,
          tipo: 'financeira',
          valor: -500,
          status: 'entregue'
        })
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: 'Saque realizado com sucesso', saldoAtual: 500 }));
    });
  });
});
