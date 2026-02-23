const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getFinancialReports } = require('../controllers/reportController');

router.get('/', protect, getFinancialReports);

module.exports = router;