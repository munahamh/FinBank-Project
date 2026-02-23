const express = require('express');
const router = express.Router();

// 👈 أضفنا transferMoney هنا لكي يتعرف عليها الملف
const { addTransaction, getTransactions, transferMoney } = require('../controllers/transactionController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getTransactions);
router.post('/', protect, addTransaction);

// مسار التحويل الجديد
router.post('/transfer', protect, transferMoney); 

module.exports = router;