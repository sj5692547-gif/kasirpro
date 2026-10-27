import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, StockMovementType } from '../../types';
import { formatRupiah, formatNumber, formatDateTime } from '../../utils/formatters';
import { 
  Package, 
  AlertTriangle, 
  PlusCircle, 
  SlidersHorizontal, 
  History, 
  ArrowDownRight, 
  ArrowUpRight, 
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';

export const StockManagement: React.FC = () => {
  const { 
    currentMerchantProducts, 
    currentMerchantStockMovements, 
    adjustStock, 
    activeMerchant 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Restock Modal state
  const [isRestockOpen, setIsRestockOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<StockMovementType>('IN');
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  // Low stock products
  const lowStockProducts = currentMerchantProducts.filter(p => p.stock > 0 && p.stock <= p.minStockAlert);
  const outOfStockProducts = currentMerchantProducts.filter(p => p.stock <= 0);

  // Filtered inventory list
  const filteredProducts = currentMerchantProducts.filter(p => {
    if (stockFilter === 'low') {
      if (p.stock > p.minStockAlert || p.stock <= 0) return false;
    } else if (stockFilter === 'out') {
      if (p.stock > 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenRestock = (product: Product, type: StockMovementType = 'IN') => {
    setSelectedProductId(product.id);
    setAdjustType(type);
    setAdjustQty(type === 'IN' ? 20 : -1);
    setAdjustNotes(type === 'IN' ? 'Kulakan Restok Supplier' : 'Penyesuaian Fisik / Rusak');
    setIsRestockOpen(true);
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const delta = adjustType === 'OUT' || adjustType === 'ADJUST'
      ? -Math.abs(adjustQty)
      : Math.abs(adjustQty);

    adjustStock(selectedProductId, delta, adjustType, adjustNotes);
    setIsRestockOpen(false);
    alert('Stok barang berhasil diperbarui secara real-time!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Stok Real-Time
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap penjualan kasir otomatis memotong stok barang. Pantau sisa stok dan riwayat kartu mutasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Stok Produk
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'movements'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kartu Mutasi Stok ({currentMerchantStockMovements.length})
            </button>
          </div>
        </div>
      </div>

      {/* Critical Low Stock Alert Card */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                Peringatan Stok Barang Menipis ({lowStockProducts.length + outOfStockProducts.length} Produk)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Ada {outOfStockProducts.length} produk habis dan {lowStockProducts.length} produk berada di bawah batas minimum. Segera lakukan restok agar penjualan kasir tidak terganggu.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setStockFilter('low');
              setActiveTab('inventory');
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            Lihat Produk Menipis
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'inventory' ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari SKU atau nama barang..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  stockFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Semua ({currentMerchantProducts.length})
              </button>
              <button
                onClick={() => setStockFilter('low')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  stockFilter === 'low'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Menipis ({lowStockProducts.length})
              </button>
              <button
                onClick={() => setStockFilter('out')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  stockFilter === 'out'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Habis ({outOfStockProducts.length})
              </button>
            </div>

          </div>

          {/* Stock Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Produk & SKU</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">Harga Modal (HPP)</th>
                  <th className="py-3 px-4 text-right">Harga Jual</th>
                  <th className="py-3 px-4 text-center">Stok Saat Ini</th>
                  <th className="py-3 px-4 text-center">Batas Min</th>
                  <th className="py-3 px-4 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada produk dalam kategori stok ini.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(prod => {
                    const isOut = prod.stock <= 0;
                    const isLow = prod.stock > 0 && prod.stock <= prod.minStockAlert;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{prod.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            SKU: {prod.sku} · Barcode: {prod.barcode}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {prod.category}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                          {formatRupiah(prod.costPrice)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                          {formatRupiah(prod.sellingPrice)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-xs tabular-nums ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {prod.stock} {prod.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-500">
                          {prod.minStockAlert} {prod.unit}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenRestock(prod, 'IN')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Restok</span>
                            </button>
                            <button
                              onClick={() => handleOpenRestock(prod, 'ADJUST')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer text-[11px]"
                            >
                              Opname
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        /* Stock Movement Ledger Table */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Buku Mutasi Stok (Stock Movement Ledger)</h3>
              <p className="text-xs text-slate-500">Catatan otomatis setiap kali stok berubah</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              Total {currentMerchantStockMovements.length} Catatan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4 text-center">Jenis Mutasi</th>
                  <th className="py-3 px-4 text-center">Perubahan Qty</th>
                  <th className="py-3 px-4 text-center">Stok (Sebelum ➔ Sesudah)</th>
                  <th className="py-3 px-4">Keterangan / No. Ref</th>
                  <th className="py-3 px-4">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {currentMerchantStockMovements.map(mov => {
                  const isPositive = mov.quantity > 0;
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-sans text-slate-600">
                        {formatDateTime(mov.date)}
                      </td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                        {mov.productName}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          mov.type === 'IN' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : mov.type === 'SALE'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {mov.type === 'IN' ? 'KULAKAN' : mov.type === 'SALE' ? 'PENJUALAN' : 'OPNAME'}
                        </span>
                      </td>
                      <td className={`py-2.5 px-4 text-center font-bold ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isPositive ? `+${mov.quantity}` : mov.quantity}
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-600">
                        {mov.previousStock} ➔ <strong className="text-slate-900">{mov.newStock}</strong>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-600">
                        <div>{mov.notes}</div>
                        {mov.referenceNumber && (
                          <span className="text-[10px] text-slate-400 font-mono">{mov.referenceNumber}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-600">
                        {mov.by}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restock & Adjustment Modal */}
      {isRestockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {adjustType === 'IN' ? 'Tambah Stok Masuk (Kulakan)' : 'Penyesuaian Stok (Stock Opname)'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pembaruan stok akan langsung tercatat dan sinkron ke mesin kasir secara instan.
            </p>

            <form onSubmit={handleSubmitAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Produk</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                >
                  <option value="">-- Pilih Barang --</option>
                  {currentMerchantProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok Saat Ini: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {adjustType === 'IN' ? 'Jumlah Masuk' : 'Jumlah Perubahan'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adjustQty}
                    onChange={e => setAdjustQty(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Mutasi</label>
                  <select
                    value={adjustType}
                    onChange={e => setAdjustType(e.target.value as StockMovementType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="IN">Barang Masuk / Kulakan (+)</option>
                    <option value="ADJUST">Penyesuaian Opname (-)</option>
                    <option value="OUT">Barang Rusak / Kadaluarsa (-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Keterangan / Catatan Supplier
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  placeholder="Misal: Faktur Kulakan No. 8920 / Suplier Berkah"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockOpen(false)}
                  className="flex-1 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Simpan Perubahan Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
