const Transaction = require('../models/Transaction');

const getFinancialReports = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. جلب كل العمليات التي تخص المستخدم بأي شكل من الأشكال (بدون التشدد في حالة العملية)
    const transactions = await Transaction.find({
      $or: [
        { userId: userId },    // 👈 الأهم: لأن قاعدة بياناتك تعتمد على هذا الحقل
        { sender: userId }, 
        { receiver: userId }
      ]
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {}; 

    // 2. تحليل كل عملية مالية بذكاء
    transactions.forEach(tx => {
      let isExpense = false;
      let isIncome = false;

      // --- تحديد نوع العملية (مصروف أم دخل) ---
      
      // إذا كانت دفع فاتورة، فهي مصروف أكيد
      if (tx.type === 'Bill Payment') {
        isExpense = true;
      } 
      // إذا كان المستخدم هو المرسل، فهي مصروف
      else if (tx.sender && tx.sender.toString() === userId) {
        isExpense = true;
      }
      // إذا كان المستخدم هو صاحب العملية (userId)
      else if (tx.userId && tx.userId.toString() === userId) {
        isExpense = true; 
      }

      // ⚠️ ولكن، إذا كان المستخدم هو "المستلم" للحوالة، فهي دخل وليست مصروفاً!
      if (tx.receiver && tx.receiver.toString() === userId) {
        isIncome = true;
        isExpense = false; // نلغي احتسابها كمصروف
      }
      // وإذا كانت العملية "إيداع" في الحساب
      else if (tx.type === 'Deposit' || tx.type === 'income' || tx.type === 'Income') {
        isIncome = true;
        isExpense = false;
      }

      // --- تجميع الأرقام بعد تحديد النوع ---
      if (isExpense) {
        totalExpense += tx.amount;
        
        // تجميع الفئات من أجل المخطط الدائري (Pie Chart)
        const category = tx.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + tx.amount;
      } 
      else if (isIncome) {
        totalIncome += tx.amount;
      }
    });

    // 3. تجهيز بيانات المخطط الدائري بالألوان
    const colors = ['#4ade80', '#22d3ee', '#818cf8', '#f472b6', '#94a3b8', '#fbbf24'];
    const categoryData = Object.keys(categoryTotals).map((key, index) => ({
      name: key,
      value: categoryTotals[key],
      color: colors[index % colors.length]
    }));

    // 4. الحسابات النهائية
    const netProfit = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;
    
    // إرسال البيانات للواجهة
    res.status(200).json({
      data: {
        totalIncome,
        totalExpense,
        netProfit,
        savingsRate,
        categoryData
      }
    });

  } catch (error) {
    console.error("Report Error:", error);
    res.status(500).json({ message: "Error generating reports" });
  }
};

module.exports = { getFinancialReports };