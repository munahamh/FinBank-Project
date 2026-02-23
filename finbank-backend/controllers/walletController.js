const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getWalletData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. جلب رصيد المستخدم
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const balanceUSD = user.balance || 0; // الرصيد الأساسي بالدولار

    // 2. حساب الأرصدة الموازية (محاكاة لأسعار الصرف الحالية تقريباً)
    // في المشاريع الحقيقية نستخدم API لجلب أسعار الصرف (مثل ExchangeRate-API)
    const rateTRY = 35.5; // سعر صرف الدولار مقابل الليرة التركية
    const rateETH = 0.00035; // سعر صرف الدولار مقابل الإيثريوم

    const balances = [
      { id: 1, currency: 'USD', name: 'US Dollar', amount: balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: 'text-green-400', bg: 'bg-green-400/10' },
      { id: 2, currency: 'TRY', name: 'Turkish Lira', amount: (balanceUSD * rateTRY).toLocaleString('en-US', { minimumFractionDigits: 2 }), color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
      { id: 3, currency: 'ETH', name: 'Ethereum', amount: (balanceUSD * rateETH).toLocaleString('en-US', { minimumFractionDigits: 4 }), color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ];

    // 3. حساب إجمالي الدخل والمصروفات للمحفظة (من جدول الحوالات)
    const transactions = await Transaction.find({
      $or: [{ userId: userId }, { sender: userId }, { receiver: userId }]
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
      let isExpense = false;
      let isIncome = false;

      if (tx.type === 'Bill Payment' || (tx.sender && tx.sender.toString() === userId) || (tx.userId && tx.userId.toString() === userId)) {
        isExpense = true;
      }
      if ((tx.receiver && tx.receiver.toString() === userId) || tx.type === 'Deposit') {
        isIncome = true;
        isExpense = false;
      }

      if (isExpense) totalExpense += tx.amount;
      else if (isIncome) totalIncome += tx.amount;
    });

    // 4. إرسال البيانات للواجهة
    res.status(200).json({
      data: {
        balances,
        activity: {
          totalIncome,
          totalExpense
        }
      }
    });

  } catch (error) {
    console.error("Wallet Error:", error);
    res.status(500).json({ message: "Error loading wallet data" });
  }
};

module.exports = { getWalletData };