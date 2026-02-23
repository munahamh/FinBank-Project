const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // حارس الأمان
const multer = require('multer');
const path = require('path');

const {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  requestPasswordReset,
  verifyPasswordReset
} = require('../controllers/userController');

// إعداد Multer لحفظ الصور في مجلد uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    // تسمية الصورة برقم المستخدم وتاريخ اليوم لتجنب التكرار
    cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// ==========================================
// المسارات (Routes)
// ==========================================

// مسارات الملف الشخصي
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// مسار رفع الصورة (يستخدم multer)
router.put('/profile-picture', protect, upload.single('profilePic'), uploadProfilePicture);

// مسارات تغيير كلمة المرور
router.post('/request-password-reset', requestPasswordReset);
router.post('/verify-password-reset', verifyPasswordReset);

const { deleteProfilePicture } = require('../controllers/userController'); // استدعيها فوق

// مسار حذف الصورة
router.delete('/profile-picture', protect, deleteProfilePicture);

module.exports = router;