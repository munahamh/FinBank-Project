const Ticket = require('../models/Ticket');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const submitTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const user = await User.findById(req.user.id);

    // حفظ التذكرة في قاعدة البيانات
    const newTicket = await Ticket.create({
      userId: user._id,
      subject,
      message
    });

    // إرسال إيميل تأكيد
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 30px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; border-top: 4px solid #4ade80;">
          <h2 style="color: #0f172a;">Support Ticket Created</h2>
          <p>Hello <strong>${user.fullName}</strong>,</p>
          <p>We have received your message regarding <strong>"${subject}"</strong>.</p>
          <p>Your Ticket ID is: <strong>#${newTicket._id.toString().slice(-6).toUpperCase()}</strong></p>
          <p style="color: #64748b; font-size: 14px;">Our support team will review your message and get back to you within 24 hours.</p>
          <br>
          <p style="font-size: 12px; color: #94a3b8;">© FinBank Support Team</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"FinBank Support 🛡️" <no-reply@finbank.com>',
      to: user.email,
      subject: `Ticket #${newTicket._id.toString().slice(-6).toUpperCase()} - We received your message`,
      html: emailTemplate
    });

    res.status(201).json({ message: "تم إرسال رسالتك بنجاح!" });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء الإرسال", error: error.message });
  }
};

module.exports = { submitTicket };