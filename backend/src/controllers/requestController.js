// ============================================================================
// ConectaBem — Controller de Solicitações de Itens (ONG)
// ============================================================================

const prisma = require('../lib/prisma');

// GET /api/requests — Lista solicitações da ONG logada
async function getRequests(req, res) {
  try {
    if (req.user.role !== 'INSTITUTION') {
      return res.status(403).json({ erro: 'Apenas ONGs podem acessar solicitações.' });
    }

    const requests = await prisma.request.findMany({
      where: { institutionId: req.user.id },
      orderBy: { criadoEm: 'desc' },
    });

    const resultado = requests.map(r => ({
      id: r.id,
      name: r.name,
      qty: r.qty,
      urgency: r.urgency,
      status: r.status,
      date: new Date(r.criadoEm).toLocaleDateString('pt-BR'),
    }));

    return res.json(resultado);
  } catch (error) {
    console.error('❌ Erro ao listar solicitações:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar solicitações.' });
  }
}

// POST /api/requests — Cria nova solicitação
async function createRequest(req, res) {
  try {
    if (req.user.role !== 'INSTITUTION') {
      return res.status(403).json({ erro: 'Apenas ONGs podem criar solicitações.' });
    }

    const { name, qty, urgency } = req.body;

    if (!name || !qty) {
      return res.status(400).json({ erro: 'Os campos name e qty são obrigatórios.' });
    }

    const urgenciasPermitidas = ['Baixa', 'Média', 'Alta'];
    if (urgency && !urgenciasPermitidas.includes(urgency)) {
      return res.status(400).json({ erro: 'Urgência inválida. Use: Baixa, Média ou Alta.' });
    }

    const request = await prisma.request.create({
      data: {
        institutionId: req.user.id,
        name,
        qty,
        urgency: urgency ?? 'Média',
      },
    });

    return res.status(201).json({
      id: request.id,
      name: request.name,
      qty: request.qty,
      urgency: request.urgency,
      status: request.status,
      date: new Date(request.criadoEm).toLocaleDateString('pt-BR'),
    });
  } catch (error) {
    console.error('❌ Erro ao criar solicitação:', error);
    return res.status(500).json({ erro: 'Erro interno ao criar solicitação.' });
  }
}

// PATCH /api/requests/:id — Atualiza status (ex: marcar como Atendido)
async function updateRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await prisma.request.findUnique({ where: { id: parseInt(id) } });
    if (!request) return res.status(404).json({ erro: 'Solicitação não encontrada.' });
    if (request.institutionId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ erro: 'Sem permissão.' });
    }

    const updated = await prisma.request.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return res.json({ mensagem: 'Status atualizado.', status: updated.status });
  } catch (error) {
    console.error('❌ Erro ao atualizar solicitação:', error);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

module.exports = { getRequests, createRequest, updateRequestStatus };
