import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // 👈 1. استدعاء Outlet السحري
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => { // 👈 2. أزلنا children من هنا
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 font-sans flex selection:bg-green-400/30 overflow-x-hidden">
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-[250px] flex flex-col min-h-screen w-full">
        <main className="flex-1 p-4 md:p-8 w-full max-w-[100vw]">
          
          <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
            
          {/* 👈 3. وضعنا Outlet هنا ليعرض محتوى الداشبورد أو التقارير */}
          <Outlet /> 
          
        </main>
      </div>
    </div>
  );
};

export default Layout;