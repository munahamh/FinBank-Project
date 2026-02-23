const Balance = require('../models/Balance');

// 1. دالة جلب الرصيد (التي جربناها للتو)
const getUserBalance = async (req, res) => {
  try {
    let balance = await Balance.findOne({ userId: req.user.id });

    if (!balance) {
      balance = new Balance({
        userId: req.user.id,
        currency: 'USD',
        amount: 0,
        devir: 0
      });
      await balance.save();
    }

    res.status(200).json({ message: "تم جلب بيانات الرصيد بنجاح!", data: balance });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب الرصيد", error: error.message });
  }
};

// 2. 👈 دالة شحن الرصيد (الجديدة)
const topUpBalance = async (req, res) => {
  try {
    const { amount } = req.body; // نأخذ المبلغ من الطلب

    // التأكد من أن المبلغ المدخل صحيح وأكبر من صفر
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "الرجاء إدخال مبلغ صحيح للإيداع! ⚠️" });
    }

    // البحث عن رصيد المستخدم
    let balance = await Balance.findOne({ userId: req.user.id });
    
    if (!balance) {
      return res.status(404).json({ message: "لم يتم العثور على محفظة لهذا المستخدم." });
    }

    // إضافة المبلغ الجديد إلى الرصيد الحالي
    balance.amount += Number(amount);
    
    // حفظ التعديل في قاعدة البيانات
    await balance.save();

    res.status(200).json({ 
      message: "تم شحن الرصيد بنجاح! 💸", 
      data: balance 
    });

  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء شحن الرصيد", error: error.message });
  }
};

module.exports = { getUserBalance, topUpBalance }; // 👈 لا تنسي تصدير الدالة الجديدة