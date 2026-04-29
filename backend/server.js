// ============================================================================
// ConectaBem — Ponto de Entrada do Servidor Express
// ============================================================================
// Responsabilidades deste arquivo:
//   1. Carregar variáveis de ambiente (.env)
//   2. Configurar middlewares globais (CORS, JSON parser)
//   3. Registrar rotas da API
//   4. Iniciar o servidor HTTP
// ============================================================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─── Middlewares globais ────────────────────────────────────────────────────

// CORS — permite requisições do frontend local e da URL de produção (Vercel)
app.use(cors({
  origin: [
    'http://localhost:5173',           // Vite dev server
    process.env.FRONTEND_URL,          // URL de produção (definida no .env)
  ].filter(Boolean),                   // Remove valores undefined/null
  credentials: true,                   // Permite envio de cookies/headers de auth
}));

// Parse de JSON no body das requisições (limite de 10 MB para uploads base64)
app.use(express.json({ limit: '10mb' }));

// ─── Rota de health check ───────────────────────────────────────────────────
// Útil para monitoramento e para confirmar que o servidor está no ar.
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ambiente: process.env.NODE_ENV || 'development',
  });
});

// ─── Registro de rotas da API ───────────────────────────────────────────────
// Cada módulo de rotas será importado e montado aqui conforme for desenvolvido.

const authRoutes = require('./src/routes/auth');
const donationRoutes = require('./src/routes/donations');
const rewardRoutes = require('./src/routes/rewards');
const adminRoutes = require('./src/routes/admin');
const requestRoutes = require('./src/routes/requests');
const financeRoutes = require('./src/routes/finance');

app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/finance', financeRoutes);

// TODO: Descomentar conforme as rotas forem implementadas
// const pointsRoutes = require('./src/routes/points');
// app.use('/api/points', pointsRoutes);

// const reportRoutes = require('./src/routes/reports');
// app.use('/api/reports', reportRoutes);

// ─── Middleware de tratamento de erros global ───────────────────────────────
// Captura erros não tratados nos controllers e retorna uma resposta padronizada.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('❌ Erro não tratado:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    erro: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Inicialização do servidor ──────────────────────────────────────────────

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 ConectaBem API rodando em http://localhost:${PORT}`);
  console.log(`📋 Health check:      http://localhost:${PORT}/api/health`);
  console.log(`🔐 Autenticação:      http://localhost:${PORT}/api/auth`);
  console.log(`📦 Doações:           http://localhost:${PORT}/api/donations\n`);
});

module.exports = app; // Exporta para testes automatizados
