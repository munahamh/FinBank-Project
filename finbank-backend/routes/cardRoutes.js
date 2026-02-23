const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // حارس الأمان الخاص بنا

// 👈 استدعاء الدوال بشكل نظيف وبدون أي تكرار
const { 
  getCards, 
  addCard, 
  requestCardActionOtp, 
  changeCardPin, 
  cancelCard 
} = require('../controllers/cardController');

// ==========================================
// مسارات البطاقات الأساسية
// ==========================================
router.get('/', protect, getCards);
router.post('/', protect, addCard);

// ==========================================
// مسارات الأمان الذكية (OTP)
// ==========================================
router.post('/request-otp', protect, requestCardActionOtp);
router.put('/change-pin', protect, changeCardPin);
router.delete('/cancel', protect, cancelCard);

module.exports = router;