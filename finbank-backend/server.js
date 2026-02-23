// 1. تشغيل ملف البيئة يجب أن يكون السطر الأول دائماً!
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const protect = require('./middleware/authMiddleware');

// 2. استدعاء المسارات والموديلات
const authRoutes = require('./routes/authRoutes'); 
const balanceRoutes = require('./routes/balanceRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const cardRoutes = require('./routes/cardRoutes'); 
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');
const Notification = require('./models/Notification');
const path = require('path');
const ticketRoutes = require('./routes/ticketRoutes');
const reportRoutes = require('./routes/reportRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes');
const walletRoutes = require('./routes/walletRoutes');

// 3. الاتصال بقاعدة البيانات
connectDB();



// 4. إعداد تطبيق Express
const app = express();
app.use(cors()); 
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. ربط المسارات (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes); // في الأسفل مع باقي المسارات
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);



// =====================================
// مسارات الإشعارات 
// =====================================
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
                                          .sort({ createdAt: -1 })
                                          .limit(10);
    res.status(200).json({ data: notifications });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

app.put('/api/notifications/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
});

// =====================================
// تشغيل السيرفر
// =====================================
app.get('/', (req, res) => {
  res.send('FinBank Backend is running perfectly! 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});