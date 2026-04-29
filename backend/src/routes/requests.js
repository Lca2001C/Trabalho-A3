const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const requestController = require('../controllers/requestController');

router.use(authMiddleware);

router.get('/', requestController.getRequests);
router.post('/', requestController.createRequest);
router.patch('/:id', requestController.updateRequestStatus);

module.exports = router;
