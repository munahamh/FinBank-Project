const Card = require('../models/Card');
const User = require('../models/User');
const nodemailer = require('nodemailer');



// إعداد مرسل الإيميل
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// مخزن مؤقت لأكواد الـ OTP الخاصة بالبطاقات
const cardOtpStore = {};

// دالة مساعدة لتوليد بيانات البطاقة برمجياً
const generateCardData = () => {
  // توليد رقم بطاقة مكون من 16 رقم (يبدأ بـ 4 مثل الفيزا)
  const cardNumber = '4' + Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
  // توليد CVV من 3 أرقام
  const cvv = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  // توليد تاريخ انتهاء (بعد 3 سنوات من الآن)
  const year = new Date().getFullYear() + 3;
  const month = Math.floor(Math.random() * 12) + 1;
  const expiryDate = `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  
  return { cardNumber, cvv, expiryDate };
};

// 1. دالة إصدار (إضافة) بطاقة جديدة للمستخدم
const addCard = async (req, res) => {
  try {
    const { cardType } = req.body;
    
    // جلب اسم المستخدم لطباعته على البطاقة
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود!" });

    const { cardNumber, cvv, expiryDate } = generateCardData();

    const newCard = new Card({
      userId: req.user.id,
      cardHolder: user.fullName, // الاسم يأتي تلقائياً من حساب المستخدم
      cardNumber,
      expiryDate,
      cvv,
      cardType: cardType || 'Virtual'
    });

    await newCard.save();

    res.status(201).json({ 
      message: "تم إصدار البطاقة البنكية بنجاح! 💳", 
      card: newCard 
    });

  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء إصدار البطاقة", error: error.message });
  }
};

// 2. دالة جلب جميع بطاقات المستخدم (لعرضها في الواجهة)
const getCards = async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id });
    res.status(200).json({
      message: "تم جلب البطاقات بنجاح!",
      count: cards.length,
      data: cards
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب البطاقات", error: error.message });
  }
};

const requestCardActionOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { actionType } = req.body; // 'Change PIN' or 'Cancel Card'

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    cardOtpStore[user.email] = { otp, actionType, timestamp: Date.now() };

    const mailOptions = {
      from: '"FinBank Security 🛡️" <no-reply@finbank.com>',
      to: user.email,
      subject: `Verification Code for ${actionType}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Security Verification</h2>
          <p>You requested to <strong>${actionType}</strong>. Please use the code below to confirm this action:</p>
          <div style="background: #f1f5f9; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="color: red; font-size: 12px; mt:10px;">If you did not request this, please contact support immediately.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: `Verification code sent to your email.` });
  } catch (error) {
    res.status(500).json({ message: "Failed to send verification code." });
  }
};

// ==========================================
// 2. التحقق من الرمز وتغيير الـ PIN
// ==========================================
const changeCardPin = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { cardId, newPin, otp } = req.body;

    // التحقق من صحة الكود ونوعه
    const storedData = cardOtpStore[user.email];
    if (!storedData || storedData.otp !== otp || storedData.actionType !== 'Change PIN') {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    const card = await Card.findOne({ _id: cardId, userId: user._id });
    if (!card) return res.status(404).json({ message: "Card not found." });

    card.pin = newPin; // تأكدي أن حقل الـ pin موجود في موديل البطاقة
    await card.save();
    
    delete cardOtpStore[user.email]; // مسح الكود
    res.status(200).json({ message: "PIN changed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change PIN." });
  }
};

// ==========================================
// 3. التحقق من الرمز وإلغاء/حذف البطاقة نهائياً
// ==========================================
const cancelCard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { cardId, otp } = req.body;

    const storedData = cardOtpStore[user.email];
    if (!storedData || storedData.otp !== otp || storedData.actionType !== 'Cancel Card') {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    // حذف البطاقة من قاعدة البيانات
    const deletedCard = await Card.findOneAndDelete({ _id: cardId, userId: user._id });
    if (!deletedCard) return res.status(404).json({ message: "Card not found." });

    delete cardOtpStore[user.email];
    res.status(200).json({ message: "Card cancelled and removed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel card." });
  }
};

module.exports = { addCard, getCards ,requestCardActionOtp, changeCardPin, cancelCard };