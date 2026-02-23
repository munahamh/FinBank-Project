import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, ArrowUpDown, ArrowUpRight, ArrowDownLeft,
  // 👈 1. استدعاء الأيقونات الخاصة بالفواتير
  Droplets, Zap, Flame, Wifi, Smartphone, Tv, Music, Gamepad2
} from 'lucide-react';
import axios from '../api/axios'; 

// ==========================================
// 🚀 الدالة الذكية لتحديد أيقونة ولون العملية
// ==========================================
const getTxIconData = (tx) => {
  const title = (tx.title || "").toLowerCase();
  const isIncome = tx.type === "income";

  let Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
  let colorClass = isIncome ? "text-green-400" : "text-red-400";
  let bgClass = isIncome ? "bg-green-400/10" : "bg-red-400/10";

  if (title.includes("steam")) return { icon: Gamepad2, colorClass: "text-slate-300", bgClass: "bg-slate-300/10" };
  if (title.includes("netflix")) return { icon: Tv, colorClass: "text-red-500", bgClass: "bg-red-500/10" };
  if (title.includes("spotify")) return { icon: Music, colorClass: "text-green-500", bgClass: "bg-green-500/10" };
  if (title.includes("telekom") || title.includes("wifi") || title.includes("internet")) return { icon: Wifi, colorClass: "text-cyan-400", bgClass: "bg-cyan-400/10" };
  if (title.includes("turkcell") || title.includes("mobile") || title.includes("vodafone")) return { icon: Smartphone, colorClass: "text-blue-500", bgClass: "bg-blue-500/10" };
  if (title.includes("iski") || title.includes("water")) return { icon: Droplets, colorClass: "text-blue-400", bgClass: "bg-blue-400/10" };
  if (title.includes("igdaş") || title.includes("gas") || title.includes("gaz")) return { icon: Flame, colorClass: "text-orange-400", bgClass: "bg-orange-400/10" };
  if (title.includes("boğaziçi") || title.includes("ck") || title.includes("electric")) return { icon: Zap, colorClass: "text-yellow-400", bgClass: "bg-yellow-400/10" };

  return { icon: Icon, colorClass, bgClass };
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); 

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/transactions');
        setTransactions(response.data.data); 
      } catch (error) {
        console.error("حدث خطأ أثناء جلب الحوالات:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (tx.referenceId && tx.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      
      {/* 1. الترويسة العلوية للصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Transactions History</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track all your incoming and outgoing funds.</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-green-400/10 text-green-400 hover:bg-green-400 hover:text-slate-900 font-medium rounded-xl transition-all duration-300 border border-green-400/30 shadow-lg group">
          <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 2. شريط البحث والفلترة */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between relative z-10">
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-500" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name or Ref ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl focus:ring-2 focus:ring-green-400/50 focus:border-green-400 outline-none transition-all placeholder-slate-500"
          />
        </div>

        <div className="flex w-full md:w-auto gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setFilterType('all')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === 'all' ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilterType('income')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === 'income' ? 'bg-green-500/20 text-green-400 shadow-md' : 'text-slate-400 hover:text-green-400/70'}`}
          >
            Income
          </button>
          <button 
            onClick={() => setFilterType('expense')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === 'expense' ? 'bg-red-500/20 text-red-400 shadow-md' : 'text-slate-400 hover:text-red-400/70'}`}
          >
            Expense
          </button>
        </div>
      </div>

      {/* 3. الجدول الرئيسي */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px] relative">
            <thead className="sticky top-0 bg-[#0f172a] z-10 shadow-sm border-b border-slate-800">
              <tr className="text-slate-400 text-xs uppercase tracking-widest">
                <th className="py-4 px-6 font-semibold">Transaction</th>
                <th className="py-4 px-6 font-semibold">Category</th>
                <th className="py-4 px-6 font-semibold">Date & Time</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 animate-pulse text-lg">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  // 👈 2. استدعاء الدالة لجلب الأيقونة والألوان هنا
                  const { icon: TxIcon, colorClass, bgClass } = getTxIconData(tx);

                  return (
                    <tr key={tx._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {/* 👈 3. تطبيق الألوان والأيقونة المستخرجة */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${colorClass}`}>
                            <TxIcon size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 group-hover:text-green-400 transition-colors">{tx.title}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{tx.referenceId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-400 font-medium">
                        {tx.category || 'Transfer'}
                      </td>

                      <td className="py-4 px-6 text-slate-400">
                        {new Date(tx.createdAt).toLocaleString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric', 
                          hour: 'numeric', minute: 'numeric', hour12: true 
                        })}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                          tx.status === 'Completed' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                          tx.status === 'Pending' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                          'bg-red-400/10 text-red-400 border-red-400/20'
                        }`}>
                          {tx.status || 'Completed'}
                        </span>
                      </td>

                      <td className={`py-4 px-6 text-right font-bold text-base tracking-wide ${
                        tx.type === 'income' ? 'text-green-400' : 'text-slate-200'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    {searchTerm || filterType !== 'all' 
                      ? `No transactions found matching your filters.` 
                      : `You don't have any transactions yet.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Transactions;