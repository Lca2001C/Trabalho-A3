const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const adminController = require('../controllers/adminController');
const donationController = require('../controllers/donationController');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/institutions', adminController.getAllInstitutions);
router.get('/stats', adminController.getAdminStats);
router.get('/donations', adminController.getAllDonations);
router.patch('/donations/:id/status', donationController.updateDonationStatus);
router.get('/users', adminController.getAllUsers);
router.get('/reports', adminController.getReports);
router.post('/institutions/:id/approve', adminController.approveInstitution);
router.post('/institutions/:id/reject', adminController.rejectInstitution);
router.post('/users/:id/promote', adminController.promoteToAdmin);
router.delete('/users/:id/promote', adminController.demoteAdmin);

// Marketplace Management
router.get('/rewards', adminController.getAllRewards);
router.post('/rewards', adminController.createReward);
router.patch('/rewards/:id', adminController.updateReward);
router.delete('/rewards/:id', adminController.deleteReward);

module.exports = router;
