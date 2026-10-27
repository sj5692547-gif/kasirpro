import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { Plus, Edit2, Trash2, Search, Barcode, Package, AlertCircle } from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const { currentMerchantProducts, addProduct, updateProduct, deleteProduct, activeMerchant } = useApp();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [category, setCategory] = useState<string>('Makanan & Minuman');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [unit, setUnit] = useState<string>('pcs');

  const categories = Array.from(new Set(currentMerchantProducts.map(p => p.category)));

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    const randomSku = 'PRD-' + Math.floor(100 + Math.random() * 900);
    setSku(randomSku);
    setBarcode('899' + Math.floor(1000000 + Math.random() * 9000000));
    setCategory(categories[0] || 'Umum');
    setCostPrice(10000);
    setSellingPrice(15000);
    setStock(20);
    setMinStockAlert(5);
    setUnit('pcs');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setBarcode(prod.barcode);
    setCategory(prod.category);
    setCostPrice(prod.costPrice);
    setSellingPrice(prod.sellingPrice);
    setStock(prod.stock);
    setMinStockAlert(prod.minStockAlert);
    setUnit(prod.unit);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        sku,
        barcode,
        category,
        costPrice,
        sellingPrice,
        stock,
        minStockAlert,
        unit
      });
    } else {
      addProduct({
        name,
        sku,
        barcode,
        category,
        costPrice,
        sellingPrice,
        stock,
        minStockAlert,
        unit,
        isActive: true
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus produk "${name}"?`)) {
      deleteProduct(id);
    }
  };

  const filteredProducts = currentMerchantProducts.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Katalog Produk & Harga</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola daftar barang dagangan, harga modal (HPP), harga jual, dan barcode toko.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Produk Baru</span>
        </button>
      </div>

      {/* Product List Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama, SKU, atau barcode..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Modal (HPP)</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">Estimasi Laba</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const profit = p.sellingPrice - p.costPrice;
                const marginPercent = p.sellingPrice > 0 ? Math.round((profit / p.sellingPrice) * 100) : 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SKU: {p.sku} · Barcode: {p.barcode}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      {formatRupiah(p.costPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatRupiah(p.sellingPrice)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 font-medium">
                      +{formatRupiah(profit)} <span className="text-[10px] text-slate-400 font-sans">({marginPercent}%)</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        p.stock <= p.minStockAlert ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Lengkapi data produk untuk memudahkan kasir mencari dan mencatat stok barang.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Produk</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Kopi Susu Aren 250ml"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Minuman / Makanan / Sembako"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="pcs / cup / porsi / kg"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="PRD-001"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barcode (EAN/UPC)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    placeholder="89912345678"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Harga Pokok / Modal (HPP)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={e => setCostPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Harga Jual Kasir</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-emerald-700 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {editingProduct ? 'Stok Saat Ini' : 'Stok Awal'}
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={e => setStock(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Peringatan Stok Minimum</label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={e => setMinStockAlert(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Perbarui Produk' : 'Simpan Produk Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
