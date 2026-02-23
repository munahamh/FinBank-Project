import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  PlusCircle,
  Send,
  Plus,
  Cpu,
  Search,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  // 👈 1. استدعاء الأيقونات الجديدة الخاصة بالفواتير
  Droplets, Zap, Flame, Wifi, Smartphone, Tv, Music, Gamepad2
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "../api/axios";

// ==========================================
// 🚀 دالة ذكية لتحديد أيقونة ولون العملية
// ==========================================
const getTxIconData = (tx) => {
  const title = (tx.title || "").toLowerCase();
  const isIncome = tx.type === "income";

  // الأيقونات الافتراضية للحوالات العادية
  let Icon = isIncome ? ArrowDownLeft : ArrowUpRight;
  let colorClass = isIncome ? "text-green-400" : "text-red-400";
  let bgClass = isIncome ? "bg-green-400/10" : "bg-red-400/10";

  // فحص الكلمات المفتاحية للفواتير
  if (title.includes("steam")) {
    return { icon: Gamepad2, colorClass: "text-slate-300", bgClass: "bg-slate-300/10" };
  }
  if (title.includes("netflix")) {
    return { icon: Tv, colorClass: "text-red-500", bgClass: "bg-red-500/10" };
  }
  if (title.includes("spotify")) {
    return { icon: Music, colorClass: "text-green-500", bgClass: "bg-green-500/10" };
  }
  if (title.includes("telekom") || title.includes("wifi") || title.includes("internet")) {
    return { icon: Wifi, colorClass: "text-cyan-400", bgClass: "bg-cyan-400/10" };
  }
  if (title.includes("turkcell") || title.includes("mobile") || title.includes("vodafone")) {
    return { icon: Smartphone, colorClass: "text-blue-500", bgClass: "bg-blue-500/10" };
  }
  if (title.includes("iski") || title.includes("water")) {
    return { icon: Droplets, colorClass: "text-blue-400", bgClass: "bg-blue-400/10" };
  }
  if (title.includes("igdaş") || title.includes("gas") || title.includes("gaz")) {
    return { icon: Flame, colorClass: "text-orange-400", bgClass: "bg-orange-400/10" };
  }
  if (title.includes("boğaziçi") || title.includes("ck") || title.includes("electric")) {
    return { icon: Zap, colorClass: "text-yellow-400", bgClass: "bg-yellow-400/10" };
  }

  // إرجاع التصميم الافتراضي إذا لم تكن فاتورة معروفة
  return { icon: Icon, colorClass, bgClass };
};

const Dashboard = () => {
  const navigate = useNavigate();

  // --- الحالات (States) ---
  const [balance, setBalance] = useState(0);
  const [devir, setDevir] = useState(0);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [chartData, setChartData] = useState([]);

  // حالات الفلترة
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // حالة التحكم بالرسم البياني 
  const [chartFilter, setChartFilter] = useState("ALL");

  // ==========================================
  // دالة الرسم البياني الديناميكية
  // ==========================================
  const generateChartData = (txs, filterStr) => {
    if (!txs || txs.length === 0) return [{ name: "Current", amount: 0 }];

    const now = new Date();
    const timeFilteredTxs = txs.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      const diffDays = Math.ceil(Math.abs(now - txDate) / (1000 * 60 * 60 * 24));
      
      if (filterStr === "7D") return diffDays <= 7;
      if (filterStr === "1M") return diffDays <= 30;
      if (filterStr === "1Y") return diffDays <= 365;
      return true; 
    });

    if (timeFilteredTxs.length === 0) return [{ name: "No Data", amount: 0 }];

    const sortedTxs = [...timeFilteredTxs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let format = "day";
    if (filterStr === "1Y" || filterStr === "ALL") {
      const oldestDate = new Date(sortedTxs[0].createdAt);
      const spanDays = Math.ceil(Math.abs(now - oldestDate) / (1000 * 60 * 60 * 24));
      if (spanDays > 365) format = "year";
      else if (spanDays > 31) format = "month";
    }

    const grouped = {};
    sortedTxs.forEach((tx) => {
      const d = new Date(tx.createdAt);
      let key = "";
      if (format === "year") {
        key = d.getFullYear().toString();
      } else if (format === "month") {
        key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      } else {
        key = d.toLocaleString("en-US", { month: "short", day: "numeric" });
      }

      if (!grouped[key]) grouped[key] = 0;
      
      if (tx.type === "income") {
        grouped[key] += tx.amount;
      }
    });

    const finalData = Object.keys(grouped).map((k) => ({ name: k, amount: grouped[k] }));

    if (finalData.length === 1) {
      const singleDate = new Date(sortedTxs[0].createdAt);
      singleDate.setDate(singleDate.getDate() - 1); 
      
      const prevKey = format === "month" 
        ? singleDate.toLocaleString("en-US", { month: "short", year: "2-digit" }) 
        : singleDate.toLocaleString("en-US", { month: "short", day: "numeric" });
      
      finalData.unshift({ name: prevKey, amount: 0 }); 
    }

    return finalData;
  };

  // --- جلب البيانات وتحديث الرسم البياني ---
  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);

    const fetchData = async () => {
      try {
        const balanceResponse = await axios.get('/balance');
        setBalance(balanceResponse.data.data.amount);
        setDevir(balanceResponse.data.data.devir); 

        const txResponse = await axios.get('/transactions');
        setTransactions(txResponse.data.data); 

        const cardsResponse = await axios.get('/cards');
        setCards(cardsResponse.data.data);
      } catch (error) {
        console.error("حدث خطأ أثناء جلب البيانات:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      setChartData(generateChartData(transactions, chartFilter));
    }
  }, [transactions, chartFilter]);

  // --- فلترة الحوالات لقوائم العرض ---
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-10">
      
      {/* =========================================
          القسم العلوي: البطاقات والرصيد
          ========================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-green-500/5 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-xl font-bold text-white">Main Card</h3>
            <button onClick={() => navigate('/cards')} className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors text-sm font-medium">
              <span>View All</span>
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-6 relative z-10">
            {cards.length > 0 ? (
              cards.slice(0, 1).map((card) => (
                <div key={card._id} className="w-full sm:w-[380px] h-[230px] flex-shrink-0 relative p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/50 shadow-2xl overflow-hidden group flex flex-col justify-between">
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"></div>
                  <div className="flex justify-between items-center mb-2">
                    <Cpu className="text-slate-400" size={32} />
                    <span className="font-semibold text-slate-300 tracking-wider text-sm">{card.cardType || 'Virtual'} Card</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl tracking-widest font-mono text-white mb-2 drop-shadow-md">
                    {card.cardNumber ? card.cardNumber.match(/.{1,4}/g).join(' ') : '**** **** **** ****'}
                  </h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Valid Thru</p>
                      <p className="font-bold text-green-400 text-lg">{card.expiryDate}</p>
                    </div>
                    <div className="flex">
                      <div className="w-8 h-8 rounded-full bg-red-500/80 mix-blend-screen"></div>
                      <div className="w-8 h-8 rounded-full bg-yellow-500/80 mix-blend-screen -ml-3"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 flex items-center">No cards found...</p>
            )}

            <button onClick={() => navigate('/cards')} className="w-full sm:w-[220px] h-[230px] flex-shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-green-400 hover:bg-green-400/5 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-green-400/20 flex items-center justify-center mb-3 transition-colors">
                <Plus className="text-slate-400 group-hover:text-green-400 transition-colors" size={24} />
              </div>
              <span className="text-slate-400 group-hover:text-green-400 font-medium transition-colors">Manage Cards</span>
            </button>
          </div>
        </div>

        <div className="xl:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center relative overflow-hidden min-h-[300px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
          <h3 className="text-slate-400 font-medium mb-3 relative z-10">Your Balance</h3>
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-300 tracking-wider mb-2 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)] relative z-10">
            {isLoading ? <span className="animate-pulse text-3xl">Loading...</span> : `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </h2>
          <p className="text-xs text-slate-500 mb-8 relative z-10 font-medium tracking-wide">
            {isLoading ? "..." : `Devir (Rollover): $${devir.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
          <div className="flex w-full justify-around gap-2 relative z-10">
            <button onClick={() => navigate('/contacts')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-green-400 text-slate-300 group-hover:text-slate-900 transition-all duration-300 shadow-lg"><Send size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /></div>
              <span className="text-xs font-medium text-slate-400 group-hover:text-green-400 transition-colors">Send</span>
            </button>
            <button onClick={() => navigate('/cards')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-green-400 text-slate-300 group-hover:text-slate-900 transition-all duration-300 shadow-lg"><PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-500" /></div>
              <span className="text-xs font-medium text-slate-400 group-hover:text-green-400 transition-colors">Topup</span>
            </button>
            <button onClick={() => navigate('/transactions')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-green-400 text-slate-300 group-hover:text-slate-900 transition-all duration-300 shadow-lg"><MoreHorizontal size={20} /></div>
              <span className="text-xs font-medium text-slate-400 group-hover:text-green-400 transition-colors">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          القسم الأوسط: الحوالات والرسم البياني
          ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* -- قائمة الحوالات الأخيرة -- */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-40 pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none transition-all placeholder-slate-500"/>
              </div>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-1 focus:ring-green-400 focus:border-green-400 outline-none cursor-pointer py-2 px-3 w-full sm:w-auto">
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
            {isLoading ? (
              <p className="text-slate-400 text-center py-4 animate-pulse">Loading transactions...</p>
            ) : filteredTransactions.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No transactions found.</p>
            ) : (
              filteredTransactions.map((tx) => {
                const isIncome = tx.type === "income";
                // 👈 2. استدعاء الدالة لجلب الأيقونة والألوان المناسبة للعملية الحالية
                const { icon: TxIcon, colorClass, bgClass } = getTxIconData(tx);

                return (
                  <div key={tx._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      {/* 👈 3. تطبيق الألوان والأيقونة المستخرجة هنا */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass} ${colorClass}`}>
                        <TxIcon size={24} />
                      </div>
                      <div>
                        <h6 className="text-slate-200 font-semibold text-sm md:text-base group-hover:text-green-400 transition-colors">{tx.title}</h6>
                        <p className="text-slate-500 text-xs mt-0.5">{new Date(tx.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                    <div className={`font-bold text-sm md:text-base ${isIncome ? "text-green-400" : "text-slate-300"}`}>
                      {isIncome ? "+" : "-"} ${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* -- الرسم البياني (Chart) -- */}
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Analytics</h3>
            
            <select 
              value={chartFilter} 
              onChange={(e) => setChartFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg p-1.5 outline-none cursor-pointer focus:ring-1 focus:ring-green-400"
            >
              <option value="7D">Last 7 Days</option>
              <option value="1M">This Month</option>
              <option value="1Y">This Year</option>
              <option value="ALL">All Time</option>
            </select>
          </div>

          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val > 1000 ? (val/1000).toFixed(1)+'k' : val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", color: "#f8fafc" }} 
                  itemStyle={{ color: "#4ade80", fontWeight: "bold" }} 
                />
                <Area type="monotone" dataKey="amount" stroke="#4ade80" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* =========================================
          جدول الفواتير التفصيلي
          ========================================= */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden">
        <h3 className="text-xl font-bold text-white mb-6">Detailed Ledger</h3>
        <div className="overflow-x-auto overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
          <table className="w-full text-left border-collapse min-w-[800px] relative">
            <thead className="sticky top-0 bg-[#0f172a] z-10 shadow-sm border-b border-slate-800">
              <tr className="text-slate-400 text-sm uppercase tracking-wider">
                <th className="pb-4 pt-2 font-medium pl-2">Ref ID</th>
                <th className="pb-4 pt-2 font-medium">Date & Time</th>
                <th className="pb-4 pt-2 font-medium">Action</th>
                <th className="pb-4 pt-2 font-medium">Status</th>
                <th className="pb-4 pt-2 font-medium">Category</th>
                <th className="pb-4 pt-2 font-medium text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400 animate-pulse">Loading ledger...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-500">No records found.</td></tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 pl-2 text-slate-300 font-mono text-xs">{tx.referenceId || `TRX-...${tx._id.slice(-4)}`}</td>
                    <td className="py-4 text-slate-400">{new Date(tx.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="py-4 text-slate-300 font-medium flex items-center gap-2">
                      {/* 👈 4. يمكننا إضافة الأيقونة الصغيرة هنا أيضاً في الجدول إذا أردتِ */}
                      {(() => {
                        const { icon: MiniIcon, colorClass } = getTxIconData(tx);
                        return <MiniIcon size={14} className={colorClass} />;
                      })()}
                      {tx.title}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.status === "Completed" ? "bg-green-400/10 text-green-400" : tx.status === "Pending" ? "bg-yellow-400/10 text-yellow-400" : "bg-cyan-400/10 text-cyan-400"}`}>
                        {tx.status || 'Completed'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">{tx.category || 'Transfer'}</td>
                    <td className={`py-4 font-bold text-right pr-2 ${tx.type === 'income' ? 'text-green-400' : 'text-slate-300'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;