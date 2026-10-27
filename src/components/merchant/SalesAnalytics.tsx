import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatNumber, formatDateShort } from '../../utils/formatters';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  PieChart as PieIcon, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  Percent,
  Clock,
  Award
} from 'lucide-react';

export const SalesAnalytics: React.FC = () => {
  const { currentMerchantTransactions, currentMerchantProducts, activeMerchant } = useApp();
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('7days');

  // Filter transactions based on time range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return currentMerchantTransactions.filter(trx => {
      const trxDate = new Date(trx.createdAt);
      if (timeRange === 'today') {
        return trxDate.toDateString() === now.toDateString();
      } else if (timeRange === '7days') {
        const diffDays = (now.getTime() - trxDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      } else {
        const diffDays = (now.getTime() - trxDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
    });
  }, [currentMerchantTransactions, timeRange]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalDiscount = 0;
    const paymentMethods: Record<string, number> = {
      CASH: 0,
      QRIS: 0,
      DEBIT: 0,
      TRANSFER: 0,
      DEBT: 0
    };
    const productSalesMap: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};
    const hourlySales: number[] = new Array(24).fill(0);

    filteredTransactions.forEach(trx => {
      totalRevenue += trx.total;
      totalDiscount += trx.discountTotal;
      paymentMethods[trx.paymentMethod] = (paymentMethods[trx.paymentMethod] || 0) + trx.total;

      // Hourly distribution
      const hour = new Date(trx.createdAt).getHours();
      hourlySales[hour] += trx.total;

      // Item level costs & profits
      trx.items.forEach(item => {
        const itemCost = (item.costPrice || 0) * item.quantity;
        totalCost += itemCost;

        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.name,
            qty: 0,
            revenue: 0,
            profit: 0
          };
        }
        productSalesMap[item.productId].qty += item.quantity;
        productSalesMap[item.productId].revenue += item.subtotal;
        productSalesMap[item.productId].profit += (item.subtotal - itemCost);
      });
    });

    const grossProfit = Math.max(0, totalRevenue - totalCost);
    const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';
    const aov = filteredTransactions.length > 0 ? Math.round(totalRevenue / filteredTransactions.length) : 0;

    // Sort top products
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      grossProfit,
      totalCost,
      totalDiscount,
      profitMargin,
      aov,
      transactionCount: filteredTransactions.length,
      paymentMethods,
      hourlySales,
      topProducts
    };
  }, [filteredTransactions]);

  // Generate 7-day revenue chart data
  const chartData = useMemo(() => {
    const days: { label: string; dateStr: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      
      const dayTotal = currentMerchantTransactions
        .filter(t => t.createdAt.startsWith(dateStr))
        .reduce((sum, t) => sum + t.total, 0);

      days.push({ label, dateStr, amount: dayTotal });
    }
    return days;
  }, [currentMerchantTransactions]);

  const maxChartAmount = Math.max(...chartData.map(d => d.amount), 100000);

  // Export transactions to CSV
  const handleExportCSV = () => {
    let csv = 'No Nota,Tanggal & Waktu,Kasir,Pelanggan,Metode Bayar,Total Item,Subtotal,Diskon,Pajak,Total Akhir\n';
    filteredTransactions.forEach(t => {
      csv += `"${t.invoiceNumber}","${t.createdAt}","${t.cashierName}","${t.customerName || '-'}","${t.paymentMethod}",${t.items.length},${t.subtotal},${t.discountTotal},${t.tax},${t.total}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan-Penjualan-${activeMerchant?.name.replace(/\s+/g, '_')}-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Title, Filter, and Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard Analitik Penjualan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau pertumbuhan omset, keuntungan kotor HPP, dan tren jam sibuk toko secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl text-xs">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                timeRange === 'today'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                timeRange === '7days'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                timeRange === '30days'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Hari
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Omset Penjualan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
            {formatRupiah(metrics.totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Real-time dari {metrics.transactionCount} transaksi</span>
          </div>
        </div>

        {/* Laba Kotor (Gross Profit) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Estimasi Laba Kotor</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-indigo-900 tabular-nums">
            {formatRupiah(metrics.grossProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            HPP Modal: <span className="tabular-nums font-medium">{formatRupiah(metrics.totalCost)}</span>
          </div>
        </div>

        {/* Margin Laba % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Margin Keuntungan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-900 tabular-nums">
            {metrics.profitMargin}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Rata-rata Margin Produk UMKM
          </div>
        </div>

        {/* Rata-rata Keranjang (AOV) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Rata-rata Nota (AOV)</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
            {formatRupiah(metrics.aov)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Nilai belanja per struk kasir
          </div>
        </div>

      </div>

      {/* Main Charts Split: 7-Day Revenue Trend & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 7-Day Revenue Trend Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tren Penjualan 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-500">Omset harian yang tercatat di sistem kasir</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Performa Toko
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {chartData.map((d, i) => {
              const heightPercent = Math.round((d.amount / maxChartAmount) * 100);
              const isToday = i === chartData.length - 1;

              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-bold bg-slate-900 text-white px-2 py-1 rounded shadow-md whitespace-nowrap mb-1 tabular-nums pointer-events-none">
                    {formatRupiah(d.amount)}
                  </div>

                  {/* The bar */}
                  <div className="w-full max-w-[44px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      style={{ height: `${Math.max(8, heightPercent)}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span className={`text-[11px] font-medium ${isToday ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Metode Pembayaran</h3>
            <p className="text-xs text-slate-500 mb-4">Komposisi penerimaan uang kasir</p>

            <div className="space-y-3">
              {[
                { key: 'CASH', label: 'Tunai (Cash)', color: 'bg-emerald-500' },
                { key: 'QRIS', label: 'QRIS Dinamis', color: 'bg-teal-500' },
                { key: 'TRANSFER', label: 'Transfer Bank', color: 'bg-indigo-500' },
                { key: 'DEBIT', label: 'Debit EDC', color: 'bg-amber-500' },
                { key: 'DEBT', label: 'Kasbon / Hutang', color: 'bg-rose-500' }
              ].map(item => {
                const amount = metrics.paymentMethods[item.key] || 0;
                const percent = metrics.totalRevenue > 0 
                  ? Math.round((amount / metrics.totalRevenue) * 100) 
                  : 0;

                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium">{item.label}</span>
                      <span className="tabular-nums font-semibold text-slate-900">
                        {formatRupiah(amount)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`${item.color} h-full rounded-full transition-all`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 mt-4">
            💡 <strong>Tips UMKM:</strong> Pembayaran non-tunai (QRIS & Transfer) membantu mengurangi risiko selisih uang kembalian di laci kasir hingga 90%.
          </div>
        </div>

      </div>

      {/* Secondary Row: Top Selling Products & Peak Hours Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Best Selling Products */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">5 Produk Paling Laris</h3>
              <p className="text-xs text-slate-500">Berdasarkan total volume penjualan dan kontribusi omset</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          {metrics.topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada data penjualan pada periode ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-2.5">Produk</th>
                    <th className="pb-2.5 text-center">Terjual</th>
                    <th className="pb-2.5 text-right">Total Omset</th>
                    <th className="pb-2.5 text-right">Keuntungan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 font-medium text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{p.name}</span>
                      </td>
                      <td className="py-2.5 text-center font-mono tabular-nums font-semibold text-slate-800">
                        {p.qty}x
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-900 font-semibold">
                        {formatRupiah(p.revenue)}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-emerald-600 font-bold">
                        +{formatRupiah(p.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Peak Hours Heatstrip */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jam Sibuk Toko (Peak Hours)</h3>
              <p className="text-xs text-slate-500">Waktu pelanggan paling ramai bertransaksi</p>
            </div>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-2">
            {[
              { label: '08:00 - 11:00 (Pagi)', range: [8, 9, 10] },
              { label: '11:00 - 14:00 (Makan Siang / Peak 1)', range: [11, 12, 13] },
              { label: '14:00 - 17:00 (Sore)', range: [14, 15, 16] },
              { label: '17:00 - 21:00 (Malam / Peak 2)', range: [17, 18, 19, 20] },
            ].map((slot, sIdx) => {
              const slotTotal = slot.range.reduce((sum, h) => sum + (metrics.hourlySales[h] || 0), 0);
              const percent = metrics.totalRevenue > 0
                ? Math.round((slotTotal / metrics.totalRevenue) * 100)
                : 0;

              return (
                <div key={sIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">{slot.label}</span>
                    <span className="tabular-nums font-bold text-slate-900">
                      {formatRupiah(slotTotal)} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-indigo-600 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
