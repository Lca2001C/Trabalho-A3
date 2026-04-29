const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const financeController = require('../controllers/financeController');

router.use(authMiddleware);
router.post('/withdraw', financeController.withdraw);

module.exports = router;
