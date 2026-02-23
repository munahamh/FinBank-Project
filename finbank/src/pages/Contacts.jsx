import React, { useState, useEffect } from 'react';
import { Search, UserPlus, MoreVertical, Send, Phone, Mail, Star, X, DollarSign, BadgeCheck, AlertCircle, Trash2, AlertTriangle } from 'lucide-react'; // 👈 استدعاء أيقونات الحذف
import axios from '../api/axios';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // حالات النوافذ المنبثقة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // 👈 حالة نافذة الحذف
  const [selectedContact, setSelectedContact] = useState(null);

  // حالات الإضافة
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // حالات التحويل
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferMessage, setTransferMessage] = useState('');

  const [isDeleting, setIsDeleting] = useState(false); // 👈 حالة زر الحذف (Loading)

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/contacts');
      setContacts(response.data.data);
    } catch (error) {
      console.error("حدث خطأ أثناء جلب جهات الاتصال:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      await axios.post('/contacts', { name: newName, email: newEmail, phone: newPhone, isFavorite, avatarColor: randomColor });
      setIsAddModalOpen(false);
      setNewName(''); setNewEmail(''); setNewPhone(''); setIsFavorite(false);
      fetchContacts();
    } catch (error) {
      console.error("خطأ في الإضافة:", error);
      alert("حدث خطأ أثناء الإضافة!");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleFavorite = async (contact) => {
    try {
      await axios.put(`/contacts/${contact._id}/favorite`);
      setContacts(contacts.map(c => c._id === contact._id ? { ...c, isFavorite: !c.isFavorite } : c));
    } catch (error) {
      console.error("خطأ في تحديث المفضلة:", error);
    }
  };

const handleSendMoney = async (e) => {
    e.preventDefault();
    setIsTransferring(true);
    setTransferMessage('');

    try {
      console.log(`⏳ جاري إرسال ${transferAmount} إلى الإيميل: ${selectedContact.email}`);

      const response = await axios.post('/transactions/transfer', {
        receiverEmail: selectedContact.email,
        amount: Number(transferAmount)
      });
      
      // 👈 هذا السطر سيطبع رد السيرفر الناجح في المتصفح
      console.log("✅ نجاح! رد السيرفر:", response.data);

      setTransferMessage('✅ Transfer Successful!');
      setTimeout(() => {
        setIsTransferModalOpen(false);
        setTransferAmount('');
        setTransferMessage('');
      }, 1500);

    } catch (error) {
      // 👈 هذا السطر سيطبع الخطأ الحقيقي القادم من السيرفر
      console.error("❌ حدث خطأ! التفاصيل:", error.response?.data || error.message);
      
      const errorMsg = error.response?.data?.message || '❌ Failed to transfer money.';
      setTransferMessage(errorMsg);
    } finally {
      setIsTransferring(false);
    }
  };

  // 👈 دالة حذف جهة الاتصال
  const confirmDeleteContact = async () => {
    if (!selectedContact) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/contacts/${selectedContact._id}`);
      // إزالة الشخص من الواجهة فوراً
      setContacts(contacts.filter(c => c._id !== selectedContact._id));
      setIsDeleteModalOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error("خطأ في الحذف:", error);
      alert("حدث خطأ أثناء محاولة الحذف!");
    } finally {
      setIsDeleting(false);
    }
  };

  const openTransferModal = (contact) => {
    setSelectedContact(contact);
    setIsTransferModalOpen(true);
    setTransferMessage('');
  };

  const openDeleteModal = (contact) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favorites = contacts.filter(c => c.isFavorite);

  return (
    <div className="space-y-8 pb-10 animate-fade-in relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Contacts</h1>
          <p className="text-slate-400 text-sm mt-1">Quickly send money to your frequent contacts.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-green-400 text-slate-900 font-bold rounded-xl hover:bg-green-300 transition-all duration-300 shadow-[0_0_20px_rgba(74,222,128,0.2)] group">
          <UserPlus size={18} /><span>Add New Contact</span>
        </button>
      </div>

      {/* المفضلات */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-slate-200 font-semibold mb-6 flex items-center gap-2">
          <Star size={18} className="text-yellow-400 fill-yellow-400" /> Favorites
        </h3>
        <div className="flex gap-6 overflow-x-auto pb-2 custom-scrollbar">
          {isLoading ? (
            <p className="text-slate-400 animate-pulse text-sm">Loading favorites...</p>
          ) : favorites.length > 0 ? (
            favorites.map(fav => (
              <div key={fav._id} onClick={() => openTransferModal(fav)} className="flex flex-col items-center gap-3 min-w-[90px] group cursor-pointer relative">
                {fav.hasFinbankAccount && (
                  <div className="absolute top-0 right-2 bg-[#0f172a] rounded-full p-0.5 z-10"><BadgeCheck size={16} className="text-blue-400 fill-blue-400/20" /></div>
                )}
                <div style={{ backgroundColor: fav.avatarColor || '#10b981' }} className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 ring-4 ring-slate-800 group-hover:ring-green-400/30">
                  {getInitials(fav.name)}
                </div>
                <span className="text-xs text-slate-300 font-medium group-hover:text-green-400 transition-colors text-center">{fav.name.split(' ')[0]}</span>
              </div>
            ))
          ) : (
             <p className="text-slate-500 text-sm">No favorites yet.</p>
          )}
          <button onClick={() => setIsAddModalOpen(true)} className="flex flex-col items-center gap-3 min-w-[90px] group cursor-pointer">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 group-hover:border-green-400 group-hover:text-green-400 transition-all">
              <Plus size={24} />
            </div>
            <span className="text-xs text-slate-500 group-hover:text-green-400">Add</span>
          </button>
        </div>
      </div>

      {/* جدول جهات الاتصال */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input type="text" placeholder="Search by name, email or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-[#0f172a] z-10 border-b border-slate-800">
              <tr className="text-slate-400 text-xs uppercase tracking-widest">
                <th className="py-4 px-6 font-semibold">Contact</th>
                <th className="py-4 px-6 font-semibold">Contact Info</th>
                <th className="py-4 px-6 font-semibold">Favorite</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr><td colSpan="4" className="py-8 text-center text-slate-400 animate-pulse">Loading contacts...</td></tr>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <tr key={contact._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div style={{ backgroundColor: contact.avatarColor || '#10b981' }} className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">{getInitials(contact.name)}</div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200 group-hover:text-green-400 transition-colors flex items-center gap-1.5">
                            {contact.name}
                            {contact.hasFinbankAccount && <BadgeCheck size={16} className="text-blue-400" title="FinBank Account Verified" />}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-400"><Mail size={14} className="text-slate-500" /><span>{contact.email}</span></div>
                        <div className="flex items-center gap-2 text-slate-400"><Phone size={14} className="text-slate-500" /><span>{contact.phone || 'N/A'}</span></div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <button onClick={() => handleToggleFavorite(contact)} className="p-2 rounded-full hover:bg-slate-800 transition-colors focus:outline-none">
                        {contact.isFavorite ? <Star size={18} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" /> : <Star size={18} className="text-slate-600 hover:text-yellow-400/50 transition-colors" />}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openTransferModal(contact)} className={`p-2 rounded-lg transition-all shadow-sm ${contact.hasFinbankAccount ? 'bg-green-400/10 text-green-400 hover:bg-green-400 hover:text-slate-900' : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800 hover:text-white'}`} title="Send Money">
                          <Send size={16} />
                        </button>
                        {/* 👈 زر الحذف الجديد */}
                        <button onClick={() => openDeleteModal(contact)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Delete Contact">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="py-8 text-center text-slate-500">No contacts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= النافذة المنبثقة: حذف جهة اتصال ================= */}
      {isDeleteModalOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center">
            <button onClick={() => setIsDeleteModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            
            <div className="mt-4 mb-2">
              <AlertTriangle size={48} className="text-red-500 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <h3 className="text-xl font-bold text-white mb-2">Delete Contact?</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Are you sure you want to remove <span className="text-white font-semibold">{selectedContact.name}</span> from your contacts? This action cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteContact} 
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* بقية النوافذ المنبثقة (Add & Transfer) لم تتغير */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-white mb-6">Add Contact</h2>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div><label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Full Name</label><input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full mt-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-400 outline-none transition-all" placeholder="John Doe" /></div>
              <div><label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</label><input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full mt-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-400 outline-none transition-all" placeholder="john@example.com" /></div>
              <div><label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone</label><input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full mt-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-green-400 outline-none transition-all" placeholder="+1 234 567 890" /></div>
              <div className="flex items-center gap-3 pt-2 cursor-pointer" onClick={() => setIsFavorite(!isFavorite)}>
                <div className={`w-6 h-6 rounded flex items-center justify-center border ${isFavorite ? 'bg-green-400 border-green-400' : 'bg-slate-800 border-slate-600'}`}>{isFavorite && <Star size={14} className="text-slate-900 fill-slate-900" />}</div>
                <span className="text-sm text-slate-300">Add to Favorites (Quick Access)</span>
              </div>
              <button type="submit" disabled={isAdding} className="w-full mt-4 bg-green-400 hover:bg-green-300 text-slate-900 font-bold text-lg py-3 rounded-xl transition-all disabled:opacity-50">{isAdding ? 'Saving...' : 'Save Contact'}</button>
            </form>
          </div>
        </div>
      )}

      {isTransferModalOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center">
            <button onClick={() => setIsTransferModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            <div className="flex justify-center mb-4">
              <div style={{ backgroundColor: selectedContact.avatarColor || '#10b981' }} className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-slate-800 relative">
                {getInitials(selectedContact.name)}
                {selectedContact.hasFinbankAccount && (<div className="absolute -bottom-1 -right-1 bg-[#0f172a] rounded-full p-1 z-10"><BadgeCheck size={20} className="text-blue-400 fill-blue-400/20" /></div>)}
              </div>
            </div>
            {!selectedContact.hasFinbankAccount ? (
              <div className="mt-6 mb-2">
                <AlertCircle size={48} className="text-red-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                <h3 className="text-xl font-bold text-white mb-2">Transfer Unavailable</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">We're sorry, but <span className="text-slate-200 font-semibold">{selectedContact.name}</span> does not have a registered FinBank account.</p>
                <button onClick={() => setIsTransferModalOpen(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg py-4 rounded-xl transition-all border border-slate-700">Close</button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white">Send to {selectedContact.name}</h2>
                <p className="text-sm text-slate-400 mb-6">{selectedContact.email}</p>
                {transferMessage && <div className={`p-3 mb-4 text-sm font-bold rounded-xl ${transferMessage.includes('✅') ? 'bg-green-400/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{transferMessage}</div>}
                <form onSubmit={handleSendMoney} className="space-y-4">
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400" size={24} />
                    <input type="number" required min="1" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-2xl text-white font-bold text-center focus:ring-2 focus:ring-green-400 outline-none transition-all placeholder-slate-600" placeholder="0.00" />
                  </div>
                  <button type="submit" disabled={isTransferring || transferMessage !== ''} className="w-full bg-green-400 hover:bg-green-300 text-slate-900 font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] disabled:opacity-50">{isTransferring ? 'Processing...' : 'Send Money Now'}</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Plus = ({ size }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);

export default Contacts;