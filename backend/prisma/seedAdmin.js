const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@conectabem.com';

  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (adminUser) {
    console.log(`✅ Admin já existe: ${adminEmail}`);
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
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

  console.log(`🎉 Admin criado com sucesso: ${adminEmail} / Senha: ${adminPassword}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
