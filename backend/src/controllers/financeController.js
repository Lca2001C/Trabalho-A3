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

    // Calcula o saldo disponível
    const totalAgregado = await prisma.donation.aggregate({
      where: {
        institutionId,
        tipo: 'financeira',
      },
      _sum: {
        valor: true,
      },
    });

    const saldo = totalAgregado._sum.valor || 0;

    if (saldo <= 0 || amount > saldo) {
      return res.status(400).json({ erro: 'Saldo insuficiente para realizar este saque.' });
    }

    // Cria a transação de débito (uma doação negativa com os dados do saque)
    await prisma.donation.create({
      data: {
        userId: req.user.id,
        institutionId: institutionId,
        tipo: 'financeira',
        item: `Saque PIX (${pixType}): ${pixKey} - R$ ${amount.toFixed(2)}`,
        valor: -amount,
        status: 'entregue',
      }
    });

    return res.json({ mensagem: 'Saque realizado com sucesso', saldoAtual: saldo - amount });
  } catch (error) {
    console.error('❌ Erro no saque:', error);
    return res.status(500).json({ erro: 'Erro interno ao processar saque.' });
  }
}

module.exports = { withdraw };
