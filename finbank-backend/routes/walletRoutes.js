const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getWalletData } = require('../controllers/walletController');

router.get('/', protect, getWalletData);

module.exports = router;