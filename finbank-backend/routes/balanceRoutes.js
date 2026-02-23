const express = require('express');
const router = express.Router();
// 👈 استيراد الدالة الجديدة هنا
const { getUserBalance, topUpBalance } = require('../controllers/balanceController');
const protect = require('../middleware/authMiddleware');

// مسار جلب الرصيد
router.get('/', protect, getUserBalance);

// 👈 مسار شحن الرصيد (جديد)
router.post('/topup', protect, topUpBalance);

module.exports = router;