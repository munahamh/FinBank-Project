const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyLoginOTP , forgotPasswordRequest , resetPasswordConfirm } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-2fa", verifyLoginOTP); // 👈 المسار الجديد
router.post('/forgot-password', forgotPasswordRequest);
router.post('/reset-password', resetPasswordConfirm);

module.exports = router;