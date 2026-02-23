import React, { useState, useEffect } from 'react';
import { 
  Plus, CreditCard, Lock, Eye, EyeOff, 
  Settings, Snowflake, ShieldCheck, Cpu, X, AlertOctagon, Trash2, CheckCircle
} from 'lucide-react';
import axios from '../api/axios';

const cardStyles = [
  { bgGradient: 'from-slate-800 to-slate-950', textColor: 'text-white', accentColor: 'text-green-400' },
  { bgGradient: 'from-purple-900 via-slate-900 to-slate-950', textColor: 'text-purple-100', accentColor: 'text-purple-400' },
  { bgGradient: 'from-cyan-900 via-slate-900 to-slate-950', textColor: 'text-cyan-100', accentColor: 'text-cyan-400' }
];

const CardCenter = () => {
  const [cards, setCards] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showNumbers, setShowNumbers] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [newCardName, setNewCardName] = useState('');
  const [newCardType, setNewCardType] = useState('Virtual');

  // === حالات العمليات الحساسة (تغيير PIN وإلغاء البطاقة) ===
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', step: 1 }); // type: 'Change PIN' or 'Cancel Card'
  const [otpCode, setOtpCode] = useState('');
  const [newPinCode, setNewPinCode] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    try {
      const balanceRes = await axios.get('/balance');
      setBalance(balanceRes.data.data.amount);

      const cardsRes = await axios.get('/cards');
      const fetchedCards = cardsRes.data.data;
      
      const styledCards = fetchedCards.map((card, index) => ({
        ...card, ...cardStyles[index % cardStyles.length] 
      }));

      setCards(styledCards);
      
      // تحديث البطاقة النشطة أو تعيين أول بطاقة
      if (styledCards.length > 0) {
        if (activeCard) {
            const updatedActive = styledCards.find(c => c._id === activeCard._id);
            setActiveCard(updatedActive || styledCards[0]);
        } else {
            setActiveCard(styledCards[0]);
        }
      } else {
          setActiveCard(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddNewCard = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await axios.post('/cards', { name: newCardName || 'My New Card', cardType: newCardType });
      setIsAddModalOpen(false);
      setNewCardName('');
      fetchData(); 
    } catch (error) {
      alert("Error issuing new card.",error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleFreeze = () => {
    if(!activeCard) return;
    const updatedCards = cards.map(c => 
      c._id === activeCard._id ? { ...c, isFrozen: !c.isFrozen } : c
    );
    setCards(updatedCards);
    setActiveCard({ ...activeCard, isFrozen: !activeCard.isFrozen });
  };

  const maskNumber = (number) => {
    if (!number) return '**** **** **** ****';
    if (showNumbers) return number.match(/.{1,4}/g).join(' ');
    return `**** **** **** ${number.slice(-4)}`;
  };

  // ==========================================
  // دوال الإجراءات الأمنية للبطاقة
  // ==========================================

  // 1. فتح النافذة وطلب الرمز
  const handleInitiateAction = async (type) => {
    setActionModal({ isOpen: true, type, step: 1 });
    setIsProcessingAction(true);
    setActionMessage({ text: '', type: '' });
    setOtpCode('');
    setNewPinCode('');
    
    try {
      await axios.post('/cards/request-otp', { actionType: type });
      setActionModal({ isOpen: true, type, step: 2 });
    } catch (error) {
      setActionMessage({ text: 'Failed to send verification code.', type: 'error' ,error});
      setTimeout(() => setActionModal({ isOpen: false, type: '', step: 1 }), 2000);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // 2. التحقق من الرمز وتنفيذ العملية النهائية
  const handleVerifyAction = async (e) => {
    e.preventDefault();
    setIsProcessingAction(true);
    setActionMessage({ text: '', type: '' });

    try {
      if (actionModal.type === 'Change PIN') {
        await axios.put('/cards/change-pin', { cardId: activeCard._id, newPin: newPinCode, otp: otpCode });
        setActionMessage({ text: 'PIN successfully updated! ✅', type: 'success' });
      } else if (actionModal.type === 'Cancel Card') {
        await axios.delete('/cards/cancel', { data: { cardId: activeCard._id, otp: otpCode } });
        setActionMessage({ text: 'Card permanently cancelled! 🗑️', type: 'success' });
        fetchData(); // إعادة تحميل البطاقات لتختفي البطاقة المحذوفة
      }

      setTimeout(() => {
        setActionModal({ isOpen: false, type: '', step: 1 });
      }, 2500);

    } catch (error) {
      setActionMessage({ text: error.response?.data?.message || 'Invalid code. Try again.', type: 'error' });
    } finally {
      setIsProcessingAction(false);
    }
  };


  if (isLoading) return <div className="text-center py-20 text-green-400 animate-pulse text-xl font-bold">Loading your secure cards...</div>;

  return (
    <div className="space-y-8 pb-10 animate-fade-in relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Card Center</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your physical and virtual cards securely.</p>
        </div>
        
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-green-400/10 text-green-400 hover:bg-green-400 hover:text-slate-900 font-medium rounded-xl transition-all duration-300 border border-green-400/30 shadow-lg group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Add New Card</span>
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
          <CreditCard size={48} className="text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl text-white font-bold mb-2">No Cards Yet</h2>
          <p className="text-slate-400 mb-6">You haven't issued any cards. Click the button above to get started.</p>
        </div>
      ) : activeCard && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* عرض البطاقة الكبيرة */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-700/10 rounded-full blur-3xl"></div>

            <div className={`w-full max-w-[420px] h-[260px] relative p-6 md:p-8 rounded-3xl bg-gradient-to-br ${activeCard.bgGradient} border ${activeCard.isFrozen ? 'border-blue-500/50 opacity-80' : 'border-slate-700/50'} shadow-2xl overflow-hidden group flex flex-col justify-between transition-all duration-500`}>
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"></div>
              
              {activeCard.isFrozen && (
                <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px] z-20 flex items-center justify-center">
                  <div className="bg-blue-500/80 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 backdrop-blur-md">
                    <Snowflake size={18} /> Card Frozen
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                  <Cpu className="text-slate-400" size={36} />
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md ${activeCard.textColor}`}>
                    {activeCard.cardType || 'Virtual'}
                  </span>
                </div>
                <span className={`font-semibold tracking-wider text-sm ${activeCard.textColor}`}>
                  {activeCard.name || 'FinBank Card'}
                </span>
              </div>
              
              <div className="relative z-10 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Card Number</p>
                  <button onClick={() => setShowNumbers(!showNumbers)} className="text-slate-400 hover:text-white transition-colors">
                    {showNumbers ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <h3 className="text-2xl md:text-3xl tracking-widest font-mono text-white drop-shadow-md">
                  {maskNumber(activeCard.cardNumber)}
                </h3>
              </div>
              
              <div className="flex justify-between items-end relative z-10">
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Valid Thru</p>
                    <p className={`font-bold text-lg ${activeCard.accentColor}`}>{activeCard.expiryDate || '12/28'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">CVV</p>
                    <p className={`font-bold text-lg ${activeCard.accentColor}`}>{showNumbers ? (activeCard.cvv || '123') : '***'}</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-10 h-10 rounded-full bg-red-500/80 mix-blend-screen"></div>
                  <div className="w-10 h-10 rounded-full bg-yellow-500/80 mix-blend-screen -ml-4"></div>
                </div>
              </div>
            </div>
          </div>

          {/* إعدادات البطاقة */}
          <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6">Card Settings</h3>
            
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-400 mb-1">Linked Balance</p>
                <h4 className={`text-2xl font-bold ${activeCard.accentColor}`}>
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h4>
              </div>
              <ShieldCheck size={32} className="text-slate-500 opacity-50" />
            </div>

            <div className="space-y-3 flex-1">
              <button onClick={toggleFreeze} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeCard.isFrozen ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400'}`}>
                    <Snowflake size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-slate-200 font-medium">{activeCard.isFrozen ? 'Unfreeze Card' : 'Freeze Card'}</p>
                    <p className="text-xs text-slate-500">Temporarily lock this card</p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${activeCard.isFrozen ? 'bg-blue-500' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 ${activeCard.isFrozen ? 'left-7' : 'left-1'}`}></div>
                </div>
              </button>

              {/* 👈 زر تغيير الـ PIN الجديد */}
              <button onClick={() => handleInitiateAction('Change PIN')} className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <Lock size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-slate-200 font-medium">Change PIN</p>
                    <p className="text-xs text-slate-500">Update your 4-digit security code</p>
                  </div>
                </div>
              </button>
            </div>

            {/* 👈 زر حذف البطاقة الجديد في أسفل القائمة */}
            <div className="mt-4 pt-4 border-t border-slate-800">
                <button 
                  onClick={() => handleInitiateAction('Cancel Card')} 
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-all group"
                >
                  <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-sm">Cancel Card Permanently</span>
                </button>
            </div>
          </div>
        </div>
      )}

      {/* قائمة البطاقات المصغرة */}
      {cards.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4">My Cards</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {cards.map((card) => (
              <div 
                key={card._id} 
                onClick={() => { setActiveCard(card); setShowNumbers(false); }}
                className={`min-w-[260px] p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                  activeCard?._id === card._id 
                  ? `bg-slate-800 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.15)]` 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className={activeCard?._id === card._id ? 'text-green-400' : 'text-slate-500'} size={20} />
                    <span className="text-sm font-medium text-slate-300">{card.name || 'FinBank Card'}</span>
                  </div>
                  {activeCard?._id === card._id && (
                    <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></span>
                  )}
                </div>
                <p className="text-lg font-mono text-slate-400">**** {card.cardNumber ? card.cardNumber.slice(-4) : '****'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= النافذة المنبثقة: إضافة بطاقة جديدة ================= */}
      {/* (احتفظنا بكودك كما هو هنا، مجرد اختصار للمساحة في الرد) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Issue New Card</h2>
            <p className="text-sm text-slate-400 mb-6">Instantly generate a virtual or physical card.</p>
            
            <form onSubmit={handleAddNewCard} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Card Custom Name</label>
                <input type="text" value={newCardName} onChange={(e) => setNewCardName(e.target.value)} className="w-full mt-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-400 outline-none transition-all" placeholder="e.g., Online Shopping" maxLength={20} />
              </div>
              
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Card Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setNewCardType('Virtual')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${newCardType === 'Virtual' ? 'bg-green-400/10 border-green-400 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    <Cpu size={24} /> <span className="text-sm font-semibold">Virtual Card</span>
                  </button>
                  <button type="button" onClick={() => setNewCardType('Physical')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${newCardType === 'Physical' ? 'bg-purple-400/10 border-purple-400 text-purple-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    <CreditCard size={24} /> <span className="text-sm font-semibold">Physical Card</span>
                  </button>
                </div>
              </div>
              
              <button type="submit" disabled={isAdding} className="w-full mt-6 bg-green-400 hover:bg-green-300 text-slate-900 font-bold text-lg py-3 rounded-xl transition-all disabled:opacity-50">
                {isAdding ? 'Generating...' : 'Issue Card Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= النافذة الأمنية الذكية (OTP for PIN/Cancel) ================= */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center">
            
            {/* خلفية الإضاءة بناءً على نوع العملية */}
            <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${actionModal.type === 'Cancel Card' ? 'bg-red-500' : 'bg-orange-500'}`}></div>

            <div className="relative z-10">
              {actionModal.step === 1 ? (
                // 1. شاشة التحميل الأولية أثناء إرسال الإيميل
                <div className="py-8">
                  <div className="w-12 h-12 border-4 border-slate-700 border-t-green-400 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white font-bold">Initiating Security Check...</p>
                  <p className="text-slate-400 text-sm mt-2">Sending verification code to your email.</p>
                </div>
              ) : (
                // 2. شاشة إدخال الكود
                <form onSubmit={handleVerifyAction} className="animate-fade-in">
                  
                  <button type="button" onClick={() => setActionModal({ isOpen: false, type: '', step: 1 })} className="absolute -top-2 -right-2 text-slate-400 hover:text-white">
                    <X size={20} />
                  </button>

                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${actionModal.type === 'Cancel Card' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    {actionModal.type === 'Cancel Card' ? <AlertOctagon size={32} /> : <Lock size={32} />}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{actionModal.type}</h3>
                  <p className="text-slate-400 text-sm mb-6">Enter the 6-digit code sent to your email to confirm this action.</p>

                  {actionMessage.text && (
                    <div className={`p-3 text-sm rounded-lg mb-4 font-medium ${actionMessage.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-green-500/20 text-green-300 border border-green-500/50'}`}>
                      {actionMessage.text}
                    </div>
                  )}

                  {actionModal.type === 'Change PIN' && (
                    <div className="mb-4 text-left">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">New 4-Digit PIN</label>
                      <input 
                        type="password" required maxLength="4" minLength="4"
                        value={newPinCode} onChange={(e) => setNewPinCode(e.target.value.replace(/\D/g, ''))} // أرقام فقط
                        className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] text-xl focus:border-green-400 outline-none"
                        placeholder="••••"
                      />
                    </div>
                  )}

                  <div className="mb-6 text-left">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Email Code</label>
                    <input 
                      type="text" required maxLength="6"
                      value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] text-xl focus:border-green-400 outline-none"
                      placeholder="000000"
                    />
                  </div>

                  <button 
                    type="submit" disabled={isProcessingAction}
                    className={`w-full font-bold py-3 rounded-xl transition-all ${actionModal.type === 'Cancel Card' ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-green-400 hover:bg-green-300 text-slate-900'} disabled:opacity-50`}
                  >
                    {isProcessingAction ? 'Verifying...' : 'Confirm Action'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CardCenter;