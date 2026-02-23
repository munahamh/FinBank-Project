const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const resetPasswordStore = {};

// إعداد مرسل الإيميلات (يقرأ البيانات بأمان من ملف .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// مخزن مؤقت لأكواد التحقق الخاصة بتسجيل الدخول
const loginOtpStore = {};

// ==========================================
// 1. دالة تسجيل مستخدم جديد
// ==========================================
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "البريد الإلكتروني مسجل بالفعل!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "تم تسجيل المستخدم بنجاح! 🎉",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ في السيرفر", error: error.message });
  }
};

// ==========================================
// 2. دالة تسجيل الدخول (مع نظام 2FA)
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "البريد الإلكتروني غير صحيح!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "كلمة المرور غير صحيحة!" });

    // 👈 التحقق مما إذا كان المستخدم قد فعل خيار (2FA) من الإعدادات
    // 👈 التحقق مما إذا كان المستخدم قد فعل خيار (2FA) من الإعدادات
    if (user.twoFactorAuth) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      loginOtpStore[email] = otp;

      // 🎨 قالب الإيميل الاحترافي لرمز الدخول (Dark Theme)
      const emailTemplate = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0f16; padding: 40px 20px; color: #e2e8f0;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #0f172a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(74, 222, 128, 0.1); border: 1px solid #1e293b;">
            
            <div style="text-align: center; padding: 30px 20px; border-bottom: 1px solid #1e293b;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">
                FIN<span style="color: #4ade80;">BANK</span>
              </h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Login Verification</p>
            </div>

            <div style="padding: 30px;">
              <h2 style="margin-top: 0; color: #f8fafc; font-size: 20px;">Welcome back, ${user.fullName.split(" ")[0]}!</h2>
              <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                We detected a login attempt to your FinBank account. Please use the following 6-digit verification code to securely access your dashboard:
              </p>
              
              <div style="background-color: #1e293b; border: 1px solid #4ade80; padding: 20px; text-align: center; border-radius: 12px; margin: 30px 0;">
                <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #4ade80;">${otp}</span>
              </div>
              
              <p style="font-size: 13px; line-height: 1.6; color: #64748b;">
                <strong>⚠️ Security Notice:</strong> This code is valid for 10 minutes. Never share this code with anyone. FinBank will never call or email you asking for this code.
              </p>
            </div>

            <div style="background-color: #0b1120; padding: 20px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} FinBank Security Systems.<br>
                Istanbul, Türkiye
              </p>
            </div>
          </div>
        </div>
      `;

      const mailOptions = {
        from: '"FinBank Security 🛡️" <no-reply@finbank.com>',
        to: email,
        subject: "FinBank - Your Login Verification Code",
        html: emailTemplate, // 👈 استخدمنا القالب هنا
      };

      await transporter.sendMail(mailOptions);

      // نرد على الواجهة بأننا نحتاج الكود
      return res.status(200).json({
        requires2FA: true,
        message: "A verification code has been sent to your email.",
        email: user.email,
      });
    }

    // إذا لم يكن مفعل 2FA، يسجل الدخول فوراً
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "تم تسجيل الدخول بنجاح! 🔓",
      token: token,
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ في السيرفر", error: error.message });
  }
};

// ==========================================
// 3. دالة التحقق من كود 2FA لإتمام الدخول
// ==========================================
const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (loginOtpStore[email] !== otp) {
    return res
      .status(400)
      .json({ message: "الرمز غير صحيح أو منتهي الصلاحية" });
  }

  try {
    const user = await User.findOne({ email });
    delete loginOtpStore[email]; // مسح الكود من الذاكرة لزيادة الأمان

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "تم التحقق وتسجيل الدخول بنجاح! 🔓",
      token: token,
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ في السيرفر", error: error.message });
  }
};

// ==========================================
// 1. طلب كود إعادة تعيين كلمة المرور
// ==========================================
const forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email address." });
    }

    // توليد كود من 6 أرقام
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    resetPasswordStore[email] = { otp, timestamp: Date.now() };

    // قالب الإيميل الاحترافي
    const mailOptions = {
      from: '"FinBank Recovery 🛡️" <no-reply@finbank.com>',
      to: email,
      subject: "FinBank - Password Reset Code",
      html: `
        <div style="font-family: Arial; padding: 20px; background-color: #0a0f16; color: white;">
          <h2 style="color: #4ade80;">Password Reset Request</h2>
          <p>Hello ${user.fullName},</p>
          <p>We received a request to reset your FinBank password. Please use the following code:</p>
          <div style="background-color: #1e293b; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #4ade80; border: 1px solid #4ade80;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #94a3b8; mt: 10px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Verification code sent to your email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    // 👈 التعديل هنا: إرسال الخطأ الحقيقي للواجهة ليظهر في المربع الأحمر
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// ==========================================
// 2. التحقق من الكود وتغيير كلمة المرور
// ==========================================
const resetPasswordConfirm = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // 1. التحقق من وجود الكود وصحته
    const storedData = resetPasswordStore[email];
    if (!storedData || storedData.otp !== otp) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code." });
    }

    // 2. التحقق من صلاحية الوقت (مثلاً 10 دقائق)
    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      delete resetPasswordStore[email];
      return res
        .status(400)
        .json({ message: "Verification code has expired." });
    }

    // 3. جلب المستخدم وتشفير الباسوورد الجديد
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // 4. حذف الكود من الذاكرة المؤقتة بعد الاستخدام
    delete resetPasswordStore[email];

    res
      .status(200)
      .json({
        message: "Password has been reset successfully! You can now log in.",
      });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyLoginOTP,
  resetPasswordConfirm,
  forgotPasswordRequest,
};
