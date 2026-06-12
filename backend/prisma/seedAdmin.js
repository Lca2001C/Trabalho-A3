const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@conectabem.com';

  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (adminUser) {
    console.log(`✅ Admin já existe: ${adminEmail}`);
    return;
  }

  // Segurança: a senha do admin DEVE vir do ambiente — sem fallback fraco.
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    console.error('❌ ADMIN_PASSWORD não definido (ou tem menos de 8 caracteres) no backend/.env');
    console.error('   Adicione em backend/.env:  ADMIN_PASSWORD="uma_senha_forte_aqui"');
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      nome: 'Administrador Master',
      email: adminEmail,
      senha: senhaHash,
      role: 'ADMIN',
      status: 'APPROVED'
    }
  });

  // Não imprimir a senha — ela está no .env de quem rodou o seed.
  console.log(`🎉 Admin criado com sucesso: ${adminEmail}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
