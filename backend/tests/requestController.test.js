const { mockDeep } = require('jest-mock-extended');

const prismaMock = mockDeep();
jest.mock('../src/lib/prisma', () => prismaMock);

const requestController = require('../src/controllers/requestController');

describe('Request Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1, role: 'INSTITUTION' }, body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('createRequest', () => {
    it('deve retornar 403 se usuário não for instituição', async () => {
      req.user.role = 'USER';
      await requestController.createRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('deve criar uma nova solicitação de item', async () => {
      req.body = { name: 'Cobertores', qty: '10', urgency: 'Alta' };
      const mockRequest = { id: 1, name: 'Cobertores', qty: '10', urgency: 'Alta', status: 'Pendente' };
      
      prismaMock.request.create.mockResolvedValue(mockRequest);

      await requestController.createRequest(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: 'Cobertores', qty: '10' }));
    });
  });

  describe('updateRequestStatus', () => {
    it('deve atualizar o status de uma solicitação', async () => {
      req.params.id = '1';
      req.body = { status: 'Atendido' };
      
      prismaMock.request.findUnique.mockResolvedValue({ id: 1, institutionId: 1 });
      prismaMock.request.update.mockResolvedValue({ id: 1, status: 'Atendido' });

      await requestController.updateRequestStatus(req, res);
      
      expect(prismaMock.request.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'Atendido' }
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensagem: 'Status atualizado.', status: 'Atendido' }));
    });
  });
});
