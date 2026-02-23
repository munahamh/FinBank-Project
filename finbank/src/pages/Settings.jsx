import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Globe,
  Camera,
  ShieldCheck,
  Check,
  Save,
  X,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import axios from "../api/axios";

const Settings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // حالة الملف الشخصي
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    university: "Istanbul Atlas University",
    language: "English (US)",
    currency: "USD ($)",
    profilePic: "",
  });

  // حالة الصورة
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewPic, setPreviewPic] = useState("");

  // حالة الأمان والإشعارات
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });

  // حالات نافذة تغيير كلمة المرور (OTP)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  // حالة رسالة التنبيه العائمة (Toast)
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  // حالة نافذة التأكيد المخصصة (بديل window.confirm)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

// جلب البيانات
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/users/profile");
        const user = response.data.data;
        setProfile({
          name: user.name || user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          university: user.university || "Istanbul Atlas University",
          language: user.language || "English (US)",
          currency: user.currency || "USD ($)",
          profilePic: user.profilePic || "",
        });
        setPreviewPic(user.profilePic || "");
        
        // 👈 التعديل هنا: جلب حالة 2FA والإشعارات من قاعدة البيانات
        if (user.twoFactorAuth !== undefined) setTwoFactorAuth(user.twoFactorAuth);
        if (user.notifications) setNotifications(user.notifications);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const toggleNotification = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let isImageUpdated = false;

      // رفع الصورة إذا تم اختيارها
      if (selectedFile) {
        const formData = new FormData();
        formData.append("profilePic", selectedFile);
        await axios.put("/users/profile-picture", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        isImageUpdated = true;
      }

      // 👈 التعديل هنا: دمج بيانات 2FA والإشعارات مع الملف الشخصي لإرسالهم معاً
      const dataToSave = {
        ...profile,
        twoFactorAuth,
        notifications
      };

      // إرسال كل البيانات للسيرفر
      await axios.put("/users/profile", dataToSave);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      if (isImageUpdated) {
        showToast("Profile picture and settings updated successfully! 🖼️", "success");
      } else {
        showToast("Settings saved successfully! ✅", "success");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to save changes. Please try again.", "error");
    } finally {
      setIsSaving(false);
      setSelectedFile(null); 
    }
  };

  // دوال الـ OTP
  const requestOtp = async () => {
    setIsSendingOtp(true);
    try {
      await axios.post("/users/request-password-reset", {
        email: profile.email,
      });
      setPasswordStep(2);
      setOtpMessage("✅ A verification code has been sent to your email.");
    } catch (error) {
      setOtpMessage("❌ Failed to send code.", error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyAndChangePassword = async (e) => {
    e.preventDefault();
    setIsSendingOtp(true);
    try {
      await axios.post("/users/verify-password-reset", {
        email: profile.email,
        otp: otpCode,
        newPassword,
      });
      setOtpMessage("✅ Password changed successfully!");
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordStep(1);
        setOtpCode("");
        setNewPassword("");
        setOtpMessage("");
      }, 2000);
    } catch (error) {
      setOtpMessage("❌ Invalid code or error occurred.", error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "MH";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoading)
    return (
      <div className="text-center py-20 text-green-400 animate-pulse text-xl">
        Loading...
      </div>
    );

  const handleDeletePicture = () => {
    // الحالة الأولى: إلغاء الصورة التي تم اختيارها للتو (ولم تُحفظ)
    if (selectedFile) {
      setSelectedFile(null);
      setPreviewPic(profile.profilePic);
      return;
    }

    // الحالة الثانية: حذف الصورة المحفوظة فعلياً
    if (profile.profilePic) {
      // 👈 استدعاء النافذة الاحترافية بدلاً من alert المتصفح
      setConfirmModal({
        isOpen: true,
        title: "Remove Profile Picture",
        message:
          "Are you sure you want to remove your profile picture? This action cannot be undone.",
        onConfirm: async () => {
          setConfirmModal({ ...confirmModal, isOpen: false }); // إغلاق النافذة
          try {
            await axios.delete("/users/profile-picture");
            setProfile({ ...profile, profilePic: "" });
            setPreviewPic("");
            showToast("Profile picture removed successfully! 🗑️", "success");
          } catch (error) {
            console.error("Error deleting picture:", error);
            showToast("Failed to remove picture.", "error");
          }
        },
      });
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in relative">
      {/* 1. الترويسة العلوية - نفس تصميمك */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-400 text-slate-900 font-bold rounded-xl hover:bg-green-300 transition-all shadow-lg shadow-green-400/20 group disabled:opacity-50"
        >
          {isSaving ? (
            <span className="animate-spin">↻</span>
          ) : isSaved ? (
            <Check size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>
            {isSaving
              ? "Saving..."
              : isSaved
                ? "Changes Saved!"
                : "Save Changes"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* 👤 الملف الشخصي - نفس تصميمك */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User size={20} className="text-green-400" /> Personal Information
            </h3>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* صورة الملف الشخصي */}
              {/* صورة الملف الشخصي */}
              <div className="relative flex-shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />

                {/* دائرة الصورة */}
                <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl font-black text-green-400 border-2 border-slate-700 transition-colors overflow-hidden shadow-lg">
                  {previewPic ? (
                    <img
                      src={previewPic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(profile.name)
                  )}
                </div>

                {/* حاوية الأزرار (تعديل / حذف) */}
                <div className="absolute -bottom-3 -right-3 flex gap-1.5 z-10">
                  {/* 👈 زر الحذف: يظهر فقط إذا كان هناك صورة */}
                  {previewPic && (
                    <button
                      type="button"
                      onClick={handleDeletePicture}
                      className="p-2 bg-slate-800 text-red-400 border border-slate-700 rounded-lg shadow-lg hover:bg-red-400 hover:text-slate-900 transition-all"
                      title="Remove Picture"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {/* 👈 زر الكاميرا للتعديل */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="p-2 bg-green-400 text-slate-900 border border-green-400 rounded-lg shadow-lg hover:scale-110 transition-transform"
                    title="Change Picture"
                  >
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              {/* الحقول - نفس تصميمك */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-green-400 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-green-400 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-green-400 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    University
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={profile.university}
                    disabled
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 🔒 الأمان - نفس تصميمك */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Lock size={20} className="text-green-400" /> Security Settings
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div className="flex items-center gap-4">
                  <ShieldCheck className="text-green-400" size={24} />
                  <div>
                    <p className="text-slate-200 font-semibold">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-slate-500">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                </div>
                <div
                  onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                  className={`w-12 h-6 ${twoFactorAuth ? "bg-green-400" : "bg-slate-700"} rounded-full relative cursor-pointer transition-colors duration-300`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${twoFactorAuth ? "right-1" : "left-1"}`}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-green-400 text-sm font-bold hover:text-green-300 transition-colors flex items-center gap-2"
              >
                Change Password <Lock size={14} />
              </button>
            </div>
          </section>
        </div>

        {/* =========================================
            القسم الأيمن: التفضيلات والإشعارات
            ========================================= */}
        <div className="lg:col-span-1 space-y-8">
          {/* ⚙️ التفضيلات - نفس تصميمك */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe size={20} className="text-green-400" /> Preferences
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Language
                </label>
                <select
                  name="language"
                  value={profile.language}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-green-400"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="Turkish (TR)">Turkish (TR)</option>
                  <option value="Arabic (SY)">Arabic (SY)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Default Currency
                </label>
                <select
                  name="currency"
                  value={profile.currency}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 outline-none focus:border-green-400"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="TRY (₺)">TRY (₺)</option>
                </select>
              </div>
            </div>
          </section>

          {/* 🔔 الإشعارات - نفس تصميمك */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell size={20} className="text-green-400" /> Notifications
            </h3>

            <div className="space-y-4">
              {[
                { label: "Email Notifications", key: "email" },
                { label: "Push Notifications", key: "push" },
                { label: "SMS Alerts", key: "sms" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{item.label}</span>
                  <div
                    onClick={() => toggleNotification(item.key)}
                    className={`w-10 h-5 ${notifications[item.key] ? "bg-green-400" : "bg-slate-700"} rounded-full relative cursor-pointer transition-colors duration-300`}
                  >
                    <div
                      className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all duration-300 ${notifications[item.key] ? "right-1" : "left-1"}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ================= النافذة المنبثقة: تغيير كلمة المرور عبر الإيميل ================= */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordStep(1);
                setOtpMessage("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">Password Reset</h2>
              <p className="text-sm text-slate-400 mt-2">
                Securely change your password via email verification.
              </p>
            </div>

            {otpMessage && (
              <div className="mb-4 text-sm font-semibold p-3 bg-slate-800 rounded-lg text-center">
                {otpMessage}
              </div>
            )}

            {passwordStep === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center">
                  We will send a 6-digit verification code to <br />
                  <span className="font-bold text-green-400">
                    {profile.email}
                  </span>
                </p>
                <button
                  onClick={requestOtp}
                  disabled={isSendingOtp}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
                >
                  {isSendingOtp ? "Sending..." : "Send Verification Code"}
                </button>
              </div>
            ) : (
              <form onSubmit={verifyAndChangePassword} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest text-white outline-none focus:border-green-400"
                    placeholder="000000"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full mt-2 bg-green-400 hover:bg-green-300 text-slate-900 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {isSendingOtp ? "Verifying..." : "Change Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= نظام الإشعارات العائم (Toast) ================= */}
      {toast.show && (
        <div className="fixed bottom-10 right-10 z-[100] animate-fade-in flex items-center gap-4 bg-[#1e293b] border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all">
          {toast.type === "success" ? (
            <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center text-green-400 flex-shrink-0">
              <Check size={20} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-400/20 flex items-center justify-center text-red-400 flex-shrink-0">
              <X size={20} />
            </div>
          )}
          <p className="font-semibold text-sm tracking-wide">{toast.message}</p>
        </div>
      )}
      {/* ================= نافذة التأكيد الاحترافية (Custom Confirm Modal) ================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
            {/* تأثير إضاءة حمراء خفيفة في الخلفية */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
            
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 relative z-10">
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">{confirmModal.title}</h3>
            <p className="text-slate-400 text-sm mb-8 relative z-10">{confirmModal.message}</p>
            
            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors font-medium border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl transition-colors font-medium shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
