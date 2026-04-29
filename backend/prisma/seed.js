const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Limpa as recompensas antigas se existirem
  await prisma.reward.deleteMany({});

  await prisma.reward.createMany({
    data: [
      {
        nome: 'Gift Card iFood R$ 50,00',
        descricao: 'Válido para compras em qualquer restaurante no app iFood.',
        custoPontos: 500,
        tipo: 'giftcard',
        estoque: 100,
        ativo: true
      },
      {
        nome: 'Gift Card Uber R$ 30,00',
        descricao: 'Válido para corridas em qualquer categoria da Uber.',
        custoPontos: 300,
        tipo: 'giftcard',
        estoque: 50,
        ativo: true
      },
      {
        nome: 'Gift Card Netflix',
        descricao: 'Assinatura Netflix para curtir séries e filmes.',
        custoPontos: 450,
        tipo: 'giftcard',
        estoque: 200,
        ativo: true
      }
    ]
  });

  console.log('✅ Recompensas de exemplo inseridas com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
