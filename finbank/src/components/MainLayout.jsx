import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // تأكدي من مسار ملف السايدبار الخاص بكِ

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#0a0f16]"> {/* لون خلفية التطبيق */}
      
      {/* 1. السايدبار الثابت على اليسار */}
      <Sidebar />
      
      {/* 2. مساحة المحتوى المتغيرة على اليمين */}
      <div className="flex-1">
        {/* كلمة Outlet تعني "النافذة" التي ستُعرض بداخلها الصفحات (مثل الداشبورد) */}
        <Outlet /> 
      </div>
      
    </div>
  );
};

export default MainLayout;