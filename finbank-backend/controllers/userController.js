const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Notification = require("../models/Notification"); // 👈 استدعاء موديل الإشعارات هنا في الأعلى



// ==========================================
// 1. جلب بيانات الملف الشخصي
// ==========================================
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
    res.status(200).json({ data: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء جلب البيانات", error: error.message });
  }
};

// ==========================================
// 2. تحديث بيانات الملف الشخصي (متضمنة 2FA)
// ==========================================
const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      university,
      language,
      currency,
      twoFactorAuth,
      notifications,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    // تحديث البيانات الأساسية
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (university) user.university = university;
    if (language) user.language = language;
    if (currency) user.currency = currency;

    // 👈 تحديث إعدادات الأمان والإشعارات
    if (twoFactorAuth !== undefined) user.twoFactorAuth = twoFactorAuth;
    if (notifications !== undefined) user.notifications = notifications;

    await user.save();
    res
      .status(200)
      .json({ message: "تم تحديث الملف الشخصي بنجاح!", data: user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء التحديث", error: error.message });
  }
};

// ==========================================
// 3. رفع الصورة الشخصية
// ==========================================
const uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    user.profilePic = imageUrl;

    await user.save();
    res
      .status(200)
      .json({ message: "تم تحديث الصورة بنجاح!", profilePic: imageUrl });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء رفع الصورة", error: error.message });
  }
};

// دالة حذف الصورة الشخصية
const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    user.profilePic = ""; // تفريغ حقل الصورة
    await user.save();

    res.status(200).json({ message: "تم حذف الصورة بنجاح!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء حذف الصورة", error: error.message });
  }
};



// ==========================================
// نظام تغيير كلمة المرور (OTP)
// ==========================================
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 4. طلب رمز التحقق (OTP)
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "الإيميل غير مسجل لدينا" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  // 🎨 تصميم الإيميل الاحترافي (HTML/CSS)
  const emailTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        
        <div style="background-color: #0f172a; padding: 30px 20px; text-align: center;">
          <h1 style="color: #4ade80; margin: 0; font-size: 28px; letter-spacing: 1px;">FinBank</h1>
          <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Secure Account Verification</p>
        </div>

        <div style="padding: 30px; color: #334155;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Password Reset Request</h2>
          <p style="font-size: 15px; line-height: 1.6;">Hello,</p>
          <p style="font-size: 15px; line-height: 1.6;">We received a request to reset the password for your FinBank account. Please use the following verification code to complete the process:</p>
          
          <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; padding: 20px; text-align: center; border-radius: 12px; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0f172a;">${otp}</span>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #64748b;">
            <strong>⚠️ Security Notice:</strong> This code will expire in 10 minutes. Do not share this code with anyone, including FinBank employees.
          </p>
          <p style="font-size: 15px; line-height: 1.6; margin-top: 20px;">If you did not request this change, please ignore this email or contact our support immediately.</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} FinBank Security Team.<br>
            Istanbul, Türkiye
          </p>
        </div>

      </div>
    </div>
  `;

  // إعدادات الإرسال (لاحظي استخدام html بدلاً من text)
  const mailOptions = {
    from: '"FinBank Security 🛡️" <no-reply@finbank.com>', // يظهر كاسم المرسل الأنيق
    to: email,
    subject: "Action Required: Your FinBank Verification Code",
    html: emailTemplate, // 👈 هنا نضع القالب المصمم
  };
  [];

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "تم إرسال الرمز إلى بريدك الإلكتروني" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء إرسال الإيميل" });
  }
};

// 5. التحقق من الرمز وتغيير الباسوورد + إرسال إشعار 🔔
const verifyPasswordReset = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (otpStore[email] !== otp) {
    return res
      .status(400)
      .json({ message: "الرمز غير صحيح أو منتهي الصلاحية" });
  }

  try {
    const user = await User.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    delete otpStore[email];

    // 👈 إنشاء إشعار بنجاح تغيير كلمة المرور (داخل الـ async try block)
    await Notification.create({
      userId: user._id,
      title: "Password Changed 🔒",
      message: "Your account password was successfully updated.",
      type: "success",
    });

    res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح!" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "حدث خطأ أثناء تغيير كلمة المرور",
        error: error.message,
      });
  }
};



// إعداد الإيميل (إذا لم يكن موجوداً في هذا الملف)


// مخزن مؤقت لأكواد نسيان كلمة المرور
const resetPasswordStore = {};




module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  requestPasswordReset,
  verifyPasswordReset,
  deleteProfilePicture,
  
};
