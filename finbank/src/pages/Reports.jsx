import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, PieChart as PieIcon, 
  BarChart as BarIcon, Download, Calendar, 
  ArrowUpRight, ArrowDownRight, Target 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import axios from '../api/axios'; // 👈 استدعاء axios

const Reports = () => {
  // === حالات البيانات الحقيقية ===
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    savingsRate: 0,
    categoryData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // جلب البيانات من الباك إند
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('/reports');
        setReportData(response.data.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  // بيانات وهمية للمخطط الشريطي (يمكن برمجتها لاحقاً لتكون حقيقية حسب الأشهر)
  const monthlyData = [
    { name: 'Jan', income: 4500, expense: 3200 },
    { name: 'Feb', income: 5200, expense: 3800 },
    { name: 'Mar', income: 4800, expense: 4100 },
    { name: 'Apr', income: reportData.totalIncome, expense: reportData.totalExpense }, // الشهر الحالي من الداتا الحقيقية
  ];

  if (isLoading) {
    return <div className="text-center py-20 text-green-400 animate-pulse text-xl font-bold">Generating Reports...</div>;
  }

  return (
    <div className="space-y-8 pb-10 animate-fade-in relative">
      
      {/* 1. الترويسة وأدوات الفلترة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Financial Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Deep dive into your spending habits and income growth.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 hover:text-white transition-all">
            <Calendar size={18} />
            <span className="text-sm">This Month</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-green-400 text-slate-900 font-bold rounded-xl hover:bg-green-300 transition-all shadow-lg">
            <Download size={18} />
            <span className="text-sm">Export PDF</span>
          </button>
        </div>
      </div>

      {/* 2. بطاقات الأداء السريع (بيانات حقيقية) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Net Profit (Balance)</p>
          <div className="flex items-end gap-3">
            <h3 className={`text-3xl font-black ${reportData.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${reportData.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Income</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-black text-cyan-400">
              ${reportData.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-green-500 text-xs font-bold mb-1 flex items-center tracking-tighter">
              <ArrowUpRight size={14} /> Received
            </span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total Expenses</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-black text-white">
              ${reportData.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <span className="text-red-400 text-xs font-bold mb-1 flex items-center tracking-tighter">
              <ArrowDownRight size={14} /> Spent
            </span>
          </div>
        </div>
      </div>

      {/* 3. الرسوم البيانية الكبيرة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* تحليل الفئات (Pie Chart - بيانات حقيقية) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-8">
            <PieIcon size={20} className="text-green-400" />
            <h3 className="text-xl font-bold text-white">Spending by Category</h3>
          </div>
          
          {reportData.categoryData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reportData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${value}`} // إضافة علامة الدولار للنافذة
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[300px] flex items-center justify-center text-slate-500">
                No spending data available yet.
             </div>
          )}
        </div>

        {/* مقارنة الدخل والمصاريف (Bar Chart) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-8">
            <BarIcon size={20} className="text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Income vs Expenses</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. قسم الأهداف المالية (Financial Goals) - محتفظ بتصميمك */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target size={20} className="text-green-400" />
          Financial Goals
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">New Gaming PC Build</span>
              <span className="text-green-400 font-bold">$1,200 / $2,500 (48%)</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 shadow-[0_0_10px_#4ade80]" style={{ width: '48%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Graduation Project Fund</span>
              <span className="text-cyan-400 font-bold">$4,500 / $5,000 (90%)</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Reports;