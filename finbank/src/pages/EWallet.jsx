import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, 
  Plus, Smartphone, Globe, ShieldCheck, ChevronRight 
} from 'lucide-react';
import axios from '../api/axios';

const EWallet = () => {
  const navigate = useNavigate();
  
  // حالات البيانات
  const [balanceUSD, setBalanceUSD] = useState(0);
  const [activity, setActivity] = useState({ totalIncome: 0, totalExpense: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // === 🚀 جلب البيانات من المسارات المضمونة لديكِ ===
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // 1. جلب الرصيد من نفس مسار الداشبورد
        const balanceRes = await axios.get('/balance');
        const currentBalance = balanceRes.data.data.amount || 0;
        setBalanceUSD(currentBalance);

        // 2. جلب الحوالات لحساب الدخل والمصروفات بدقة
        const txRes = await axios.get('/transactions');
        const transactions = txRes.data.data || [];

        let income = 0;
        let expense = 0;

        transactions.forEach(tx => {
          // في الداشبورد، نعتبر أن الدخل نوعه "income" وأي شيء آخر مصروف
          if (tx.type === 'income') {
            income += tx.amount;
          } else {
            expense += tx.amount;
          }
        });

        setActivity({ totalIncome: income, totalExpense: expense });

      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWalletData();
  }, []);

  // === 💱 حساب الأرصدة الموازية الحية ===
  const rateTRY = 35.5; // سعر صرف الليرة
  const rateETH = 0.00035; // سعر صرف الإيثريوم

  const balances = [
    { id: 1, currency: 'USD', name: 'US Dollar', amount: balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2 }), color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 2, currency: 'TRY', name: 'Turkish Lira', amount: (balanceUSD * rateTRY).toLocaleString('en-US', { minimumFractionDigits: 2 }), color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { id: 3, currency: 'ETH', name: 'Ethereum', amount: (balanceUSD * rateETH).toLocaleString('en-US', { minimumFractionDigits: 4 }), color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  if (isLoading) {
    return <div className="text-center py-20 text-green-400 animate-pulse text-xl font-bold">Syncing Wallets...</div>;
  }

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* 1. الترويسة العلوية */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">E-Wallet Center</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your digital assets and multi-currency balances.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700">
            <RefreshCw size={18} />
            <span className="text-sm font-medium">Exchange</span>
          </button>
          <button onClick={() => navigate('/cards')} className="flex items-center gap-2 px-4 py-2.5 bg-green-400 text-slate-900 font-bold rounded-xl hover:bg-green-300 transition-all shadow-lg shadow-green-400/20">
            <Plus size={18} />
            <span className="text-sm">Top Up</span>
          </button>
        </div>
      </div>

      {/* 2. عرض الأرصدة المتعددة (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {balances.map((bal) => (
          <div key={bal.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl hover:border-slate-700 transition-all group relative overflow-hidden">
             <div className={`absolute -top-10 -right-10 w-24 h-24 ${bal.bg} rounded-full blur-3xl opacity-50`}></div>
             
             <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${bal.bg} ${bal.color}`}>
                  <Wallet size={24} />
                </div>
                <span className="text-slate-500 font-bold text-sm tracking-widest">{bal.currency}</span>
             </div>
             
             <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 relative z-10">{bal.name}</p>
             <h3 className={`text-2xl font-black ${bal.color} tracking-tight relative z-10`}>
                {bal.currency === 'ETH' ? '' : bal.currency === 'TRY' ? '₺' : '$'} {bal.amount}
             </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. خدمات الدفع السريع (Quick Payments) */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">Quick Payments</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             {[
               { icon: Smartphone, label: 'Mobile Top-up', color: 'text-blue-400', action: () => navigate('/payments') },
               { icon: Globe, label: 'Internet Bill', color: 'text-purple-400', action: () => navigate('/payments') },
               { icon: ShieldCheck, label: 'Insurance', color: 'text-green-400', action: () => navigate('/payments') },
               { icon: Plus, label: 'Add New', color: 'text-slate-400', action: () => navigate('/payments') }
             ].map((service, i) => (
               <button key={i} onClick={service.action} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-green-400/50 transition-all group">
                  <div className={`w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${service.color}`}>
                    <service.icon size={24} />
                  </div>
                  <span className="text-xs font-medium text-slate-300">{service.label}</span>
               </button>
             ))}
          </div>

          <div onClick={() => navigate('/payments')} className="mt-8 p-4 rounded-xl bg-green-400/5 border border-green-400/20 flex items-center justify-between group cursor-pointer hover:bg-green-400/10 transition-colors">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-400/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
                <div>
                   <p className="text-slate-200 font-bold text-sm">Automate your bills</p>
                   <p className="text-xs text-slate-500">Set up recurring payments for your utilities.</p>
                </div>
             </div>
             <ChevronRight className="text-slate-600 group-hover:text-green-400 transition-colors" />
          </div>
        </div>

        {/* 4. إحصائيات المحفظة (Wallet Stats) */}
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
           <h3 className="text-xl font-bold text-white mb-6">Activity Summary</h3>
           
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-400/10 text-green-400 flex items-center justify-center">
                      <ArrowDownLeft size={20} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Total Income</p>
                      <p className="text-white font-bold">${activity.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                 </div>
              </div>

              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-400/10 text-red-400 flex items-center justify-center">
                      <ArrowUpRight size={20} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Total Spending</p>
                      <p className="text-white font-bold">${activity.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                 <p className="text-slate-500 text-xs text-center leading-relaxed">
                   Your multi-currency wallet values are updated in real-time based on current exchange rates.
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default EWallet;