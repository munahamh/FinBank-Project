import React, { useState } from 'react';
import { 
  Droplets, Zap, Flame, Wifi, Smartphone, 
  Tv, Music, Gamepad2, Search, X, Receipt, CheckCircle, AlertTriangle
} from 'lucide-react';
import axios from '../api/axios';

const PaymentCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  
  const [subscriberId, setSubscriberId] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); 
  const [statusMessage, setStatusMessage] = useState('');

  // 👈 1. مصفوفة الخدمات المحدثة بالقيود الحقيقية (Regex & Placeholders)
  const services = [
    { 
      id: 1, name: 'İSKİ Water', category: 'Utilities', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-400/10',
      label: 'Contract Number', placeholder: '8 digits (e.g. 12345678)',
      pattern: /^\d{8}$/, errorMsg: 'İSKİ Contract must be exactly 8 digits.'
    },
    { 
      id: 2, name: 'CK Boğaziçi', category: 'Utilities', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10',
      label: 'Account Number', placeholder: '10 digits (e.g. 1234567890)',
      pattern: /^\d{10}$/, errorMsg: 'Account number must be exactly 10 digits.'
    },
    { 
      id: 3, name: 'İGDAŞ Gas', category: 'Utilities', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10',
      label: 'Contract Number', placeholder: '12 digits',
      pattern: /^\d{12}$/, errorMsg: 'İGDAŞ Contract must be exactly 12 digits.'
    },
    { 
      id: 4, name: 'Türk Telekom', category: 'Telecom', icon: Wifi, color: 'text-cyan-400', bg: 'bg-cyan-400/10',
      label: 'Internet Service No.', placeholder: '10 digits (e.g. 212xxxxxxx)',
      pattern: /^\d{10}$/, errorMsg: 'Service number must be exactly 10 digits.'
    },
    { 
      id: 5, name: 'Turkcell Mobile', category: 'Telecom', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-500/10',
      label: 'Mobile Number', placeholder: 'Starts with 5 (e.g. 53X XXX XXXX)',
      pattern: /^5\d{9}$/, errorMsg: 'Mobile number must be 10 digits and start with 5.'
    },
    { 
      id: 6, name: 'Netflix Subscription', category: 'Entertainment', icon: Tv, color: 'text-red-500', bg: 'bg-red-500/10',
      label: 'Account Email', placeholder: 'name@example.com',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, errorMsg: 'Please enter a valid email address.'
    },
    { 
      id: 7, name: 'Spotify Premium', category: 'Entertainment', icon: Music, color: 'text-green-500', bg: 'bg-green-500/10',
      label: 'Account Email', placeholder: 'name@example.com',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, errorMsg: 'Please enter a valid email address.'
    },
    { 
      id: 8, name: 'Steam Wallet', category: 'Entertainment', icon: Gamepad2, color: 'text-slate-300', bg: 'bg-slate-300/10',
      label: 'Steam ID64', placeholder: '17 digits starting with 7',
      pattern: /^7\d{16}$/, errorMsg: 'Steam ID must be 17 digits and start with 7.'
    },
  ];

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus(null);

    // 👈 2. التحقق من صحة الرقم (Validation) قبل إرسال الطلب للسيرفر
    if (!selectedService.pattern.test(subscriberId)) {
      setPaymentStatus('error');
      setStatusMessage(selectedService.errorMsg);
      setIsProcessing(false);
      return; // إيقاف العملية هنا فوراً إذا كان الرقم غير صحيح
    }

    try {
      const response = await axios.post('/payments/pay-bill', {
        serviceName: selectedService.name,
        category: selectedService.category,
        amount: Number(amount),
        subscriberId: subscriberId
      });

      setPaymentStatus('success');
      setStatusMessage(response.data.message || 'Payment Successful!');
      
      setTimeout(() => { closeModal(); }, 3000);

    } catch (error) {
      setPaymentStatus('error');
      setStatusMessage(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedService(null);
    setSubscriberId('');
    setAmount('');
    setPaymentStatus(null);
    setStatusMessage('');
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in relative">
      
      {/* الترويسة وشريط البحث */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Payment Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Pay your bills and manage subscriptions instantly.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search services..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all shadow-lg"
          />
        </div>
      </div>

      {/* شبكة الخدمات (Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredServices.map((service) => (
          <button 
            key={service.id}
            onClick={() => setSelectedService(service)}
            className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-green-400/50 hover:bg-slate-800/50 hover:-translate-y-1 transition-all duration-300 group text-left shadow-xl"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 rounded-xl ${service.bg} flex items-center justify-center ${service.color} group-hover:scale-110 transition-transform`}>
                <service.icon size={28} />
              </div>
            </div>
            <h4 className="text-white font-bold text-lg mb-1">{service.name}</h4>
            <p className="text-slate-500 text-xs font-semibold tracking-wider uppercase">{service.category}</p>
          </button>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-20">
          <Receipt size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Services Found</h3>
          <p className="text-slate-400">We couldn't find any service matching your search.</p>
        </div>
      )}

      {/* النافذة المنبثقة: نموذج الدفع (Payment Modal) */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            
            <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[60px] opacity-20 ${selectedService.bg.split('/')[0]}`}></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${selectedService.bg} flex items-center justify-center ${selectedService.color}`}>
                  <selectedService.icon size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{selectedService.name}</h3>
                  <p className="text-xs text-slate-400">{selectedService.category}</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-1.5 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {paymentStatus === 'success' ? (
              <div className="text-center py-8 animate-fade-in relative z-10">
                <div className="w-20 h-20 bg-green-400/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} />
                </div>
                <h4 className="text-white font-bold text-xl mb-2">Payment Successful!</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{statusMessage}</p>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-5 relative z-10">
                
                {/* رسالة الخطأ أصبحت أكثر وضوحاً مع أيقونة */}
                {paymentStatus === 'error' && (
                  <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 backdrop-blur-md animate-shake">
                    <AlertTriangle size={18} className="flex-shrink-0" />
                    <p>{statusMessage}</p>
                  </div>
                )}
                
                <div>
                  {/* 👈 3. استخدام اسم الحقل الديناميكي والنص التوضيحي المخصص لكل خدمة */}
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 mb-2 block">
                    {selectedService.label}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={subscriberId}
                    onChange={(e) => {
                      setSubscriberId(e.target.value);
                      if(paymentStatus === 'error') setPaymentStatus(null); // إخفاء الخطأ عند بدء الكتابة مجدداً
                    }}
                    className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all font-mono tracking-wider ${paymentStatus === 'error' ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : 'border-slate-700 focus:border-green-400 focus:ring-green-400/50'}`}
                    placeholder={selectedService.placeholder}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 mb-2 block">Payment Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <input 
                      type="number" 
                      required
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all text-xl font-bold"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-400">Transaction Fee</span>
                  <span className="text-sm font-bold text-green-400">Free</span>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-green-400 hover:bg-green-300 text-slate-900 font-black text-lg py-3.5 rounded-xl transition-all disabled:opacity-50 mt-4 shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_25px_rgba(74,222,128,0.4)]"
                >
                  {isProcessing ? 'Verifying & Processing...' : `Pay $${amount || '0.00'}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentCenter;