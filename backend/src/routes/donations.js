// ============================================================================
// ConectaBem — Rotas de Doações
// ============================================================================
// Todas as rotas deste módulo são protegidas pelo authMiddleware,
// pois apenas usuários autenticados podem registrar e consultar doações.
//
// | Método | Rota                        | Descrição                    | JWT? |
// |--------|-----------------------------|------------------------------|------|
// | POST   | /api/donations              | Registra doação + pontos     |  ✅  |
// | GET    | /api/donations              | Lista doações do usuário     |  ✅  |
// | GET    | /api/donations/:id          | Detalhe de uma doação        |  ✅  |
// | PATCH  | /api/donations/:id/status   | Atualiza status (admin)      |  ✅  |
// ============================================================================

const express = require('express');
const router = express.Router();

const donationController = require('../controllers/donationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de doação exigem autenticação
router.use(authMiddleware);

// CRUD de doações
router.post('/', donationController.createDonation);
router.get('/', donationController.getUserDonations);

// Instituição
router.get('/institution/received', donationController.getInstitutionDonations);
router.get('/institution/finance',  donationController.getInstitutionFinance);
router.get('/institution/receipts', donationController.getInstitutionReceipts);
router.post('/:id/confirm', donationController.confirmDonationReceipt);

router.get('/:id', donationController.getDonationById);
router.patch('/:id/status', donationController.updateDonationStatus);

module.exports = router;
