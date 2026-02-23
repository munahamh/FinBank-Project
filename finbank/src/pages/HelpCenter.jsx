import React, { useState } from 'react';
import { 
  Search, HelpCircle, MessageSquare, Mail, 
  ChevronDown, ChevronUp, Shield, CreditCard, 
  User, Zap, LifeBuoy, X, Send, CheckCircle 
} from 'lucide-react';
import axios from "../api/axios";

const HelpCenter = () => {
  // 1. حالات التحكم في الأسئلة الشائعة
  const [activeFaq, setActiveFaq] = useState(null);

  // 2. حالات التحكم في نافذة الدعم (Ticket Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // 3. دالة إرسال التذكرة (Ticket)
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // إرسال البيانات للمسار الجديد الذي أنشأناه في الباك إند
      await axios.post('/tickets', formData); 
      
      setSuccessMessage(true);
      setFormData({ subject: '', message: '' });
      
      // إغلاق النافذة تلقائياً بعد نجاح الإرسال بـ 3 ثوانٍ
      setTimeout(() => {
        setSuccessMessage(false);
        setIsModalOpen(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { icon: User, title: 'Account', desc: 'Manage profile and settings' },
    { icon: Shield, title: 'Security', desc: 'Passwords and 2FA help' },
    { icon: CreditCard, title: 'Payments', desc: 'Cards and transactions' },
    { icon: Zap, title: 'Features', desc: 'Learn about FinBank tools' },
  ];

  const faqs = [
    { 
      q: "How can I freeze my credit card?", 
      a: "You can freeze your card instantly from the 'Card Center' page. Simply select the card you want to lock and toggle the 'Freeze Card' switch." 
    },
    { 
      q: "What should I do if I forget my PIN?", 
      a: "Go to 'Settings' > 'Security' and select 'Change PIN'. You will need to verify your identity through your registered email or phone number." 
    },
    { 
      q: "Are there any fees for international transfers?", 
      a: "FinBank offers zero-fee transfers for the first 3 international transactions every month. After that, a small 0.5% fee applies." 
    },
    { 
      q: "How do I update my personal information?", 
      a: "You can update your name, email, and phone number in the 'Settings' page under 'Personal Information'." 
    }
  ];

  return (
    <div className="space-y-12 pb-16 animate-fade-in relative">
      
      {/* 1. قسم البحث (Hero Section) */}
      <section className="text-center space-y-6 pt-6">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          How can we <span className="text-green-400 text-glow">help you?</span>
        </h1>
        <div className="relative max-w-2xl mx-auto px-4">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
          <input 
            type="text" 
            placeholder="Search for articles, guides..." 
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-slate-200 outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all shadow-2xl"
          />
        </div>
      </section>

      {/* 2. تصنيفات الدعم */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {categories.map((cat, i) => (
          <button key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-green-400/50 hover:bg-slate-800/50 transition-all group text-left">
            <div className="w-12 h-12 rounded-xl bg-green-400/10 flex items-center justify-center text-green-400 mb-4 group-hover:scale-110 transition-transform">
              <cat.icon size={24} />
            </div>
            <h4 className="text-white font-bold mb-1">{cat.title}</h4>
            <p className="text-slate-500 text-xs leading-relaxed">{cat.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-4">
        
        {/* 3. الأسئلة الشائعة (FAQ Accordion) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="text-green-400" size={22} />
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/20">
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-slate-200 font-medium text-sm md:text-base">{faq.q}</span>
                  {activeFaq === index ? <ChevronUp className="text-green-400" /> : <ChevronDown className="text-slate-500" />}
                </button>
                {activeFaq === index && (
                  <div className="p-4 bg-slate-800/20 border-t border-slate-800 animate-slide-down">
                    <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. قنوات التواصل (Support Channels) */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="text-green-400" size={22} />
            Contact Support
          </h3>
          <div className="bg-gradient-to-br from-green-400/10 to-transparent border border-green-400/20 rounded-2xl p-6 space-y-6">
            <p className="text-slate-300 text-sm leading-relaxed">
              Didn't find what you were looking for? Our team is available 24/7.
            </p>
            
            <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors border border-slate-800 group">
              <div className="w-10 h-10 rounded-lg bg-green-400 flex items-center justify-center text-slate-900">
                <MessageSquare size={20} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm">Live Chat</p>
                <p className="text-[10px] text-slate-500">Wait time: ~2 mins</p>
              </div>
            </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors border border-slate-800 group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-green-400 flex items-center justify-center border border-slate-700">
                <Mail size={20} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm">Email Support</p>
                <p className="text-[10px] text-slate-500">Response within 24h</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ================= نافذة إرسال الدعم (Support Ticket Modal) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="text-green-400" />
                Send a Message
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {successMessage ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 bg-green-400/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Message Sent!</h4>
                <p className="text-slate-400 text-sm">We've sent a confirmation to your email. Our team will contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="E.g., Issue with frozen card"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Message</label>
                  <textarea 
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Describe your problem in detail..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all resize-none"
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-green-400 hover:bg-green-500 text-slate-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : (
                    <>Send Message <Send size={18} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;