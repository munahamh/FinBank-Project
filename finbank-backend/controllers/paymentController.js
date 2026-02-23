const User = require('../models/User');
const Transaction = require('../models/Transaction');

const payBill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceName, category, amount, subscriberId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // === 🛠️ 1. إصلاح مشكلة الرصيد (للمستخدمين القدامى) ===
    // إذا كان حسابك القديم لا يحتوي على رصيد، سنعطيكِ 5000 دولار لتجربة النظام!
    if (user.balance === undefined || user.balance === null) {
      user.balance = 5000; 
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance to pay this bill." });
    }

    // خصم المبلغ وحفظ المستخدم
    user.balance -= amount;
    await user.save();

    // === 🛠️ 2. إنشاء العملية ===
   
    const newTransaction = await Transaction.create({
      userId: userId,                // 👈 تمت الإضافة: لإرضاء شرط (userId is required)
      title: `${serviceName} Bill`,  // 👈 تمت الإضافة: لإرضاء شرط (title is required)
      sender: userId,                // نبقيها تحسباً لاستخدامها في مكان آخر
      type: 'Bill Payment', 
      billerName: serviceName, 
      amount: amount,
      category: category, 
      description: `Payment to ${serviceName} - ID: ${subscriberId}`,
      status: 'Completed'
    });

    res.status(200).json({ 
      message: `Successfully paid $${amount} to ${serviceName} ✅`,
      transaction: newTransaction
    });

  } catch (error) {
    console.error("Payment Error:", error);
    // 👈 3. السر هنا: إرسال الخطأ الحقيقي لقاعدة البيانات ليظهر في المربع الأحمر!
    res.status(500).json({ message: `DB Error: ${error.message}` });
  }
};

module.exports = { payBill };