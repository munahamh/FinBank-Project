import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Mail, Lock } from 'lucide-react'; // 👈 استدعاء بعض الأيقونات للنافذة الجديدة
import axios from '../api/axios';

const customStyles = `
  @keyframes float1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(150px, 100px) scale(1.1); } }
  @keyframes float2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-150px, -100px) scale(1.2); } }
  @keyframes float3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(100px, -150px) scale(0.9); } }
  .animate-float1 { animation: float1 25s infinite ease-in-out alternate; }
  .animate-float2 { animation: float2 30s infinite ease-in-out alternate; }
  .animate-float3 { animation: float3 28s infinite ease-in-out alternate; }
`;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // ==========================================
  // 👈 حالات نظام "نسيت كلمة المرور" (Forgot Password)
  // ==========================================
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setRequires2FA(false);
  };

  // --- دوال تسجيل الدخول --- (بقيت كما هي)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); setSuccessMessage(''); setIsLoading(true);
    try {
      if (isLogin) {
        const response = await axios.post('/auth/login', { email, password });
        if (response.data.requires2FA) {
          setRequires2FA(true);
          setSuccessMessage(response.data.message);
          setIsLoading(false);
          return;
        }
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userName', user.fullName);
        navigate('/');
      } else {
        await axios.post('/auth/register', { fullName, email, password });
        setSuccessMessage('Account created successfully! 🎉 Please log in.');
        setIsLogin(true); setPassword('');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Server connection error!");
    } finally {
      if (!requires2FA) setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setErrorMessage(''); setIsLoading(true);
    try {
      const response = await axios.post('/auth/verify-2fa', { email, otp: otpCode });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', user.fullName || user.name);
      navigate('/');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Invalid Code!");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 🚀 دوال "نسيت كلمة المرور" (Forgot Password)
  // ==========================================

  // 1. طلب إرسال الكود
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setResetError(''); setResetSuccess(''); setIsLoading(true);
    try {
      const response = await axios.post('/auth/forgot-password', { email: resetEmail });
      setResetSuccess(response.data.message);
      setTimeout(() => {
        setForgotStep(2); // الانتقال للخطوة الثانية بعد النجاح
        setResetSuccess('');
      }, 1500);
    } catch (error) {
      setResetError(error.response?.data?.message || "Error sending request.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. التحقق من الكود وتغيير الباسوورد
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setResetError(''); setResetSuccess(''); setIsLoading(true);
    try {
      const response = await axios.post('/auth/reset-password', { 
        email: resetEmail, 
        otp: resetOtp, 
        newPassword: newPassword 
      });
      setResetSuccess(response.data.message);
      
      // إغلاق النافذة وتجهيز صفحة اللوجن بعد 3 ثواني
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotStep(1);
        setResetEmail(''); setResetOtp(''); setNewPassword(''); setResetSuccess('');
        setEmail(resetEmail); // وضع الإيميل تلقائياً في فورم اللوجن لتسهيل الدخول
      }, 3000);

    } catch (error) {
      setResetError(error.response?.data?.message || "Invalid code or error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeForgotModal = () => {
    setIsForgotModalOpen(false);
    setForgotStep(1);
    setResetError(''); setResetSuccess('');
    setResetEmail(''); setResetOtp(''); setNewPassword('');
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0f16] text-white overflow-hidden relative selection:bg-green-500/30">
      <style>{customStyles}</style>
      
      {/* Background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[150px] pointer-events-none animate-float1 opacity-70"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[150px] pointer-events-none animate-float2 opacity-60"></div>
      <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none animate-float3 opacity-50"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[450px] p-8 sm:p-12 bg-white/[0.03] border border-white/[0.08] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_0_80px_rgba(74,222,128,0.15)] hover:-translate-y-1">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
            FIN<span className="text-green-400 drop-shadow-[0_0_25px_rgba(74,222,128,0.9)]">BANK</span>
          </h1>
          <p className="mt-4 text-base font-medium text-gray-400 tracking-wide">
            {requires2FA ? 'Security Verification Required' : isLogin ? 'Welcome back! Access your dashboard.' : 'Create your new financial identity.'}
          </p>
        </div>
        
        {/* Messages */}
        <div className={`transition-all duration-300 overflow-hidden ${errorMessage || successMessage ? 'max-h-20 mb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
            {errorMessage && <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/50 rounded-xl text-center backdrop-blur-md animate-pulse">{errorMessage}</div>}
            {successMessage && <div className="p-3 text-sm text-green-200 bg-green-500/20 border border-green-500/50 rounded-xl text-center backdrop-blur-md">{successMessage}</div>}
        </div>

        {requires2FA ? (
          <form onSubmit={handleVerify2FA} className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <label className="text-xs font-bold text-green-400 uppercase tracking-wider ml-1 text-center block">Enter 6-Digit Code</label>
              <input type="text" maxLength="6" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="w-full px-5 py-4 text-center text-2xl tracking-[0.5em] text-white bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all duration-300 backdrop-blur-sm" required />
              <p className="text-xs text-gray-400 text-center mt-2">Sent to <span className="text-white">{email}</span></p>
            </div>
            <button type="submit" disabled={isLoading} className={`w-full py-4 mt-4 text-black font-black text-lg tracking-wide rounded-2xl transition-all duration-300 relative overflow-hidden group ${isLoading ? 'bg-gray-600 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-300 hover:to-emerald-300 shadow-[0_0_25px_rgba(74,222,128,0.5)]'}`}>
              {isLoading ? 'Verifying...' : 'VERIFY & LOGIN'}
            </button>
            <button type="button" onClick={() => { setRequires2FA(false); setSuccessMessage(''); setOtpCode(''); }} className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors mt-4">Back to Login</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`space-y-2 transition-all duration-500 ease-in-out overflow-hidden ${!isLogin ? 'max-h-24 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}`}>
              <label className="text-xs font-bold text-green-400 uppercase tracking-wider ml-1">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="w-full px-5 py-4 text-white bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 focus:shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all duration-300 placeholder-gray-600/70 backdrop-blur-sm" required={!isLogin} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-green-400 uppercase tracking-wider ml-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full px-5 py-4 text-white bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 focus:shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all duration-300 placeholder-gray-600/70 backdrop-blur-sm" required />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-green-400 uppercase tracking-wider">Password</label>
                {isLogin && (
                  // 👈 زر "نسيت كلمة المرور" الذي يفتح النافذة
                  <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-xs text-gray-400 hover:text-green-400 transition-colors duration-300 focus:outline-none">
                    Forgot Password?
                  </button>
                )}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-4 text-white bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 focus:shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all duration-300 placeholder-gray-600/70 backdrop-blur-sm" required />
            </div>

            <button type="submit" disabled={isLoading} className={`w-full py-4 mt-4 text-black font-black text-lg tracking-wide rounded-2xl transition-all duration-300 relative overflow-hidden group ${isLoading ? 'bg-gray-600 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-300 hover:to-emerald-300 shadow-[0_0_25px_rgba(74,222,128,0.5)] hover:shadow-[0_0_50px_rgba(74,222,128,0.8)] hover:-translate-y-0.5'}`}>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none"></div>
              {isLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</span> : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>
        )}

        {!requires2FA && (
          <div className="mt-10 text-center text-sm text-gray-400">
            <p className="transition-all duration-300">
              {isLogin ? "New to FinBank? " : "Already a member? "}
              <button onClick={toggleMode} type="button" className="ml-1 text-green-400 font-bold tracking-wide hover:text-green-300 hover:underline focus:outline-none transition-all duration-300">
                {isLogin ? 'Create an Account' : 'Log In Now'}
              </button>
            </p>
          </div>
        )}
      </div>

      {/* ========================================================
          🚀 النافذة المنبثقة: نظام استرداد كلمة المرور
          ======================================================== */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <button onClick={closeForgotModal} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-xl">
              <X size={20} />
            </button>

            <div className="text-center mb-8 relative z-10">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Account Recovery</h2>
              <p className="text-sm text-slate-400 mt-2">Securely reset your FinBank password.</p>
            </div>

            <div className={`transition-all duration-300 overflow-hidden ${resetError || resetSuccess ? 'max-h-20 mb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                {resetError && <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/50 rounded-xl text-center backdrop-blur-md">{resetError}</div>}
                {resetSuccess && <div className="p-3 text-sm text-green-200 bg-green-500/20 border border-green-500/50 rounded-xl text-center backdrop-blur-md">{resetSuccess}</div>}
            </div>

            {forgotStep === 1 ? (
              // --- الخطوة 1: إدخال الإيميل ---
              <form onSubmit={handleRequestReset} className="space-y-6 relative z-10 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-2">
                    <Mail size={14} /> Registered Email
                  </label>
                  <input 
                    type="email" required
                    value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your account email"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50">
                  {isLoading ? 'Sending Request...' : 'Send Recovery Code'}
                </button>
              </form>
            ) : (
              // --- الخطوة 2: إدخال الكود والباسوورد الجديد ---
              <form onSubmit={handleConfirmReset} className="space-y-5 relative z-10 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">6-Digit Email Code</label>
                  <input 
                    type="text" required maxLength="6"
                    value={resetOtp} onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-2">
                    <Lock size={14} /> New Password
                  </label>
                  <input 
                    type="password" required minLength="6"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-green-400 hover:bg-green-300 text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)] disabled:opacity-50 mt-2">
                  {isLoading ? 'Verifying & Saving...' : 'Reset My Password'}
                </button>
                <button type="button" onClick={() => setForgotStep(1)} className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors pt-2">
                  Use a different email
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;