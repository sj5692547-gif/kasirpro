import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SalesAnalytics } from './SalesAnalytics';
import { StockManagement } from './StockManagement';
import { ProductCatalog } from './ProductCatalog';
import { TransactionLedger } from './TransactionLedger';
import { 
  BarChart3, 
  Package, 
  Layers, 
  Receipt, 
  Building2, 
  ShieldCheck, 
  Clock,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { formatDateShort } from '../../utils/formatters';

export const MerchantBackoffice: React.FC = () => {
  const { activeMerchant, currentMerchantProducts, setActiveView } = useApp();
  const [subTab, setSubTab] = useState<'analytics' | 'stock' | 'products' | 'transactions'>('analytics');

  const lowStockCount = currentMerchantProducts.filter(p => p.stock <= p.minStockAlert).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Merchant Header Profile Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {activeMerchant?.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{activeMerchant?.name}</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Paket {activeMerchant?.activePlanId.toUpperCase()} Aktif
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Pemilik: <strong>{activeMerchant?.ownerName}</strong></span>
              <span>·</span>
              <span>Kategori: {activeMerchant?.businessType}</span>
              <span>·</span>
              <span>Aktif hingga: {formatDateShort(activeMerchant?.subscriptionExpiresAt || '')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveView('merchant_pos')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buka Mesin Kasir POS</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'analytics' as const, label: 'Dashboard Analitik', icon: BarChart3 },
          { 
            id: 'stock' as const, 
            label: 'Manajemen Stok Real-Time', 
            icon: Package, 
            badge: lowStockCount > 0 ? `${lowStockCount} Menipis` : undefined 
          },
          { id: 'products' as const, label: 'Katalog Produk & Harga', icon: Layers },
          { id: 'transactions' as const, label: 'Riwayat Transaksi', icon: Receipt },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {subTab === 'analytics' && <SalesAnalytics />}
      {subTab === 'stock' && <StockManagement />}
      {subTab === 'products' && <ProductCatalog />}
      {subTab === 'transactions' && <TransactionLedger />}

    </div>
  );
};
