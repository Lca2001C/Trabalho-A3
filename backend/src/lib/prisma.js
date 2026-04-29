// ============================================================================
// ConectaBem — Instância Singleton do Prisma Client
// ============================================================================
// Garante que toda a aplicação usa UMA ÚNICA instância do PrismaClient,
// evitando múltiplos pools de conexão ao banco de dados.
// ============================================================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
