const { mockDeep } = require('jest-mock-extended');
const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);
const financeController = require('../src/controllers/financeController');

describe('Finance Controller — withdraw', () => {
  let req, res;
  beforeEach(() => {
    req = { user: { id: 1, role: 'INSTITUTION' }, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (fn) => fn(prismaMock));
  });

  it('403 se não for INSTITUTION', async () => {
    req.user.role = 'USER';
    await financeController.withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Apenas instituições podem sacar.' });
  });

  it('400 se pixKey ausente', async () => {
    req.body = { pixType: 'CPF', amount: 100 };
    await financeController.withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Chave, Tipo de PIX e Valor válido são obrigatórios.' });
  });

  it('400 se pixType ausente', async () => {
    req.body = { pixKey: '123', amount: 100 };
    await financeController.withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('400 se amount ausente', async () => {
    req.body = { pixKey: '123', pixType: 'CPF' };
    await financeController.withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('400 se amount <= 0', async () => {
    req.body = { pixKey: '123', pixType: 'CPF', amount: 0 };
    await financeController.withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('400 se saldo zerado (valor null)', async () => {
    req.body = { pixKey: '123', pixType: 'CPF', amount: 100 };
    prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: null } });
    await financeController.withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Saldo insuficiente para realizar este saque.' });
  });

  it('400 se amount maior que saldo', async () => {
    req.body = { pixKey: '123', pixType: 'CPF', amount: 1000 };
    prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: 500 } });
    await financeController.withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Saldo insuficiente para realizar este saque.' });
  });

  it('processa saque com sucesso', async () => {
    req.body = { pixKey: 'chave@pix', pixType: 'EMAIL', amount: 300 };
    prismaMock.donation.aggregate.mockResolvedValue({ _sum: { valor: 1000 } });
    prismaMock.donation.create.mockResolvedValue({ id: 10, valor: -300 });
    await financeController.withdraw(req, res);
    expect(prismaMock.donation.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ valor: -300, status: 'entregue', tipo: 'financeira' }),
    }));
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Saque realizado com sucesso', saldoAtual: 700 });
  });

  it('retorna 500 em erro interno', async () => {
    req.body = { pixKey: '123', pixType: 'CPF', amount: 100 };
    prismaMock.donation.aggregate.mockRejectedValue(new Error('DB'));
    await financeController.withdraw(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Erro interno ao processar saque.' });
  });
});
