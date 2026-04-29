// ============================================================================
// ConectaBem — Middleware de Moderação (Admin)
// ============================================================================

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
  }
  return next();
}

module.exports = adminMiddleware;
