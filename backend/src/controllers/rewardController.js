// ============================================================================
// ConectaBem — Controller de Recompensas
// ============================================================================

const prisma = require('../lib/prisma');

// ─── Listar Recompensas ─────────────────────────────────────────────────────
async function listRewards(req, res) {
  try {
    const rewards = await prisma.reward.findMany({
      where: { ativo: true }
    });
    return res.json(rewards);
  } catch (error) {
    console.error('❌ Erro ao listar recompensas:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar recompensas.' });
  }
}

// ─── Resgatar Recompensa ────────────────────────────────────────────────────
async function redeemReward(req, res) {
  try {
    const userId = req.user.id;
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({ erro: 'O ID da recompensa é obrigatório.' });
    }

    // 1. Busca custo em pontos da recompensa
    const recompensa = await prisma.reward.findUnique({
      where: { id: parseInt(rewardId) }
    });

    if (!recompensa || !recompensa.ativo) {
      return res.status(404).json({ erro: 'Recompensa não encontrada ou inativa.' });
    }

    if (recompensa.estoque <= 0) {
      return res.status(400).json({ erro: 'Recompensa esgotada (sem estoque).' });
    }

    // 2. Busca saldo atual do usuário
    const usuario = await prisma.user.findUnique({
      where: { id: userId }
    });

    // 3. Validação de Saldo
    if (usuario.pontos < recompensa.custoPontos) {
      return res.status(400).json({ 
        erro: `Saldo insuficiente. Esta recompensa custa ${recompensa.custoPontos} pontos e você possui ${usuario.pontos} pontos.` 
      });
    }

    // Código dummy procupom
    const codigoGerado = `CONECTABEM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 4. Transação (Resgate + Desconto de Pontos + Atualização de Estoque)
    await prisma.$transaction(async (tx) => {
      // Decrementa pontos do usuário
      await tx.user.update({
        where: { id: userId },
        data: { pontos: { decrement: recompensa.custoPontos } }
      });

      // Decrementa estoque da recompensa
      await tx.reward.update({
        where: { id: recompensa.id },
        data: { estoque: { decrement: 1 } }
      });

      // Cria registro do resgate com pontosDeduzidos
      await tx.redemption.create({
        data: {
          userId,
          rewardId: recompensa.id,
          pontosDeduzidos: recompensa.custoPontos,
          codigo: codigoGerado
        }
      });
    });

    return res.status(200).json({
      mensagem: 'Resgate realizado com sucesso!',
      codigo: codigoGerado,
      pontosRestantes: usuario.pontos - recompensa.custoPontos
    });

  } catch (error) {
    console.error('❌ Erro ao resgatar recompensa:', error);
    return res.status(500).json({ erro: 'Erro interno ao processar resgate.' });
  }
}

// ─── Histórico de Resgates do Usuário ─────────────────────────────────────────
async function getUserRedemptions(req, res) {
  try {
    const userId = req.user.id;
    const redemptions = await prisma.redemption.findMany({
      where: { userId },
      orderBy: { criadoEm: 'desc' },
      include: {
        reward: {
          select: {
            nome: true,
            custoPontos: true
          }
        }
      }
    });
    return res.json(redemptions);
  } catch (error) {
    console.error('❌ Erro ao listar resgates do usuário:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar histórico de resgates.' });
  }
}
// ─── Ranking de Doadores (GET /api/rewards/ranking) ─────────────────────────────
// Retorna os top 10 usuários (USER) ordenados por pontos no período.
// ?period=all (padrão) | monthly | weekly
async function getRanking(req, res) {
  try {
    const period = req.query.period ?? 'all'; // 'all' | 'monthly' | 'weekly'

    // ── Calcula a data de corte baseada no período ──
    let from = null;
    if (period === 'weekly') {
      from = new Date();
      from.setDate(from.getDate() - 7);
    } else if (period === 'monthly') {
      from = new Date();
      from.setDate(1); // primeiro dia do mês corrente
      from.setHours(0, 0, 0, 0);
    }

    let top10, myUser;

    if (period === 'all') {
      // ── Ranking geral: usa pontos totais acumulados no campo User.pontos ──
      top10 = await prisma.user.findMany({
        where: { role: 'USER' },
        select: { id: true, nome: true, pontos: true, avatar: true },
        orderBy: { pontos: 'desc' },
        take: 10,
      });
      myUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, nome: true, pontos: true, avatar: true },
      });
    } else {
      // ── Ranking de período: agrega pontos gerados pelas doações no intervalo ──
      const aggregated = await prisma.donation.groupBy({
        by: ['userId'],
        where: {
          criadoEm: { gte: from },
          user: { role: 'USER' },
        },
        _sum: { pontosGerados: true },
        orderBy: { _sum: { pontosGerados: 'desc' } },
        take: 10,
      });

      // Busca nomes para os IDs retornados
      const ids = aggregated.map(r => r.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, nome: true, pontos: true, avatar: true },
      });
      const userMap = Object.fromEntries(users.map(u => [u.id, u]));

      top10 = aggregated.map(r => ({
        ...userMap[r.userId],
        pontos: r._sum.pontosGerados ?? 0, // pontos no período
      }));

      // Pontos do usuário logado no período
      const myAgg = await prisma.donation.aggregate({
        where: { userId: req.user.id, criadoEm: { gte: from } },
        _sum: { pontosGerados: true },
      });
      const me = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, nome: true, avatar: true },
      });
      myUser = me ? { ...me, pontos: myAgg._sum.pontosGerados ?? 0 } : null;
    }

    const resultado = top10.map((u, i) => ({
      pos:    i + 1,
      id:     u.id,
      name:   u.nome,
      points: u.pontos,
      avatar: u.avatar,
      isMe:   u.id === req.user.id,
    }));

    // Se o usuário logado não está no top 10, retorna sua posição extra
    const estaNoTop = resultado.some(r => r.isMe);
    let myPosition = null;
    if (!estaNoTop && myUser) {
      const acima = resultado.filter(r => r.points > myUser.pontos).length;
      myPosition = {
        pos:    acima + 1,
        id:     myUser.id,
        name:   myUser.nome,
        points: myUser.pontos,
        avatar: myUser.avatar,
        isMe:   true,
      };
    }

    return res.json({ ranking: resultado, myPosition, period });
  } catch (error) {
    console.error('❌ Erro ao buscar ranking:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar ranking.' });
  }
}


module.exports = {
  listRewards,
  redeemReward,
  getUserRedemptions,
  getRanking,
};
