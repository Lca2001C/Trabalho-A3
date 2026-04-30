// ============================================================================
// ConectaBem — Controller de Doações
// ============================================================================
// Responsável por:
//   • Registro de novas doações (item físico ou financeira)
//   • Crédito automático de pontos ao doador
//   • Listagem de doações do usuário logado
//   • Consulta de detalhe de uma doação específica
//   • Atualização de status (para admins)
// ============================================================================

const prisma = require('../lib/prisma');

// ─── Regras de Pontuação (Atualizadas) ──────────────────────────────────────
//   • Base: 2 pontos por R$ 1,00 doado (arredondar para baixo)
//   • Primeira doação: multiplicar por 3
//   • Doação recorrente ativa: multiplicar por 2.5 (Simulado por flag no user)
//   • Campanha especial: multiplicar por 4 (Simulado por flag no user ou params)
//   • Item físico: 15 pontos fixos por item
const PONTOS_ITEM_FIXO = 15;

/**
 * Calcula os pontos gerados com base no tipo, valor e histórico do doador.
 */
async function calcularPontos(userId, tipo, valor, isCampaign = false) {
  if (tipo === 'item') {
    return PONTOS_ITEM_FIXO;
  }

  // Base: 2 pontos por real
  let pontos = Math.floor((valor || 0) * 2);

  // Busca dados do usuário para verificar multiplicadores
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { donations: true } } }
  });

  let multiplicador = 1;

  // 1. Primeira doação (multiplica por 3)
  if (user._count.donations === 0) {
    multiplicador = 3;
  } 
  // 2. Campanha Especial (multiplica por 4)
  else if (isCampaign || user.campanhaAtiva) {
    multiplicador = 4;
  }
  // 3. Doação Recorrente (multiplica por 2.5)
  else if (user.recorrenteAtiva) {
    multiplicador = 2.5;
  }

  return Math.floor(pontos * multiplicador);
}

// ─── Criar Doação ───────────────────────────────────────────────────────────

/**
 * POST /api/donations
 *
 * Registra uma nova doação e credita pontos automaticamente ao doador.
 * Utiliza uma transação Prisma para garantir atomicidade: se o crédito de
 * pontos falhar, a doação não é registrada (e vice-versa).
 *
 * Body esperado:
 *   {
 *     "tipo": "item" | "financeira",
 *     "item": "Notebook Dell em bom estado",   // obrigatório se tipo = "item"
 *     "valor": 150.00,                          // obrigatório se tipo = "financeira"
 *     "institutionId": 1                        // opcional
 *   }
 *
 * Respostas:
 *   201 — Doação criada + pontos creditados
 *   400 — Dados inválidos
 *   500 — Erro interno
 */
async function createDonation(req, res) {
  try {
    const userId = req.user.id;
    const { tipo, item, valor, institutionId } = req.body;

    // ── Validação do tipo de doação ──
    if (!tipo || !['item', 'financeira'].includes(tipo)) {
      return res.status(400).json({
        erro: 'O campo "tipo" é obrigatório e deve ser "item" ou "financeira".',
      });
    }

    // ── Validações específicas por tipo ──
    if (tipo === 'item' && !item) {
      return res.status(400).json({
        erro: 'Para doações de item, o campo "item" (nome do objeto) é obrigatório.',
      });
    }

    if (tipo === 'financeira' && (!valor || valor <= 0)) {
      return res.status(400).json({
        erro: 'Para doações financeiras, o campo "valor" deve ser maior que zero.',
      });
    }

    // ── Valida se a instituição existe (quando informada) ──
    if (institutionId) {
      const instituicao = await prisma.user.findUnique({
        where: { id: parseInt(institutionId) },
      });

      if (!instituicao || instituicao.role !== 'INSTITUTION') {
        return res.status(404).json({
          erro: `Instituição não encontrada.`,
        });
      }

      if (instituicao.status !== 'APPROVED') {
        return res.status(400).json({
          erro: 'Esta instituição ainda não foi aprovada para receber doações.',
        });
      }
    }

    // ── Calcula os pontos a serem creditados ──
    const pontosGerados = await calcularPontos(userId, tipo, valor, req.body.isCampaign);

    // ── Transação atômica ──
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Cria o registro da doação
      const doacao = await tx.donation.create({
        data: {
          userId,
          institutionId: institutionId ? parseInt(institutionId) : null,
          tipo,
          item: item || null,
          valor: valor || null,
          // Doações financeiras são aprovadas na hora (simulando gateway), 
          // itens ficam pendentes até conferência.
          status: tipo === 'financeira' ? 'aprovada' : 'pendente',
          pontosGerados,
        },
      });

      // 2. Só credita os pontos agora se for financeira (aprovada)
      if (tipo === 'financeira') {
        await tx.user.update({
          where: { id: userId },
          data: {
            pontos: { increment: pontosGerados },
          },
        });
      }

      return doacao;
    });

    return res.status(201).json({
      doacao: {
        id: resultado.id,
        tipo: resultado.tipo,
        item: resultado.item,
        valor: resultado.valor,
        status: resultado.status,
        criadoEm: resultado.criadoEm,
      },
      pontosGanhos: resultado.status === 'aprovada' ? pontosGerados : 0,
      mensagem: resultado.status === 'pendente' 
        ? 'Sua doação foi registrada! Os pontos serão creditados assim que a ONG confirmar o recebimento.'
        : 'Doação realizada com sucesso!'
    });
  } catch (error) {
    console.error('❌ Erro ao criar doação:', error);
    return res.status(500).json({ erro: 'Erro interno ao registrar doação.' });
  }
}

// ─── Listar Doações do Usuário ──────────────────────────────────────────────

/**
 * GET /api/donations
 *
 * Retorna todas as doações do usuário logado, ordenadas da mais recente
 * para a mais antiga. Inclui o nome da instituição (quando vinculada).
 *
 * Respostas:
 *   200 — Lista de doações (pode ser vazia)
 *   500 — Erro interno
 */
async function getUserDonations(req, res) {
  try {
    const userId = req.user.id;

    const doacoes = await prisma.donation.findMany({
      where: { userId },
      orderBy: { criadoEm: 'desc' },
      include: {
        institution: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    return res.json(doacoes);
  } catch (error) {
    console.error('❌ Erro ao listar doações:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar doações.' });
  }
}

// ─── Detalhe de uma Doação ──────────────────────────────────────────────────

/**
 * GET /api/donations/:id
 *
 * Retorna os detalhes de uma doação específica.
 * O usuário só pode ver suas próprias doações (exceto admins).
 *
 * Respostas:
 *   200 — Dados da doação
 *   404 — Doação não encontrada ou não pertence ao usuário
 *   500 — Erro interno
 */
async function getDonationById(req, res) {
  try {
    const donationId = parseInt(req.params.id);
    const userId = req.user.id;
    const userTipo = req.user.tipo;

    if (isNaN(donationId)) {
      return res.status(400).json({ erro: 'ID da doação inválido.' });
    }

    const doacao = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        institution: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
          },
        },
        user: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!doacao) {
      return res.status(404).json({ erro: 'Doação não encontrada.' });
    }

    // Apenas o dono da doação ou um admin pode visualizá-la
    if (doacao.userId !== userId && userTipo !== 'admin') {
      return res.status(404).json({ erro: 'Doação não encontrada.' });
    }

    return res.json(doacao);
  } catch (error) {
    console.error('❌ Erro ao buscar doação:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar doação.' });
  }
}

// ─── Listar Doações Mapeadas para uma Instituição ────────────────────────────
async function getInstitutionDonations(req, res) {
  try {
    const institutionId = req.user.id;
    
    if (req.user.role !== 'INSTITUTION') {
      return res.status(403).json({ erro: 'Acesso negado. Apenas ONG pode ver doações recebidas.' });
    }

    // Busca as doações e agrega o total financeiro confirmado em paralelo
    const [doacoes, totalAgregado] = await Promise.all([
      prisma.donation.findMany({
        where: { institutionId },
        orderBy: { criadoEm: 'desc' },
        include: {
          user: { select: { id: true, nome: true, email: true } },
        },
      }),
      prisma.donation.aggregate({
        where: {
          institutionId,
          tipo: 'financeira',
        },
        _sum: {
          valor: true,
        },
      }),
    ]);

    const totalDinheiro = totalAgregado._sum.valor ?? 0;

    return res.json({ doacoes, totalDinheiro });
  } catch (error) {
    console.error('❌ Erro ao listar doações recebidas:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar doações.' });
  }
}

// ─── Instituição confirma recebimento de uma doação ──────────────────────────
async function confirmDonationReceipt(req, res) {
  try {
    const institutionId = req.user.id;
    const donationId = parseInt(req.params.id);

    if (req.user.role !== 'INSTITUTION') {
      return res.status(403).json({ erro: 'Acesso negado. Apenas ONG pode confirmar.' });
    }
    
    if (isNaN(donationId)) {
      return res.status(400).json({ erro: 'ID da doação inválido.' });
    }

    // Verifica se a doação pertence a esta ong e se não está entregue ainda
    const doacao = await prisma.donation.findUnique({
      where: { id: donationId }
    });

    if (!doacao) return res.status(404).json({ erro: 'Doação não encontrada.' });
    if (doacao.institutionId !== institutionId) return res.status(403).json({ erro: 'Doação não destinada a sua ong.' });

    const doacaoAtualizada = await prisma.$transaction(async (tx) => {
      const updated = await tx.donation.update({
        where: { id: donationId },
        data: { status: 'entregue' }
      });

      // Se era um item pendente, credita os pontos agora
      if (doacao.tipo === 'item' && doacao.status === 'pendente') {
        await tx.user.update({
          where: { id: doacao.userId },
          data: {
            pontos: { increment: doacao.pontosGerados }
          }
        });
      }

      return updated;
    });

    return res.json({ mensagem: 'Doação marcada como entregue.', doacao: doacaoAtualizada });
  } catch (error) {
    console.error('❌ Erro ao confirmar recebimento:', error);
    return res.status(500).json({ erro: 'Erro interno ao confirmar recebimento.' });
  }
}

// ─── Atualizar Status da Doação (Admin) ─────────────────────────────────────

/**
 * PATCH /api/donations/:id/status
 *
 * Atualiza o status de uma doação. Restrito a usuários com tipo "admin".
 *
 * Body esperado:
 *   { "status": "aprovada" | "entregue" | "pendente" }
 *
 * Respostas:
 *   200 — Status atualizado
 *   400 — Status inválido
 *   403 — Sem permissão (não é admin)
 *   404 — Doação não encontrada
 *   500 — Erro interno
 */
async function updateDonationStatus(req, res) {
  try {
    const donationId = parseInt(req.params.id);
    const { status } = req.body;
    const userTipo = req.user.tipo;

    // ── Somente admins podem alterar status ──
    if (userTipo !== 'admin') {
      return res.status(403).json({
        erro: 'Apenas administradores podem alterar o status de doações.',
      });
    }

    if (isNaN(donationId)) {
      return res.status(400).json({ erro: 'ID da doação inválido.' });
    }

    // ── Validação do status ──
    const statusPermitidos = ['pendente', 'aprovada', 'entregue'];
    if (!status || !statusPermitidos.includes(status)) {
      return res.status(400).json({
        erro: `Status inválido. Use: ${statusPermitidos.join(', ')}`,
      });
    }

    // ── Verifica se a doação existe ──
    const doacaoExistente = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!doacaoExistente) {
      return res.status(404).json({ erro: 'Doação não encontrada.' });
    }

    // ── Atualiza o status e credita pontos se necessário ──
    const doacaoAtualizada = await prisma.$transaction(async (tx) => {
      const updated = await tx.donation.update({
        where: { id: donationId },
        data: { status },
      });

      // Se mudou para aprovada e não era antes, credita pontos
      if (status === 'aprovada' && doacaoExistente.status !== 'aprovada') {
        await tx.user.update({
          where: { id: doacaoExistente.userId },
          data: {
            pontos: { increment: doacaoExistente.pontosGerados }
          }
        });
      }

      return updated;
    });

    return res.json({
      mensagem: `Status atualizado para "${status}".`,
      doacao: doacaoAtualizada,
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    return res.status(500).json({ erro: 'Erro interno ao atualizar status.' });
  }
}

// ─── Financeiro da ONG (GET /api/donations/institution/finance) ───────────────
// Retorna KPIs + histórico de movimentações financeiras da ONG logada.
async function getInstitutionFinance(req, res) {
  try {
    if (req.user.role !== 'INSTITUTION') {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }
    const institutionId = req.user.id;

    const doacoes = await prisma.donation.findMany({
      where: { institutionId, tipo: 'financeira' },
      orderBy: { criadoEm: 'desc' },
      include: { user: { select: { nome: true } } },
    });

    const recebimentos = doacoes.filter(d => (d.valor || 0) > 0);
    const totalSaldo = doacoes.reduce((s, d) => s + (d.valor ?? 0), 0);
    const ticketMedio = recebimentos.length > 0 
      ? recebimentos.reduce((s, d) => s + d.valor, 0) / recebimentos.length 
      : 0;

    const movimentacoes = doacoes.map(d => {
      const isSaque = (d.valor ?? 0) < 0;
      return {
        id:       d.id,
        type:     isSaque ? (d.item || 'Saque PIX') : `Doação via ${d.user?.nome ?? 'Doador anônimo'}`,
        amount:   isSaque 
                    ? `- R$ ${Math.abs(d.valor).toLocaleString('pt-BR', {minimumFractionDigits:2})}` 
                    : `+ R$ ${(d.valor ?? 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`,
        date:     new Date(d.criadoEm).toLocaleDateString('pt-BR'),
        isIncome: !isSaque,
        valor:    d.valor ?? 0,
      };
    });

    return res.json({
      kpis: {
        totalRecebido: `R$ ${totalSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        totalDoacoes:  recebimentos.length,
        ticketMedio:   `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      },
      movimentacoes,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar financeiro ONG:', error);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ─── Comprovantes da ONG (GET /api/donations/institution/receipts) ───────────
// Retorna as doações financeiras confirmadas formatadas como comprovantes.
async function getInstitutionReceipts(req, res) {
  try {
    if (req.user.role !== 'INSTITUTION') {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }
    const institutionId = req.user.id;

    const doacoes = await prisma.donation.findMany({
      where: { institutionId, tipo: 'financeira', status: 'aprovada' },
      orderBy: { criadoEm: 'desc' },
      include: { user: { select: { nome: true, email: true } } },
    });

    const comprovantes = doacoes.map(d => ({
      id:      d.id,
      ref:     `Comprovante #${String(d.id).padStart(5, '0')}`,
      doador:  d.user?.nome ?? 'Anônimo',
      email:   d.user?.email ?? '',
      valor:   `R$ ${(d.valor ?? 0).toFixed(2)}`,
      date:    new Date(d.criadoEm).toLocaleDateString('pt-BR'),
      desc:    `${new Date(d.criadoEm).toLocaleDateString('pt-BR')} — R$ ${(d.valor ?? 0).toFixed(2)}`,
    }));

    return res.json(comprovantes);
  } catch (error) {
    console.error('❌ Erro ao buscar comprovantes ONG:', error);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

module.exports = {
  createDonation,
  getUserDonations,
  getInstitutionDonations,
  getInstitutionFinance,
  getInstitutionReceipts,
  confirmDonationReceipt,
  getDonationById,
  updateDonationStatus,
};
