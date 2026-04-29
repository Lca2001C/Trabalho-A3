// ============================================================================
// ConectaBem — Middleware de Autenticação JWT
// ============================================================================
// Verifica se a requisição contém um token JWT válido no header Authorization.
// Em caso positivo, decodifica o payload e anexa os dados do usuário em `req.user`.
// Deve ser usado em todas as rotas que exigem autenticação (marcadas com ✅ no README).
// ============================================================================

const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

/**
 * Middleware que protege rotas exigindo um token JWT válido.
 *
 * Uso nas rotas:
 *   router.get('/rota-protegida', authMiddleware, controller.metodo);
 *
 * O token deve ser enviado no header:
 *   Authorization: Bearer <token>
 *
 * Após validação, `req.user` conterá: { id, email, tipo }
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Verifica se o header Authorization foi enviado
  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  // Extrai o token do formato "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ erro: 'Formato de token inválido. Use: Bearer <token>' });
  }

  const token = parts[1];

  try {
    // Decodifica e valida o token com a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Consulta em tempo real para blindagem de acesso
    const userDb = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, status: true }
    });

    if (!userDb) {
      return res.status(401).json({ erro: 'Usuário não encontrado ou deletado.' });
    }

    if (userDb.status !== 'APPROVED') {
      return res.status(403).json({ erro: 'Sua conta ainda está em análise ou foi bloqueada.' });
    }

    // Anexa os dados do usuário à requisição para uso nos controllers
    req.user = {
      id: userDb.id,
      email: userDb.email,
      role: userDb.role,
    };

    return next();
  } catch (error) {
    // Token expirado, assinatura inválida, etc.
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado. Faça login novamente.' });
    }
    return res.status(401).json({ erro: 'Token inválido.' });
  }
}

module.exports = authMiddleware;
