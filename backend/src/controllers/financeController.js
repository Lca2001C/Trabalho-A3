const prisma = require('../lib/prisma');

async function withdraw(req, res) {
  try {
    const institutionId = req.user.id;
    const { pixKey, pixType, amount } = req.body;

    if (req.user.role !== 'INSTITUTION') {
      return res.status(403).json({ erro: 'Apenas instituições podem sacar.' });
    }

    if (!pixKey || !pixType || !amount || amount <= 0) {
      return res.status(400).json({ erro: 'Chave, Tipo de PIX e Valor válido são obrigatórios.' });
    }

    // Transação Atômica para Saque
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Re-calcula o saldo dentro da transação para evitar race condition
      const agregador = await tx.donation.aggregate({
        where: {
          institutionId,
          tipo: 'financeira',
        },
        _sum: {
          valor: true,
        },
      });

      const saldoReal = Number(agregador._sum?.valor ?? 0);

      if (saldoReal <= 0 || amount > saldoReal) {
        throw new Error('SALDO_INSUFICIENTE');
      }

      await tx.donation.create({
        data: {
          userId: req.user.id,
          institutionId: institutionId,
          tipo: 'financeira',
          item: `Saque PIX (${pixType}): ${pixKey} - R$ ${amount.toFixed(2)}`,
          valor: -amount,
          status: 'entregue',
        }
      });

      return { saldoAtual: saldoReal - amount };
    });

    return res.json({
      mensagem: 'Saque realizado com sucesso',
      saldoAtual: resultado.saldoAtual,
    });
  } catch (error) {
    if (error.message === 'SALDO_INSUFICIENTE') {
      return res.status(400).json({ erro: 'Saldo insuficiente para realizar este saque.' });
    }
    console.error('❌ Erro no saque:', error);
    return res.status(500).json({ erro: 'Erro interno ao processar saque.' });
  }
}

module.exports = { withdraw };
