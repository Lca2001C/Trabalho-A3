const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', rewardController.listRewards);
router.get('/my-redemptions', rewardController.getUserRedemptions);
router.get('/ranking', rewardController.getRanking);
router.post('/redeem', rewardController.redeemReward);

module.exports = router;
