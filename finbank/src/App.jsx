import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import CardCenter from "./pages/CardCenter";
import Contacts from './pages/Contacts'; 
import EWallet from './pages/EWallet'; 
import Settings from './pages/Settings'; 
import HelpCenter from './pages/HelpCenter'; 
import Reports from './pages/Reports'; 
import Login from "./pages/Login";
import PaymentCenter from "./pages/PaymentCenter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* صفحة الدخول الحرة */}
        <Route path="/login" element={<Login />} />
        
        {/* الغلاف الذي يحتوي على السايدبار والهيدر */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/cards" element={<CardCenter />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/wallet" element={<EWallet />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/payments" element={<PaymentCenter />} />
        </Route>

        {/* حماية لأي مسار خاطئ */}
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;