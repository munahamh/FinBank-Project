import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  ArrowRightLeft,
  CreditCard,
  Contact,
  LogOut,
  Wallet,
  BarChart2,
  Settings,
  Headset,
  Hexagon,
  Zap,
} from "lucide-react";



const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // 👈 1. حالة للتحكم في ظهور نافذة تسجيل الخروج
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 👈 2. دالة إظهار النافذة بدلاً من الخروج المباشر
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // 👈 3. دالة الخروج الفعلي (تُستدعى عند الضغط على "تأكيد" في النافذة)
  const confirmLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const mainMenuItems = [
    { name: "Dashboard", icon: Home, path: "/" },
    { name: "Transactions", icon: ArrowRightLeft, path: "/transactions" },
    { name: "Card Center", icon: CreditCard, path: "/cards" },
    { name: "Contacts", icon: Contact, path: "/contacts" },
    { name: "E-Wallet Center", icon: Wallet, path: "/wallet" },
    { name: "Reports", icon: BarChart2, path: "/reports" },
    { name: "Payment Hub", icon: Zap, path: "/payments" },
  ];

  const otherMenuItems = [
    { name: "Settings", icon: Settings, path: "/settings" },
    { name: "Help Center", icon: Headset, path: "/help" },
  ];

  return (
    <>
      {/* الخلفية السوداء الشفافة تظهر على الموبايل عند فتح القائمة */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* الحاوية الرئيسية للقائمة الجانبية */}
      <div
        className={`fixed left-0 top-0 h-screen w-[250px] bg-slate-950 text-slate-300 border-r border-slate-800/50 p-5 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* الشعار بالأخضر الفاقع */}
        <h4 className="text-2xl font-black text-white text-center mb-8 flex items-center justify-center gap-2 tracking-wider">
          <Hexagon className="text-green-400 fill-green-400/20" size={28} />
          FIN<span className="text-green-400">BANK</span>
        </h4>

        {/* القائمة الرئيسية */}
        <div className="mb-6">
          <small className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block px-3">
            Main Menu
          </small>
          <ul className="space-y-1.5">
            {mainMenuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group ${
                      isActive
                        ? "bg-green-400/10 text-green-400 border border-green-400/30 shadow-[0_0_15px_rgba(74,222,128,0.1)]"
                        : "hover:bg-slate-800/50 hover:text-green-300"
                    }`
                  }
                >
                  <item.icon
                    size={20}
                    className="group-hover:text-green-400 transition-colors"
                  />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* قائمة الإعدادات */}
        <div>
          <small className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block px-3">
            Others
          </small>
          <ul className="space-y-1.5">
            {otherMenuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group ${
                      isActive
                        ? "bg-green-400/10 text-green-400 border border-green-400/30 shadow-[0_0_15px_rgba(74,222,128,0.1)]"
                        : "hover:bg-slate-800/50 hover:text-green-300"
                    }`
                  }
                >
                  <item.icon
                    size={20}
                    className="group-hover:text-green-400 transition-colors"
                  />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* الفوتر */}
        <div className="mt-auto px-3 pt-6 border-t border-slate-800/50 space-y-4">
          {/* زر تسجيل الخروج (يفتح النافذة بدلاً من الخروج المباشر) */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 border border-red-400/20 hover:bg-red-400/10 hover:border-red-400/40 transition-all duration-300 group"
          >
            <LogOut
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
            Logout
          </button>

          <div>
            <small className="block text-slate-400 font-medium">
              &copy; FinBank. 2026
            </small>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
              Digital payment platform by Muna
            </p>
          </div>
        </div>
      </div>

      {/* ================= نافذة التأكيد (Logout Modal) ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
            
            {/* تأثير إضاءة حمراء خفيفة في الخلفية */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
            
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 relative z-10">
              <LogOut size={28} className="ml-1" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Leaving so soon?</h3>
            <p className="text-slate-400 text-sm mb-8 relative z-10">
              Are you sure you want to log out of your FinBank account? You will need to sign in again.
            </p>
            
            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors font-medium border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl transition-colors font-medium shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                Yes, Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;