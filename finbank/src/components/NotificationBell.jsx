import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Check,
} from "lucide-react";
import axios from "../api/axios"; // تأكدي من مسار الـ axios الخاص بك

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // جلب الإشعارات من السيرفر
  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/notifications");
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // تحديث الإشعارات كل 30 ثانية (Polling) لتبدو كأنها Real-time
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // تحديد الإشعار كمقروء
  const markAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // اختيار الأيقونة واللون حسب نوع الإشعار
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-400" size={20} />;
      case "warning":
        return <AlertTriangle className="text-yellow-400" size={20} />;
      case "error":
        return <XCircle className="text-red-400" size={20} />;
      default:
        return <Info className="text-blue-400" size={20} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* أيقونة الجرس */}

      <button 
  onClick={() => setIsOpen(!isOpen)} 
  className="relative p-2 md:p-2.5 rounded-xl bg-slate-800/50 text-slate-300 hover:text-green-400 hover:bg-green-400/10 transition-all border border-slate-700/50 focus:outline-none group"
>
  {/* أيقونة الجرس مع حركة بسيطة عند الحوم (Hover) */}
  <Bell size={20} className="group-hover:rotate-12 transition-transform" />

  {/* نظام الإشعارات العائم */}
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 flex h-4 w-4">
      {/* طبقة النبض المتحركة لجذب الانتباه */}
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      
      {/* الدائرة الحمراء التي تحتوي على الرقم */}
      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white font-black items-center justify-center border-2 border-[#0f172a]">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    </span>
  )}
</button>

      {/* القائمة المنسدلة للإشعارات */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="font-bold text-white text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <Bell size={32} className="mb-3 opacity-20" />
                <p>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                  className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-4 ${!notif.isRead ? "bg-slate-800/20" : "opacity-70"}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={`text-sm font-semibold ${!notif.isRead ? "text-white" : "text-slate-300"}`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {/* علامة غير مقروء (نقطة زرقاء صغيرة) */}
                  {!notif.isRead && (
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
