// ============================================================================
// ConectaBem — Controller de Administração
// ============================================================================

const prisma = require('../lib/prisma');

// ─── Helper: selects padronizados ───────────────────────────────────────────
const INSTITUTION_SELECT = {
  id: true,
  nome: true,
  email: true,
  cnpj: true,
  status: true,
  descricaoInstituicao: true,
  telefone: true,
  endereco: true,
  criadoEm: true,
};

// ─── Listar todas as ONGs ───────────────────────────────────────────────────
async function getAllInstitutions(req, res) {
  try {
    const institutions = await prisma.user.findMany({
      where: { role: 'INSTITUTION' },
      select: INSTITUTION_SELECT,
      orderBy: { criadoEm: 'desc' },
    });
    return res.json(institutions);
  } catch (error) {
    console.error('❌ Erro ao listar instituições:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar instituições.' });
  }
}

// ─── Aprovar ONG ────────────────────────────────────────────────────────────
async function approveInstitution(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    if (!user || user.role !== 'INSTITUTION') {
      return res.status(404).json({ erro: 'Instituição não encontrada.' });
    }

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: 'APPROVED' },
    });

    // Retorna lista atualizada para o frontend re-renderizar sem novo fetch
    const updated = await prisma.user.findMany({
      where: { role: 'INSTITUTION' },
      select: INSTITUTION_SELECT,
      orderBy: { criadoEm: 'desc' },
    });
    return res.json({ mensagem: 'Instituição aprovada com sucesso!', institutions: updated });
  } catch (error) {
    console.error('❌ Erro ao aprovar instituição:', error);
    return res.status(500).json({ erro: 'Erro interno ao aprovar instituição.' });
  }
}

// ─── Reprovar ONG ───────────────────────────────────────────────────────────
async function rejectInstitution(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user || user.role !== 'INSTITUTION') {
      return res.status(404).json({ erro: 'Instituição não encontrada.' });
    }

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || 'Motivo não especificado pela moderação.',
      },
    });

    // Retorna lista atualizada
    const updated = await prisma.user.findMany({
      where: { role: 'INSTITUTION' },
      select: INSTITUTION_SELECT,
      orderBy: { criadoEm: 'desc' },
    });
    return res.json({ mensagem: 'Instituição rejeitada com sucesso.', institutions: updated });
  } catch (error) {
    console.error('❌ Erro ao rejeitar instituição:', error);
    return res.status(500).json({ erro: 'Erro interno ao modificar status.' });
  }
}

// ─── Estatísticas do Dashboard (GET /admin/stats) ────────────────────────────
// Retorna KPIs globais + arrays no formato { name, value } para o Recharts.
async function getAdminStats(req, res) {
  try {
    const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const agora = new Date();

    // Agrega tudo em paralelo para performance
    const [totalFinanceiro, totalDoacoes, totalOngs, totalUsuarios, doacoesPorMes, doacoesPorTipo] =
      await Promise.all([
        // Total financeiro
        prisma.donation.aggregate({
          where: { tipo: 'financeira' },
          _sum: { valor: true },
        }),
        // Total de doações
        prisma.donation.count(),
        // ONGs cadastradas
        prisma.user.count({ where: { role: 'INSTITUTION' } }),
        // Usuários cadastrados
        prisma.user.count({ where: { role: 'USER' } }),
        // Doações dos últimos 6 meses agrupadas por mês
        prisma.$queryRaw`
          SELECT
            EXTRACT(MONTH FROM "criadoEm")::int AS mes,
            EXTRACT(YEAR  FROM "criadoEm")::int AS ano,
            COUNT(*)::int AS total
          FROM donations
          WHERE "criadoEm" >= NOW() - INTERVAL '6 months'
          GROUP BY ano, mes
          ORDER BY ano, mes
        `,
        // Financeira vs Itens (contagem)
        prisma.donation.groupBy({
          by: ['tipo'],
          _count: { tipo: true },
        }),
      ]);

    // Converte resultado SQL bruto para formato Recharts
    const chartData = doacoesPorMes.map((row) => ({
      name: MESES[Number(row.mes) - 1],
      value: Number(row.total),
    }));

    // Converte groupBy para Pie chart
    const totalPie = doacoesPorTipo.reduce((s, r) => s + r._count.tipo, 0);
    const pieData = doacoesPorTipo.map((r) => ({
      name: r.tipo === 'financeira' ? 'Financeira' : 'Itens',
      value: totalPie > 0 ? Math.round((r._count.tipo / totalPie) * 100) : 0,
    }));

    return res.json({
      kpis: {
        totalDoado: `R$ ${(totalFinanceiro._sum.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        totalDoacoes: totalDoacoes.toLocaleString('pt-BR'),
        ongsCadastradas: totalOngs.toLocaleString('pt-BR'),
        usuariosCadastrados: totalUsuarios.toLocaleString('pt-BR'),
      },
      chartData,   // array { name, value } → LineChart / AreaChart
      pieData,     // array { name, value } → PieChart (porcentagem)
    });
  } catch (error) {
    console.error('❌ Erro ao buscar stats:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar estatísticas.' });
  }
}

// ─── Histórico global de doações COM PAGINAÇÃO (GET /admin/donations?page=1&limit=20) ───
async function getAllDonations(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;
    const search = req.query.search?.trim() || '';

    const where = search ? {
      OR: [
        { user:        { nome: { contains: search, mode: 'insensitive' } } },
        { institution: { nome: { contains: search, mode: 'insensitive' } } },
        { tipo:        { contains: search, mode: 'insensitive' } },
        { item:        { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    const [total, doacoes] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit,
        include: {
          user:        { select: { id: true, nome: true } },
          institution: { select: { id: true, nome: true } },
        },
      }),
    ]);

    const resultado = doacoes.map(d => ({
      id:          d.id,
      data:        new Date(d.criadoEm).toLocaleDateString('pt-BR'),
      doador:      d.user?.nome ?? 'Anônimo',
      tipo:        d.tipo === 'financeira' ? 'Financeira' : 'Itens',
      valorItens:  d.tipo === 'financeira' ? `R$ ${d.valor?.toFixed(2)}` : d.item,
      destinatario: d.institution?.nome ?? 'Sem destinatário',
    }));

    return res.json({
      data: resultado,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('❌ Erro ao listar doações admin:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar doações.' });
  }
}

// ─── Listar Usuários (GET /admin/users?role=&search=) ────────────────────────
async function getAllUsers(req, res) {
  try {
    const { role, search } = req.query;

    const roleMap = { Doadores: 'USER', ONGs: 'INSTITUTION', Administradores: 'ADMIN' };
    const prismaRole = roleMap[role];

    const where = {
      ...(prismaRole ? { role: prismaRole } : {}),
      ...(search ? {
        OR: [
          { nome:  { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    const users = await prisma.user.findMany({
      where,
      select: { id: true, nome: true, email: true, role: true, status: true },
      orderBy: { criadoEm: 'desc' },
    });

    const ROLE_LABEL = { USER: 'Doador', INSTITUTION: 'ONG', ADMIN: 'Administrador' };
    const STATUS_LABEL = { APPROVED: 'Ativo', PENDING: 'Pendente', REJECTED: 'Inativo' };

    return res.json(users.map(u => ({
      id:     u.id,
      nome:   u.nome,
      email:  u.email,
      tipo:   ROLE_LABEL[u.role]   ?? u.role,
      status: STATUS_LABEL[u.status] ?? u.status,
    })));
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar usuários.' });
  }
}

// ─── Promover usuário a Admin (POST /admin/users/:id/promote) ─────────────────
async function promoteToAdmin(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (user.role === 'ADMIN') return res.status(400).json({ erro: 'Usuário já é administrador.' });

    await prisma.user.update({
      where: { id: user.id },
      data:  { role: 'ADMIN', status: 'APPROVED' },
    });
    return res.json({ mensagem: `${user.nome} agora é administrador.` });
  } catch (error) {
    console.error('❌ Erro ao promover usuário:', error);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ─── Revogar role admin (DELETE /admin/users/:id/promote) ─────────────────
async function demoteAdmin(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (user.id === req.user.id) return res.status(400).json({ erro: 'Você não pode remover sua própria role.' });

    await prisma.user.update({
      where: { id: user.id },
      data:  { role: 'USER' },
    });
    return res.json({ mensagem: `${user.nome} voltou a ser doador.` });
  } catch (error) {
    console.error('❌ Erro ao revogar admin:', error);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ─── Relatórios com filtro de data (GET /admin/reports?from=&to=) ─────────────
async function getReports(req, res) {
  try {
    const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    // Parse de datas — padrão: últimos 6 meses
    const to   = req.query.to   ? new Date(req.query.to)   : new Date();
    const from = req.query.from ? new Date(req.query.from) : new Date(new Date().setMonth(to.getMonth() - 6));
    to.setHours(23, 59, 59, 999);
    from.setHours(0, 0, 0, 0);

    const where = { criadoEm: { gte: from, lte: to } };

    const [
      totalFinanceiro, totalDoacoes, totalUsuarios,
      evolucao, porTipo,
    ] = await Promise.all([
      // KPIs
      prisma.donation.aggregate({ where, _sum: { valor: true } }),
      prisma.donation.count({ where }),
      prisma.user.count({ where: { role: 'USER', criadoEm: { gte: from, lte: to } } }),
      // Evolução mensal (valor financeiro)
      prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM "criadoEm")::int AS mes,
          EXTRACT(YEAR  FROM "criadoEm")::int AS ano,
          COUNT(*)::int                        AS total,
          COALESCE(SUM(valor), 0)::float       AS valor
        FROM donations
        WHERE "criadoEm" >= ${from} AND "criadoEm" <= ${to}
        GROUP BY ano, mes
        ORDER BY ano, mes
      `,
      // Financeira vs Itens
      prisma.donation.groupBy({ by: ['tipo'], where, _count: { tipo: true }, _sum: { valor: true } }),
    ]);

    const chartData = evolucao.map(r => ({
      name:  MESES[r.mes - 1],
      value: r.total,
      valor: Number(r.valor),
    }));

    const totalPie = porTipo.reduce((s, r) => s + r._count.tipo, 0);
    const pieData  = porTipo.map(r => ({
      name:  r.tipo === 'financeira' ? 'Financeira' : 'Itens',
      value: totalPie > 0 ? Math.round((r._count.tipo / totalPie) * 100) : 0,
    }));

    const ticketMedio = totalDoacoes > 0
      ? (totalFinanceiro._sum.valor ?? 0) / totalDoacoes
      : 0;

    return res.json({
      kpis: {
        totalFinanceiro: `R$ ${(totalFinanceiro._sum.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        totalDoacoes,
        totalUsuarios,
        ticketMedio: `R$ ${ticketMedio.toFixed(2)}`,
      },
      chartData,
      pieData,
    });
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    return res.status(500).json({ erro: 'Erro interno ao gerar relatório.' });
  }
}

module.exports = {
  getAllInstitutions,
  approveInstitution,
  rejectInstitution,
  getAdminStats,
  getAllDonations,
  getAllUsers,
  promoteToAdmin,
  demoteAdmin,
  getReports,
};
