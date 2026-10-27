import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { PosRegister } from './components/pos/PosRegister';
import { MerchantBackoffice } from './components/merchant/MerchantBackoffice';
import { SuperAdminPortal } from './components/admin/SuperAdminPortal';
import { MarketingLanding } from './components/landing/MarketingLanding';
import { AuthModal } from './components/auth/AuthModal';

const MainContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <main className="flex-1">
      {activeView === 'merchant_pos' && <PosRegister />}
      {activeView === 'merchant_backoffice' && <MerchantBackoffice />}
      {activeView === 'super_admin' && <SuperAdminPortal />}
      {activeView === 'marketing_landing' && <MarketingLanding />}
      <AuthModal />
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 antialiased">
        <Navbar />
        <MainContent />
      </div>
    </AppProvider>
  );
}
