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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ─── Validação de variáveis de ambiente críticas (fail-fast) ────────────────
// Sem JWT_SECRET os tokens seriam assinados com `undefined` — falha silenciosa
// e gravíssima de segurança. Melhor recusar o boot com mensagem clara.
if (!process.env.JWT_SECRET) {
  console.error('❌ ERRO FATAL: JWT_SECRET não definido no arquivo .env');
  console.error('   Adicione em backend/.env:  JWT_SECRET="uma_frase_longa_e_aleatoria"');
  process.exit(1);
}

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

// Helmet — Proteção de headers HTTP contra ataques comuns (XSS, Clickjacking, etc)
app.use(helmet());

// Rate Limiting — Limita requisições para evitar Brute Force e DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP por janela
  message: { erro: 'Muitas requisições vindas deste IP. Tente novamente em 15 minutos.' }
});

// Aplica o limite globalmente (pode ser ajustado para ser mais rígido em rotas de auth)
app.use('/api/', limiter);

// Rate Limiting rígido para autenticação — mitiga brute force de senhas.
// Conta apenas tentativas que falham (skipSuccessfulRequests), então usuários
// legítimos que acertam a senha não são bloqueados.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                  // 10 tentativas falhas por IP por janela
  skipSuccessfulRequests: true,
  message: { erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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

// ─── Handler 404 ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

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

const server = app.listen(PORT, () => {
  console.log(`\n🚀 ConectaBem API rodando em http://localhost:${PORT}`);
  console.log(`📋 Health check:      http://localhost:${PORT}/api/health`);
  console.log(`🔐 Autenticação:      http://localhost:${PORT}/api/auth`);
  console.log(`📦 Doações:           http://localhost:${PORT}/api/donations\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ A porta ${PORT} já está em uso. Encerre o outro processo ou mude a variável PORT no .env.`);
  } else {
    console.error('❌ Erro ao iniciar o servidor:', err.message);
  }
  process.exit(1);
});

module.exports = app; // Exporta para testes automatizados
