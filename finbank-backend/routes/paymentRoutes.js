const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { payBill } = require('../controllers/paymentController');

router.post('/pay-bill', protect, payBill);

module.exports = router;