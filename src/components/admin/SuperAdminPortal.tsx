import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Merchant, SubscriptionPlan, SaaSInvoice, BusinessCategory } from '../../types';
import { formatRupiah, formatNumber, formatDateShort } from '../../utils/formatters';
import { 
  Crown, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Share2, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Copy, 
  MessageSquare,
  Sparkles,
  Building,
  Check,
  Zap,
  DollarSign
} from 'lucide-react';

export const SuperAdminPortal: React.FC = () => {
  const { 
    merchants, 
    plans, 
    saasInvoices, 
    renewMerchantSubscription, 
    updateMerchant, 
    addMerchant, 
    updatePlan,
    setActiveMerchantId,
    setActiveView
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'merchants' | 'plans' | 'marketing' | 'invoices'>('overview');
  const [searchMerchant, setSearchMerchant] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // New Merchant Modal State
  const [isAddMerchantOpen, setIsAddMerchantOpen] = useState<boolean>(false);
  const [newStoreName, setNewStoreName] = useState<string>('');
  const [newOwnerName, setNewOwnerName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newCategory, setNewCategory] = useState<BusinessCategory>('F&B / Kafe');
  const [newPlanId, setNewPlanId] = useState<string>('pro');

  // Plan Edit Modal State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editPriceMonthly, setEditPriceMonthly] = useState<number>(0);
  const [editPriceYearly, setEditPriceYearly] = useState<number>(0);

  // Marketing WhatsApp Template
  const [customUmkmPhone, setCustomUmkmPhone] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // SaaS Financial Metrics
  const saasMetrics = useMemo(() => {
    let mrr = 0;
    let activeCount = 0;
    let trialCount = 0;
    let expiredCount = 0;

    merchants.forEach(m => {
      const plan = plans.find(p => p.id === m.activePlanId) || plans[0];
      if (m.subscriptionStatus === 'ACTIVE') {
        activeCount++;
        mrr += plan.priceMonthly;
      } else if (m.subscriptionStatus === 'TRIAL') {
        trialCount++;
      } else {
        expiredCount++;
      }
    });

    const arr = mrr * 12;
    const totalRevenueHistorical = saasInvoices
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      mrr,
      arr,
      activeCount,
      trialCount,
      expiredCount,
      totalMerchants: merchants.length,
      totalRevenueHistorical
    };
  }, [merchants, plans, saasInvoices]);

  // Filtered merchants
  const filteredMerchants = merchants.filter(m => {
    const matchStatus = filterStatus === 'ALL' || m.subscriptionStatus === filterStatus;
    const q = searchMerchant.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.ownerName.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleCreateMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newOwnerName.trim()) return;

    // Trial expires in 14 days
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 14);

    const created = addMerchant({
      name: newStoreName,
      ownerName: newOwnerName,
      email: newEmail,
      phone: newPhone,
      businessType: newCategory,
      address: newAddress || 'Indonesia',
      activePlanId: newPlanId,
      subscriptionStatus: 'TRIAL',
      subscriptionExpiresAt: expDate.toISOString().split('T')[0],
      currentCashierName: newOwnerName,
      outletsCount: 1,
      currency: 'IDR',
      qrisMerchantName: newStoreName.toUpperCase(),
      nmid: 'ID10200' + Math.floor(10000000 + Math.random() * 90000000),
      taxRatePercent: 0,
      serviceRatePercent: 0
    });

    setIsAddMerchantOpen(false);
    alert(`Merchant "${newStoreName}" berhasil didaftarkan dengan akses Coba Gratis (Trial 14 Hari)!`);
  };

  const handleLoginAsMerchant = (merchantId: string) => {
    setActiveMerchantId(merchantId);
    setActiveView('merchant_pos');
  };

  const handleCopyMarketingLink = () => {
    navigator.clipboard.writeText(window.location.origin + '?mode=register');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendMarketingWA = (merchantPhone: string, merchantName: string = 'Juragan') => {
    const message = `Halo ${merchantName}! 👋\n\nApakah toko/warung Anda masih mencatat penjualan pakai nota manual dan sering bingung stok barang tiba-tiba habis?\n\nPerkenalkan *KasirPro UMKM*, aplikasi kasir POS modern serba bisa:\n✅ Kasir cepat anti antre\n✅ Manajemen stok real-time (otomatis berkurang saat kasir input)\n✅ Dashboard omset & laba bersih otomatis\n✅ Terima bayar QRIS & kirim struk belanja via WhatsApp\n\nCoba gratis sekarang 14 hari tanpa biaya: ${window.location.origin}\n\nMau konsultasi atau demo langsung? Balas pesan ini ya! Terima kasih 🙏`;
    
    const cleanPhone = merchantPhone.replace(/^0/, '62');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Super Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-amber-400/20 text-amber-300">
              <Crown className="w-5 h-5 text-amber-400" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Portal Super Admin & SaaS Owner
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Pusat Pemasaran & Monetisasi KasirPro
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Sebagai pemilik platform, Anda memiliki wewenang penuh untuk memasarkan aplikasi ini ke ribuan UMKM Indonesia, mengatur paket langganan berbayar, dan memantau pendapatan berulang (MRR).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView('marketing_landing')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Lihat Halaman Promosi Publik</span>
          </button>
          <button
            onClick={() => setIsAddMerchantOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Daftarkan UMKM Baru</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview' as const, label: 'Kinerja SaaS & Keuangan', icon: TrendingUp },
          { id: 'merchants' as const, label: `Daftar Merchant (${merchants.length})`, icon: Users },
          { id: 'plans' as const, label: 'Paket & Harga Langganan', icon: CreditCard },
          { id: 'marketing' as const, label: 'Alat Pemasaran & Penjualan', icon: Share2 },
          { id: 'invoices' as const, label: 'Riwayat Faktur Billing', icon: DollarSign },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & MRR */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* SaaS Core KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500">MRR (Monthly Recurring Revenue)</span>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                {formatRupiah(saasMetrics.mrr)}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                Estimasi per bulan dari langganan aktif
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500">Proyeksi ARR (Tahunan)</span>
              <div className="text-2xl font-extrabold text-indigo-900 tabular-nums mt-1">
                {formatRupiah(saasMetrics.arr)}
              </div>
              <span className="text-[11px] text-slate-500">
                Laju omset platform SaaS 12 bulan
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500">UMKM Berlangganan Aktif</span>
              <div className="text-2xl font-extrabold text-emerald-600 tabular-nums mt-1">
                {saasMetrics.activeCount} <span className="text-sm font-normal text-slate-500">toko</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {saasMetrics.trialCount} sedang masa trial
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="text-xs text-slate-500">Total Pembayaran Diterima</span>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">
                {formatRupiah(saasMetrics.totalRevenueHistorical)}
              </div>
              <span className="text-[11px] text-slate-500">
                Dari {saasInvoices.length} faktur berhasil
              </span>
            </div>

          </div>

          {/* Quick Action Matrix for Admin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Share2 className="w-4 h-4" />
                <span>Peluang Pemasaran UMKM</span>
              </div>
              <p className="text-xs text-slate-600">
                Saat ini terdapat <strong>{saasMetrics.trialCount} toko</strong> dalam masa uji coba (trial) dan <strong>{saasMetrics.expiredCount} toko</strong> yang paketnya telah habis.
              </p>
              <button
                onClick={() => setActiveTab('marketing')}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Kirim Promo WhatsApp ke Calon Pelanggan →
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CreditCard className="w-4 h-4" />
                <span>Paket Langganan Terlaris</span>
              </div>
              <p className="text-xs text-slate-600">
                Paket <strong>UMKM Pro (Rp 99.000/bln)</strong> menyumbang 78% dari total pendapatan platform Anda berkat fitur Analitik & QRIS Dinamis.
              </p>
              <button
                onClick={() => setActiveTab('plans')}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Kelola Harga & Fitur Paket →
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Demonstrasi Langsung ke Klien</span>
              </div>
              <p className="text-xs text-slate-600">
                Ingin presentasi fitur kasir ke calon pembeli? Masuk langsung ke akun demo untuk menunjukkan kecepatan transaksi kasir.
              </p>
              <button
                onClick={() => handleLoginAsMerchant('merch-kopi')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Buka Demo Mesin Kasir Sekarang →
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: MERCHANTS MANAGEMENT */}
      {activeTab === 'merchants' && (
        <div className="space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchMerchant}
                onChange={e => setSearchMerchant(e.target.value)}
                placeholder="Cari toko atau pemilik..."
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
              />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif Berlangganan</option>
                <option value="TRIAL">Trial 14 Hari</option>
                <option value="EXPIRED">Expired (Kedaluwarsa)</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddMerchantOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              + Daftarkan Toko
            </button>
          </div>

          {/* Merchants Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nama Toko UMKM</th>
                    <th className="py-3 px-4">Pemilik & Kontak</th>
                    <th className="py-3 px-4">Kategori Bisnis</th>
                    <th className="py-3 px-4">Paket</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Masa Berlaku</th>
                    <th className="py-3 px-4 text-right">Aksi Langganan & Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMerchants.map(m => {
                    const plan = plans.find(p => p.id === m.activePlanId) || plans[0];
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className="text-[10px] text-slate-500">{m.address}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{m.ownerName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{m.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {m.businessType}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {plan.name}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.subscriptionStatus === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.subscriptionStatus === 'TRIAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {m.subscriptionStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {formatDateShort(m.subscriptionExpiresAt)}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          {/* Quick Renew Button */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Perpanjang langganan ${m.name} untuk 1 bulan (Paket ${plan.name})?`)) {
                                renewMerchantSubscription(m.id, m.activePlanId, 'MONTHLY');
                                alert(`Langganan ${m.name} berhasil diperpanjang 1 bulan!`);
                              }
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            +1 Bulan
                          </button>

                          {/* Login as merchant */}
                          <button
                            onClick={() => handleLoginAsMerchant(m.id)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Masuk Toko
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SUBSCRIPTION PLANS & PRICING */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Konfigurasi Paket & Harga Langganan</h3>
              <p className="text-xs text-slate-500">
                Atur skema tarif bulanan dan tahunan untuk ditawarkan kepada calon merchant UMKM.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div 
                key={plan.id}
                className={`bg-white rounded-2xl p-6 border shadow-xs flex flex-col justify-between ${
                  plan.isPopular ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                      <p className="text-xs text-slate-500">{plan.targetAudience}</p>
                    </div>
                    {plan.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        plan.isPopular ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Pricing Box */}
                  <div className="py-4 border-y border-slate-100 my-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                        {formatRupiah(plan.priceMonthly)}
                      </span>
                      <span className="text-xs text-slate-500">/ bulan</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      atau <strong className="text-slate-800">{formatRupiah(plan.priceYearly)}</strong> / tahun (hemat 2 bulan)
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 text-xs text-slate-600">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setEditPriceMonthly(plan.priceMonthly);
                      setEditPriceYearly(plan.priceYearly);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah Harga Paket Ini</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MARKETING TOOLKIT & PLAYBOOK PEMASARAN */}
      {activeTab === 'marketing' && (
        <div className="space-y-6">
          
          {/* Quick WA Outreach Tool */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Alat Promosi WhatsApp Langsung ke Pemilik UMKM</h3>
                <p className="text-xs text-slate-500">
                  Kirim penawaran aplikasi kasir langsung ke nomor WhatsApp pemilik usaha dengan sekali klik.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                Konversi Tertinggi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Nomor WhatsApp Calon Klien UMKM
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={customUmkmPhone}
                    onChange={e => setCustomUmkmPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => {
                      if (!customUmkmPhone.trim()) {
                        alert('Masukkan nomor WhatsApp terlebih dahulu!');
                        return;
                      }
                      handleSendMarketingWA(customUmkmPhone);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Kirim Promo WA</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Tautan Pendaftaran Mandiri Merchant
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.origin + '?mode=register'}
                    className="flex-1 px-3 py-2 text-xs bg-slate-100 border border-slate-300 rounded-lg font-mono text-slate-600 select-all"
                  />
                  <button
                    onClick={handleCopyMarketingLink}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Strategi Utama Memasarkan Aplikasi ke UMKM */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              5 Strategi Ampuh Memasarkan Aplikasi Kasir ke UMKM (Playbook Penjualan)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Strategi 1: Kanvasing & Demo 5 Menit */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">1</span>
                  <span>Kanvasing Sentra Kuliner & Ruko (Metode Demo 5 Menit)</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Datangi Kafe & Warung saat Jam Sepi (Pukul 14.00 - 16.30)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jangan datang saat jam makan siang. Bawa tablet atau HP Anda, tunjukkan langsung kecepatan kasir dan struk WhatsApp dalam waktu 2 menit. Katakan: <em>"Pak/Bu, izin demo 3 menit aplikasi kasir yang bisa kirim nota ke WhatsApp dan otomatis hitung untung harian tanpa kalkulator manual."</em>
                </p>
                <div className="text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                  🎯 <strong>Kunci Sukses:</strong> Berikan penawaran <strong>Free Trial 14 Hari</strong> tanpa biaya apa pun. Bantu mereka memasukkan 5-10 menu pertama saat itu juga.
                </div>
              </div>

              {/* Strategi 2: Paket Bundling Hardware */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">2</span>
                  <span>Paket Bundling "Mesin Kasir Siap Pakai"</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Gabungkan Printer Thermal Bluetooth + Lisensi 1 Tahun
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Beli printer thermal 58mm di e-commerce seharga Rp 140.000 - Rp 180.000. Jual paket *Starter Kit Kasir* seharga <strong>Rp 499.000</strong> (sudah termasuk printer fisik + langganan aplikasi 1 tahun + 3 roll kertas).
                </p>
                <div className="text-[11px] bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-800">
                  💡 <strong>Psikologi UMKM:</strong> Pemilik toko merasa membeli "alat kasir nyata" yang bisa dipegang, bukan sekadar software abstrak.
                </div>
              </div>

              {/* Strategi 3: Pendampingan Onboarding Anti-Gaptek */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">3</span>
                  <span>Layanan "Anti-Gaptek": Bantu Input Produk Awal</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Hambatan Terbesar UMKM adalah Malas Mengetik Daftar Menu
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tawarkan bonus spesial: <em>"Bapak/Ibu cukup foto daftar menu atau nota kulakan, tim kami yang akan ketikkan semua produk dan harga ke sistem."</em> Begitu daftar produk siap, kasir mereka tinggal pakai tanpa rasa bingung.
                </p>
                <div className="text-[11px] bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
                  ✨ <strong>Tingkat Konversi:</strong> 85% pedagang yang dibantu input menu awal akan lanjut berlangganan berbayar setelah masa trial habis.
                </div>
              </div>

              {/* Strategi 4: Komunitas & Program Afiliasi */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[10px]">4</span>
                  <span>Kerjasama Paguyuban & Program "Ajak Teman Pedagang"</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Gunakan Kekuatan Komunitas Pedagang Lokal
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dekati ketua paguyuban pasar, asosiasi UMKM binaan dinas koperasi, atau komunitas barista lokal. Berikan program: <strong>Setiap merchant yang mengajak toko lain akan mendapatkan Gratis 1 Bulan Langganan</strong> atau komisi bagi hasil 20%.
                </p>
                <div className="text-[11px] bg-purple-50 p-2.5 rounded-lg border border-purple-200 text-purple-900">
                  🤝 <strong>Efek Viral:</strong> Rekomendasi sesama pemilik toko memiliki tingkat kepercayaan 5x lebih tinggi dibanding iklan biasa.
                </div>
              </div>

            </div>
          </div>

          {/* Template Skrip Percakapan / Pitching */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              3 Template Skrip Pesan WhatsApp Siap Pakai Sesuai Jenis Usaha
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Template Kafe / F&B */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-emerald-700 block">☕ Untuk Kafe & Warung Kopi:</span>
                <p className="text-slate-600 italic text-[11px]">
                  "Halo Kak [Nama Owner]! Sering kewalahan catat pesanan pas jam ramai malam minggu? Pakai KasirPro, barista bisa input pesanan 3 detik, dukung QRIS dinamis, dan pelanggan terima nota ke WhatsApp. Mau coba gratis 14 hari buat kafenya?"
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("Halo Kak! Sering kewalahan catat pesanan pas jam ramai malam minggu? Pakai KasirPro, barista bisa input pesanan 3 detik, dukung QRIS dinamis, dan pelanggan terima nota ke WhatsApp. Mau coba gratis 14 hari?");
                    alert('Skrip Kafe disalin ke clipboard!');
                  }}
                  className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold text-[11px] cursor-pointer"
                >
                  Salin Teks Skrip Ini
                </button>
              </div>

              {/* Template Toko Sembako / Ritel */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-amber-700 block">🏪 Untuk Toko Sembako & Minimarket:</span>
                <p className="text-slate-600 italic text-[11px]">
                  "Selamat siang Pak/Bu! Sering ada selisih stok beras/minyak atau uang kasir kurang pas tutup toko? Aplikasi kami otomatis kurangi stok saat kasir input dan ada rekap laci harian. Harganya cuma Rp 3.000 per hari. Boleh kami bantu pasangkan gratis dulu 14 hari?"
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("Selamat siang Pak/Bu! Sering ada selisih stok beras/minyak atau uang kasir kurang pas tutup toko? Aplikasi kami otomatis kurangi stok saat kasir input dan ada rekap laci harian. Harganya cuma Rp 3.000 per hari. Boleh kami bantu pasangkan gratis dulu 14 hari?");
                    alert('Skrip Toko Sembako disalin ke clipboard!');
                  }}
                  className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold text-[11px] cursor-pointer"
                >
                  Salin Teks Skrip Ini
                </button>
              </div>

              {/* Template Fashion & Butik */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-indigo-700 block">👗 Untuk Fashion / Butik:</span>
                <p className="text-slate-600 italic text-[11px]">
                  "Halo Sis! Mau toko butiknya terlihat lebih profesional dan modern? Pakai aplikasi kasir yang bisa scan barcode baju dan kirim struk berlogo toko via WhatsApp. Bisa pantau omset dari HP saat Anda tidak ada di toko. Coba free 14 hari yuk!"
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("Halo Sis! Mau toko butiknya terlihat lebih profesional dan modern? Pakai aplikasi kasir yang bisa scan barcode baju dan kirim struk berlogo toko via WhatsApp. Bisa pantau omset dari HP saat Anda tidak ada di toko. Coba free 14 hari yuk!");
                    alert('Skrip Butik disalin ke clipboard!');
                  }}
                  className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold text-[11px] cursor-pointer"
                >
                  Salin Teks Skrip Ini
                </button>
              </div>

            </div>
          </div>

          {/* Potensi Penghasilan SaaS Anda */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Simulasi Potensi Penghasilan Rutin Anda (MRR)</h3>
                <p className="text-xs text-slate-400">
                  Dengan asumsi langganan Paket UMKM Pro Rp 99.000 / bulan:
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                Passive Income Berulang
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block">25 Merchant</span>
                <strong className="text-emerald-400 text-base font-mono tabular-nums block mt-1">Rp 2.475.000</strong>
                <span className="text-[10px] text-slate-500">/ bulan</span>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block">50 Merchant</span>
                <strong className="text-emerald-400 text-base font-mono tabular-nums block mt-1">Rp 4.950.000</strong>
                <span className="text-[10px] text-slate-500">/ bulan</span>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block">100 Merchant</span>
                <strong className="text-emerald-400 text-lg font-mono tabular-nums block mt-1">Rp 9.900.000</strong>
                <span className="text-[10px] text-slate-500">/ bulan</span>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400 block">300 Merchant</span>
                <strong className="text-emerald-400 text-lg font-mono tabular-nums block mt-1">Rp 29.700.000</strong>
                <span className="text-[10px] text-slate-500">/ bulan</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: BILLING & INVOICES */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Faktur Tagihan Langganan SaaS</h3>
              <p className="text-xs text-slate-500">Catatan pembayaran langganan dari seluruh merchant UMKM</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-800">
              Total {saasInvoices.length} Faktur
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Faktur</th>
                  <th className="py-3 px-4">Nama Toko Merchant</th>
                  <th className="py-3 px-4">Paket Langganan</th>
                  <th className="py-3 px-4 text-center">Siklus</th>
                  <th className="py-3 px-4 text-right">Nominal Tagihan</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4">Tanggal Bayar</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {saasInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {inv.merchantName}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {inv.planName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {inv.billingCycle === 'MONTHLY' ? 'BULANAN' : 'TAHUNAN'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatRupiah(inv.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {inv.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {inv.date}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {inv.status === 'PAID' ? 'LUNAS' : 'MENUNGGU'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Merchant Modal */}
      {isAddMerchantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Daftarkan Toko UMKM Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Toko baru akan otomatis mendapatkan akses Trial 14 Hari untuk mencoba seluruh fitur kasir.
            </p>

            <form onSubmit={handleCreateMerchant} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Toko / Usaha</label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={e => setNewStoreName(e.target.value)}
                  placeholder="Contoh: Kopi Titik Temu / Toko Sumber Rezeki"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Pemilik</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={e => setNewOwnerName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="0812..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori Usaha</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as BusinessCategory)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="F&B / Kafe">F&B / Kafe / Warung</option>
                    <option value="Retail & Minimarket">Retail & Sembako</option>
                    <option value="Fashion & Butik">Fashion & Butik</option>
                    <option value="Jasa & Servis">Jasa & Servis</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pilihan Paket Langganan</label>
                  <select
                    value={newPlanId}
                    onChange={e => setNewPlanId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatRupiah(p.priceMonthly)}/bln)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alamat Toko</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  placeholder="Contoh: Jl. Diponegoro No. 10, Jakarta"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMerchantOpen(false)}
                  className="flex-1 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Daftarkan & Berikan Trial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Pricing Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Ubah Harga Paket {editingPlan.name}</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Harga Bulanan (Rp)</label>
                <input
                  type="number"
                  value={editPriceMonthly}
                  onChange={e => setEditPriceMonthly(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Harga Tahunan (Rp)</label>
                <input
                  type="number"
                  value={editPriceYearly}
                  onChange={e => setEditPriceYearly(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingPlan(null)}
                className="flex-1 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  updatePlan(editingPlan.id, {
                    priceMonthly: editPriceMonthly,
                    priceYearly: editPriceYearly
                  });
                  setEditingPlan(null);
                  alert('Harga paket langganan berhasil diperbarui!');
                }}
                className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Simpan Harga
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
