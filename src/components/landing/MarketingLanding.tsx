import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { 
  Check, 
  ArrowRight, 
  ShoppingBag, 
  BarChart3, 
  Package, 
  QrCode, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  Store, 
  Clock, 
  TrendingUp, 
  Calculator,
  Star,
  Users
} from 'lucide-react';
import { BusinessCategory } from '../../types';

export const MarketingLanding: React.FC = () => {
  const { plans, addMerchant, setActiveMerchantId, setActiveView } = useApp();
  
  // Billing cycle toggle
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  
  // ROI Calculator
  const [dailyTrxCount, setDailyTrxCount] = useState<number>(45);

  // Registration Form
  const [storeName, setStoreName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [category, setCategory] = useState<BusinessCategory>('F&B / Kafe');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('pro');

  // ROI estimation calculations
  const hoursSavedPerMonth = Math.round((dailyTrxCount * 1.5 * 30) / 60);
  const potentialLeakagePrevented = Math.round(dailyTrxCount * 1200 * 30);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !ownerName.trim()) return;

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 14);

    const newMerchant = addMerchant({
      name: storeName,
      ownerName,
      email: `${ownerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone,
      businessType: category,
      address: 'Indonesia',
      activePlanId: selectedPlanId,
      subscriptionStatus: 'TRIAL',
      subscriptionExpiresAt: expDate.toISOString().split('T')[0],
      currentCashierName: ownerName,
      outletsCount: 1,
      currency: 'IDR',
      qrisMerchantName: storeName.toUpperCase(),
      nmid: 'ID10200' + Math.floor(10000000 + Math.random() * 90000000),
      taxRatePercent: 0,
      serviceRatePercent: 0
    });

    setActiveMerchantId(newMerchant.id);
    setActiveView('merchant_pos');
    alert(`Selamat! Toko "${storeName}" berhasil didaftarkan. Anda langsung masuk ke Mesin Kasir POS.`);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Kasir & Inventori Pilihan 1.200+ UMKM Indonesia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Kasir Cepat, Stok Real-Time & Laporan Laba Otomatis
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Tinggalkan pencatatan nota kertas yang rawan hilang dan selisih. Tingkatkan omset usaha Anda dengan sistem kasir POS pintar berbasis cloud yang mudah dipakai siapa saja.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#daftar"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Coba Gratis 14 Hari</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setActiveView('merchant_pos')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Buka Live Demo Kasir</span>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Tanpa Kontrak Mengikat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Siap Pakai dalam 2 Menit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Bisa Cetak Printer Thermal</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Kalkulator Penghematan Usaha Anda
              </h3>
              <p className="text-xs text-slate-500">
                Lihat seberapa banyak waktu dan uang yang bisa Anda selamatkan setiap bulan dengan KasirPro.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Slider Column */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700">
                  Rata-rata Transaksi Toko per Hari:
                </label>
                <span className="text-lg font-extrabold text-emerald-600 font-mono tabular-nums">
                  {dailyTrxCount} transaksi / hari
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={dailyTrxCount}
                onChange={e => setDailyTrxCount(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>10 transaksi</span>
                <span>100 transaksi</span>
                <span>250+ transaksi</span>
              </div>
            </div>

            {/* Metric Results */}
            <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-600">Waktu Rekap Terhemat:</span>
                <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                  ± {hoursSavedPerMonth} Jam / Bulan
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-600">Kebocoran Stok Dicegah:</span>
                <span className="text-base font-extrabold text-emerald-600 font-mono tabular-nums">
                  ± {formatRupiah(potentialLeakagePrevented)} / bln
                </span>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200">
                Berdasarkan rata-rata efisiensi inventori toko ritel & kafe setelah digitalisasi.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Didesain Khusus untuk Kebutuhan Riil UMKM
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Fitur lengkap tanpa menu rumit, langsung siap dipakai oleh kasir dalam hitungan menit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Kasir Cepat & Barcode Scan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Input pesanan kilat dengan pencarian SKU, scan barcode, opsi varian, catatan pesanan khusus, dan hitungan uang kembalian instan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Stok Real-Time & Peringatan Habis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stok langsung terpotong begitu transaksi kasir selesai. Dapatkan notifikasi otomatis saat stok mendekati batas minimum sebelum kehabisan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Analitik Laba Bersih & Jam Sibuk</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lihat keuntungan kotor harian berdasarkan harga modal HPP, produk terlaris, dan jam paling ramai pembeli untuk atur shift staf.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">QRIS Dinamis & Multi-Payment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mendukung QRIS nasional resmi, kartu debit EDC, transfer bank langsung, hingga pencatatan kasbon pelanggan terpercaya.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Struk Digital Kirim ke WhatsApp</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hemat biaya kertas roll dengan mengirimkan struk nota belanja rapi langsung ke nomor WhatsApp pembeli dalam sekali klik.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Buka / Tutup Kasir & Rekap Shift</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Catat modal uang laci awal dan rekap kas fisik saat pergantian kasir. Cegah kecurangan dan selisih uang kasir seketika.
            </p>
          </div>

        </div>
      </section>

      {/* Pricing Comparison Section */}
      <section className="py-16 px-4 sm:px-6 bg-slate-100/80 border-y border-slate-200">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Pilihan Paket Langganan Terjangkau
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Mulai dari Rp 1.600 per hari. Pilih paket sesuai skala usaha Anda dan upgrade kapan saja.
            </p>

            {/* Monthly / Yearly Switcher */}
            <div className="inline-flex items-center gap-1 p-1 bg-slate-200 rounded-xl mt-4 text-xs font-semibold">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  billingCycle === 'MONTHLY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Bayar Bulanan
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'YEARLY' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                <span>Bayar Tahunan</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                  Hemat 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => {
              const price = billingCycle === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly;
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-sm flex flex-col justify-between ${
                    plan.isPopular ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
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

                    <div className="py-4 border-y border-slate-100 my-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                          {formatRupiah(price)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {billingCycle === 'MONTHLY' ? '/ bln' : '/ thn'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {plan.description}
                      </p>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-700">
                      {plan.features.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <a
                      href="#daftar"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        plan.isPopular
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>Pilih Paket {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Registration Form Anchor */}
      <section id="daftar" className="py-20 px-4 sm:px-6 max-w-xl mx-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Pendaftaran Langsung
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Mulai Uji Coba Gratis 14 Hari
            </h2>
            <p className="text-xs text-slate-500">
              Tanpa kartu kredit. Langsung coba mesin kasir dan kelola stok toko Anda sekarang.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Toko / Usaha</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="Contoh: Kedai Kopi Senja / Toko Berkah"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Anda (Pemilik)</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bidang Usaha</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as BusinessCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="F&B / Kafe">F&B / Kafe / Warung</option>
                  <option value="Retail & Minimarket">Retail & Sembako</option>
                  <option value="Fashion & Butik">Fashion & Butik</option>
                  <option value="Jasa & Servis">Jasa & Servis</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Paket yang Diminati</label>
                <select
                  value={selectedPlanId}
                  onChange={e => setSelectedPlanId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({formatRupiah(p.priceMonthly)}/bln)</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-xl shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>Daftar & Langsung Masuk ke Kasir POS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <p>© 2026 KasirPro UMKM · Solusi POS Kasir & Inventori SaaS Indonesia</p>
      </footer>

    </div>
  );
};
