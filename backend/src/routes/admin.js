const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const adminController = require('../controllers/adminController');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/institutions', adminController.getAllInstitutions);
router.get('/stats', adminController.getAdminStats);
router.get('/donations', adminController.getAllDonations);
router.get('/users', adminController.getAllUsers);
router.get('/reports', adminController.getReports);
router.post('/institutions/:id/approve', adminController.approveInstitution);
router.post('/institutions/:id/reject', adminController.rejectInstitution);
router.post('/users/:id/promote', adminController.promoteToAdmin);
router.delete('/users/:id/promote', adminController.demoteAdmin);

module.exports = router;
