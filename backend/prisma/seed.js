const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Limpa as recompensas antigas se existirem
  await prisma.reward.deleteMany({});

  await prisma.reward.createMany({
    data: [
      // --- RESGATE COM PONTOS ---
      {
        nome: 'Vale-Presente iFood R$ 50',
        descricao: 'Crédito de R$ 50 para usar em qualquer pedido no iFood.',
        custoPontos: 500,
        tipo: 'giftcard',
        estoque: 100,
        imagemUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400',
        ativo: true
      },
      {
        nome: 'Ingresso de Cinema VIP',
        descricao: 'Válido para qualquer sessão em rede nacional (2D/3D).',
        custoPontos: 450,
        tipo: 'experiencia',
        estoque: 50,
        imagemUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400',
        ativo: true
      },
      {
        nome: 'Ecobag Sustentável "Conecta"',
        descricao: 'Feita de algodão cru 100% orgânico e reciclado.',
        custoPontos: 250,
        tipo: 'brinde',
        estoque: 30,
        imagemUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=400',
        ativo: true
      },
      {
        nome: 'Mentoria em Sustentabilidade',
        descricao: '30 minutos de conversa com especialistas em impacto social.',
        custoPontos: 1200,
        tipo: 'experiencia',
        estoque: 10,
        imagemUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=400',
        ativo: true
      },
      // --- COMPRAR E APOIAR ---
      {
        nome: 'Kit de Canudos de Inox',
        descricao: 'Conjunto com 4 canudos reutilizáveis e escova de limpeza.',
        custoPontos: 0,
        preco: 29.90,
        pontosBonus: 30,
        tipo: 'brinde',
        estoque: 100,
        imagemUrl: 'https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=400',
        ativo: true
      },
      {
        nome: 'Vaso de Cerâmica "Terra"',
        descricao: 'Produzido artesanalmente por comunidades do interior.',
        custoPontos: 0,
        preco: 54.90,
        pontosBonus: 60,
        tipo: 'artesanato',
        estoque: 20,
        imagemUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400',
        ativo: true
      },
      {
        nome: 'Plante uma Árvore Nativa',
        descricao: 'Certificado digital de plantio em áreas de reflorestamento.',
        custoPontos: 0,
        preco: 15.00,
        pontosBonus: 20,
        tipo: 'digital',
        estoque: 999,
        imagemUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400',
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
