// ============================================================================
// ConectaBem — Rotas de Autenticação
// ============================================================================
// Mapeia os endpoints de autenticação para os métodos do authController.
//
// | Método | Rota               | Descrição              | JWT? |
// |--------|--------------------|------------------------|------|
// | POST   | /api/auth/register | Cadastra novo usuário  |  ❌  |
// | POST   | /api/auth/login    | Login — retorna JWT    |  ❌  |
// | GET    | /api/auth/me       | Dados do usuário logado|  ✅  |
// ============================================================================

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas (não exigem token)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rota protegida (exige token JWT válido)
router.get('/me', authMiddleware, authController.me);
router.put('/profile', authMiddleware, authController.updateProfile);

// Rota de Instituições (protegida para os doadores verem a lista na hora de doar)
router.get('/institutions/approved', authMiddleware, authController.getApprovedInstitutions);

module.exports = router;
