import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Store, 
  ShoppingBag, 
  BarChart3, 
  Crown, 
  Globe, 
  RotateCcw, 
  AlertTriangle,
  Building2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { ActivePlatformView } from '../../types';

export const Navbar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    merchants,
    activeMerchantId,
    setActiveMerchantId,
    activeMerchant,
    currentMerchantProducts,
    resetToDemoData,
    currentUser,
    setIsAuthModalOpen
  } = useApp();

  // Count low stock products for current merchant
  const lowStockCount = currentMerchantProducts.filter(p => p.stock <= p.minStockAlert).length;

  const navItems: { view: ActivePlatformView; label: string; icon: React.ReactNode; tag?: string }[] = [
    {
      view: 'super_admin',
      label: 'Admin SaaS & Bisnis',
      icon: <Crown className="w-4 h-4 text-amber-400" />,
      tag: 'Owner Platform'
    },
    {
      view: 'merchant_pos',
      label: 'Kasir POS Toko',
      icon: <ShoppingBag className="w-4 h-4 text-emerald-400" />
    },
    {
      view: 'merchant_backoffice',
      label: 'Stok & Analitik Toko',
      icon: <BarChart3 className="w-4 h-4 text-indigo-400" />,
      tag: lowStockCount > 0 ? `${lowStockCount} Stok Menipis` : undefined
    },
    {
      view: 'marketing_landing',
      label: 'Website Pemasaran',
      icon: <Globe className="w-4 h-4 text-sky-400" />,
      tag: 'Siap Promosi'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                KasirPro <span className="text-emerald-400">UMKM</span>
              </span>
              <span className="hidden md:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                SaaS Platform
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              POS Kasir Pintar, Stok Real-time & Sistem Langganan
            </p>
          </div>
        </div>

        {/* View / Persona Switcher */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
          {navItems.map(item => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                title={item.label}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.tag && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    item.tag.includes('Stok') 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Active Merchant Switcher & Demo Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {activeView !== 'super_admin' && activeView !== 'marketing_landing' && (
            <div className="relative group">
              <div className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <div className="text-left">
                  <div className="font-semibold text-slate-100 max-w-[120px] truncate">
                    {activeMerchant?.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span>{activeMerchant?.businessType.split('/')[0]}</span>
                    <span>·</span>
                    <span className="text-emerald-400 uppercase font-mono">{activeMerchant?.activePlanId}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Merchant Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ganti Toko UMKM
                </div>
                {merchants.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMerchantId(m.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      m.id === activeMerchantId
                        ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-100">{m.name}</div>
                      <div className="text-[10px] text-slate-400">{m.businessType}</div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      m.subscriptionStatus === 'ACTIVE' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : m.subscriptionStatus === 'TRIAL'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {m.subscriptionStatus}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current User Login Status / Auth Trigger */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-xs transition-all cursor-pointer text-left"
            title="Klik untuk melihat ID & Password atau Ganti Akun"
          >
            <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
              {currentUser.role === 'SUPER_ADMIN' ? 'SA' : currentUser.role === 'MERCHANT_OWNER' ? 'OW' : 'KS'}
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] font-semibold text-slate-200 leading-tight flex items-center gap-1">
                <span>{currentUser.name}</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">
                {currentUser.email}
              </div>
            </div>
          </button>

          {/* Quick Demo Reset */}
          <button
            onClick={() => {
              if (window.confirm('Reset semua data transaksi dan stok ke data demo awal?')) {
                resetToDemoData();
              }
            }}
            title="Reset ke Contoh Data Awal"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
