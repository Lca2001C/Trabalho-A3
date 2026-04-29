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

  const senhaHash = await bcrypt.hash('admin123', 12);

  await prisma.user.create({
    data: {
      nome: 'Administrador Master',
      email: adminEmail,
      senha: senhaHash,
      role: 'ADMIN',
      status: 'APPROVED'
    }
  });

  console.log(`🎉 Admin criado com sucesso: ${adminEmail} / Senha: admin123`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
