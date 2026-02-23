import React, { useState, useEffect } from "react"; // 👈 أضفناuseState و useEffect
import { Moon, Bell, User, Menu } from "lucide-react";
import NotificationBell from "./NotificationBell";
import axios from "../api/axios";
import { useNavigate } from 'react-router-dom';

const Header = ({ onOpenSidebar }) => {
  // 1. حالة لحفظ اسم المستخدم
  const [displayName, setDisplayName] = useState(" ");

  // 2. دالة لجلب الاسم من التخزين المحلي فور تحميل المكون

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setDisplayName(savedName);
    }
  }, []);

  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    // جلب بيانات المستخدم لعرض صورته في الترويسة
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/users/profile");
        if (response.data.data.profilePic) {
          setProfilePic(response.data.data.profilePic);
        }
      } catch (error) {
        console.error("خطأ في جلب صورة المستخدم:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <header className="flex justify-between items-center mb-8">
      {/* قسم الترحيب وزر القائمة للموبايل */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-xl bg-slate-800/50 text-slate-300 hover:text-green-400 transition-colors border border-slate-700/50"
        >
          <Menu size={24} />
        </button>

        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Welcome to Finbank
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            {/* 👈 عرض الاسم الديناميكي هنا بدلاً من "Muna" الثابتة */}
            Hi{" "}
            <span className="text-green-400 font-semibold">{displayName}</span>!
            Welcome back.
          </p>
        </div>
      </div>

      {/* أزرار التحكم والإشعارات */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="hidden sm:flex p-2 md:p-2.5 rounded-xl bg-slate-800/50 text-slate-300 hover:text-green-400 hover:bg-green-400/10 transition-all border border-slate-700/50">
          <Moon size={20} />
        </button>

        <NotificationBell />

        <button
          onClick={() => navigate("/settings")}
          title="Go to Settings"
          className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-all border border-green-400/30 md:ml-2 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {profilePic ? (
            // 👈 إذا كان لديه صورة، نعرضها هنا لتملأ الزر بالكامل
            <img
              src={profilePic}
              alt="User Profile"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            // 👈 إذا لم يكن لديه صورة، نعرض الأيقونة الافتراضية
            <User
              size={18}
              className="group-hover:scale-110 transition-transform duration-300"
            />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
