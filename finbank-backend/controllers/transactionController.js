const Transaction = require('../models/Transaction');
const Balance = require('../models/Balance');
const User = require('../models/User');
const Notification = require('../models/Notification'); // 👈 استدعاء موديل الإشعارات

// ==========================================
// 1. دالة إضافة حوالة عادية
// ==========================================
const addTransaction =  async (req, res) => {
  try {
    const { title, amount, type, category, status } = req.body;
    
    let userBalance = await Balance.findOne({ userId: req.user.id });
    if (!userBalance) return res.status(404).json({ message: "محفظة المستخدم غير موجودة!" });

    if (type === 'expense') {
      if (userBalance.amount < amount) return res.status(400).json({ message: "رصيدك غير كافٍ! 🚫" });
      userBalance.amount -= Number(amount);
    } else if (type === 'income') {
      userBalance.amount += Number(amount);
    }

    await userBalance.save();

    const refId = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
    const newTransaction = new Transaction({
      userId: req.user.id, title, amount, type, category, status: status || 'Completed', referenceId: refId
    });
    
    await newTransaction.save();

    res.status(201).json({ message: "تمت العملية بنجاح! ✅", transaction: newTransaction, newBalance: userBalance.amount });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء تنفيذ العملية", error: error.message });
  }
};

// ==========================================
// 2. دالة التحويل المالي بين شخصين (مع الإشعارات 🔔)
// ==========================================
const transferMoney = async (req, res) => {
  try {
    const { receiverEmail, amount, title } = req.body;
    const senderId = req.user.id;
    const transferAmount = Number(amount);

    if (!transferAmount || transferAmount <= 0) return res.status(400).json({ message: "المبلغ يجب أن يكون أكبر من الصفر" });

    const receiver = await User.findOne({ email: receiverEmail.trim() });
    if (!receiver) return res.status(404).json({ message: "حساب المُستقبِل غير موجود ❌" });

    const sender = await User.findById(senderId);
    if (receiver._id.toString() === senderId.toString()) return res.status(400).json({ message: "لا يمكنك التحويل لنفسك!" });

    let senderBalance = await Balance.findOne({ userId: senderId });
    if (!senderBalance || senderBalance.amount < transferAmount) {
      return res.status(400).json({ message: "رصيدك غير كافٍ لإتمام هذه الحوالة! 🚫" });
    }

    // --- تحديث الأرصدة ---
    senderBalance.amount -= transferAmount;
    await senderBalance.save();

    let receiverBalance = await Balance.findOne({ userId: receiver._id });
    if (!receiverBalance) {
      receiverBalance = new Balance({ userId: receiver._id, amount: 0, devir: 0 });
    }
    receiverBalance.amount += transferAmount;
    await receiverBalance.save();

    // --- تسجيل الحوالات ---
    const refId = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
    const actualSenderName = sender.fullName || sender.firstName || sender.name || 'FinBank User';
    const actualReceiverName = receiver.fullName || receiver.firstName || receiver.name || 'User';

    const expenseTx = new Transaction({
      userId: senderId, title: title || `Transfer to ${actualReceiverName}`, amount: transferAmount, type: 'expense', category: 'Transfer', status: 'Completed', referenceId: refId
    });

    const incomeTx = new Transaction({
      userId: receiver._id, title: `Received from ${actualSenderName}`, amount: transferAmount, type: 'income', category: 'Transfer', status: 'Completed', referenceId: refId
    });

    await expenseTx.save();
    await incomeTx.save();

    // =======================================================
    // 🔔 نظام الإشعارات الذكي (مكانه الصحيح داخل الـ async)
    // =======================================================
    await Notification.create({
      userId: senderId,
      title: "Transfer Successful 💸",
      message: `You have successfully sent $${transferAmount} to ${actualReceiverName}.`,
      type: "success"
    });

    await Notification.create({
      userId: receiver._id,
      title: "Money Received! 🎉",
      message: `${actualSenderName} has sent you $${transferAmount}.`,
      type: "info"
    });

    res.status(200).json({ message: "تم تحويل الأموال بنجاح! ✅", transaction: expenseTx, newBalance: senderBalance.amount });
  } catch (error) {
    console.error("Transfer Error:", error);
    res.status(500).json({ message: error.message || "حدث خطأ في السيرفر أثناء التحويل" });
  }
};

// ==========================================
// 3. دالة جلب جميع الحوالات
// ==========================================
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب الحوالات", error: error.message });
  }
};

module.exports = { addTransaction, transferMoney, getTransactions };