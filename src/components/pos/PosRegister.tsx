import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Transaction } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  AlertCircle, 
  User, 
  Clock, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Package
} from 'lucide-react';

export const PosRegister: React.FC = () => {
  const { 
    activeMerchant, 
    currentMerchantProducts, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    cartSubtotal,
    cartItemCount,
    currentShift,
    openShift,
    closeShift
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  
  // Note editing state
  const [activeNoteProductId, setActiveNoteProductId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  // Shift Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [shiftStartingCash, setShiftStartingCash] = useState<number>(200000);
  const [shiftActualCash, setShiftActualCash] = useState<number>(0);
  const [shiftSummary, setShiftSummary] = useState<any>(null);

  // Audio beep for barcode scan feedback
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 1400;
        gain.gain.value = 0.08;
        osc.start();
        setTimeout(() => {
          osc.stop();
          audioCtx.close();
        }, 70);
      }
    } catch {}
  };

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    currentMerchantProducts.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['SEMUA', ...Array.from(set)];
  }, [currentMerchantProducts]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return currentMerchantProducts.filter(p => {
      if (!p.isActive) return false;
      const matchCat = selectedCategory === 'SEMUA' || p.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery = !query || 
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.barcode.includes(query);
      return matchCat && matchQuery;
    });
  }, [currentMerchantProducts, selectedCategory, searchQuery]);

  // Barcode quick scan submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = currentMerchantProducts.find(
      p => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.toLowerCase().trim()
    );

    if (found) {
      if (found.stock <= 0) {
        alert(`Stok produk "${found.name}" habis!`);
      } else {
        addToCart(found, 1);
        playBeep();
        setBarcodeInput('');
      }
    } else {
      alert(`Barcode "${barcodeInput}" tidak ditemukan dalam daftar produk toko.`);
    }
  };

  const handleOpenNoteModal = (productId: string, currentNote?: string) => {
    setActiveNoteProductId(productId);
    setTempNote(currentNote || '');
  };

  const handleSaveNote = () => {
    if (!activeNoteProductId) return;
    const item = cart.find(c => c.product.id === activeNoteProductId);
    if (item) {
      addToCart(item.product, 0, tempNote);
    }
    setActiveNoteProductId(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 flex flex-col">
      
      {/* Kasir Shift Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kasir: <strong className="text-slate-900">{activeMerchant?.currentCashierName || 'Kasir Utama'}</strong></span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Shift: {currentShift ? 'Aktif' : 'Belum Dibuka'}</span>
            {currentShift && (
              <span className="text-slate-500 font-mono">
                (Kas Awal: {formatRupiah(currentShift.startingCash)})
              </span>
            )}
          </div>
        </div>

        <div>
          {currentShift ? (
            <button
              onClick={() => {
                setShiftActualCash(currentShift.expectedCash);
                setIsShiftModalOpen(true);
              }}
              className="text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup Kasir / Serah Terima Shift
            </button>
          ) : (
            <button
              onClick={() => setIsShiftModalOpen(true)}
              className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              + Buka Kasir Baru
            </button>
          )}
        </div>
      </div>

      {/* Main Cashier Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* Left Column: Product Catalog & Search (Col 7 or 8 on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-6.5rem)]">
          
          {/* Top Search & Barcode Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari produk (Nama, SKU, atau Barcode)..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Barcode Scanner Simulator Form */}
            <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-1.5 w-full sm:w-auto">
              <div className="relative">
                <Barcode className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  placeholder="Scan Barcode (Enter)"
                  className="w-44 pl-8 pr-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                title="Tekan Enter untuk scan"
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Category Filter Pills (Functional Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-auto">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">Tidak ada produk ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
                const inCartItem = cart.find(ci => ci.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      if (!isOutOfStock) {
                        addToCart(product, 1);
                        playBeep();
                      }
                    }}
                    className={`bg-white rounded-2xl p-3.5 border transition-all flex flex-col justify-between text-left group select-none relative ${
                      isOutOfStock
                        ? 'opacity-60 border-slate-200 bg-slate-50 cursor-not-allowed'
                        : 'border-slate-200/90 hover:border-emerald-500 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    {/* Badge if in cart */}
                    {inCartItem && (
                      <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                        {inCartItem.quantity}
                      </div>
                    )}

                    <div>
                      {/* Quiet Category & Stock indicator */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span className="truncate max-w-[90px]">{product.category}</span>
                        <span>·</span>
                        {isOutOfStock ? (
                          <span className="font-semibold text-rose-600">Habis</span>
                        ) : isLowStock ? (
                          <span className="font-semibold text-amber-600">Sisa {product.stock}</span>
                        ) : (
                          <span className="text-slate-500">Stok {product.stock}</span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {product.sku}
                      </p>
                    </div>

                    {/* Price and Add button */}
                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        {formatRupiah(product.sellingPrice)}
                      </span>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isOutOfStock 
                          ? 'bg-slate-200 text-slate-400' 
                          : 'bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white'
                      }`}>
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: Order Register Cart (Col 5 or 4 on desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border-l border-slate-200 flex flex-col justify-between max-h-[calc(100vh-6.5rem)] shadow-lg">
          
          {/* Cart Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Pesanan Pelanggan</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {cartItemCount} item dalam keranjang
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-xs font-semibold text-slate-600">Keranjang Masih Kosong</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  Klik produk di sebelah kiri atau scan barcode untuk menambahkan barang.
                </p>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.product.id}
                  className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h5 className="text-xs font-semibold text-slate-900 leading-tight">
                        {item.product.name}
                      </h5>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        @ {formatRupiah(item.product.sellingPrice)}
                      </span>
                      {item.note && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block border border-amber-200">
                          Catatan: {item.note}
                        </p>
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-900 tabular-nums shrink-0">
                      {formatRupiah(item.product.sellingPrice * item.quantity)}
                    </span>
                  </div>

                  {/* Quantity & Actions Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleOpenNoteModal(item.product.id, item.note)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{item.note ? 'Edit Catatan' : '+ Catatan'}</span>
                    </button>

                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold font-mono tabular-nums text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.quantity >= item.product.stock) {
                            alert(`Maksimal stok tersedia hanya ${item.product.stock}`);
                            return;
                          }
                          updateCartQuantity(item.product.id, item.quantity + 1);
                        }}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Bottom Summary & Checkout Button */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cartItemCount} item)</span>
                <span className="tabular-nums font-semibold text-slate-800">
                  {formatRupiah(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Pajak & Diskon</span>
                <span>Diatur saat bayar</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700">TOTAL BELANJA</span>
                <span className="text-xl font-extrabold text-emerald-700 tabular-nums">
                  {formatRupiah(cartSubtotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                cart.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-[0.99]'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Bayar Sekarang (F4)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Note Editing Modal */}
      {activeNoteProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Catatan Khusus Produk</h4>
            <p className="text-xs text-slate-500">
              Tambahkan catatan pesanan pembeli (misal: "Es sedikit", "Pedas sedang", dsb).
            </p>
            <input
              type="text"
              value={tempNote}
              onChange={e => setTempNote(e.target.value)}
              placeholder="Tulis catatan..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveNoteProductId(null)}
                className="flex-1 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Management Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {currentShift ? 'Tutup Kasir & Rekap Shift' : 'Buka Kasir Baru'}
            </h3>
            
            {currentShift ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Kasir Bertugas:</span>
                    <span className="font-semibold text-slate-900">{currentShift.cashierName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Modal Kas Awal:</span>
                    <span className="tabular-nums font-semibold">{formatRupiah(currentShift.startingCash)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Kas Seharusnya (Sistem):</span>
                    <span className="tabular-nums font-bold text-slate-900">{formatRupiah(currentShift.expectedCash)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Hitung Kas Fisik Aktual di Laci (Rp)
                  </label>
                  <input
                    type="number"
                    value={shiftActualCash || ''}
                    onChange={e => setShiftActualCash(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Masukkan jumlah uang fisik di laci kasir"
                  />
                </div>

                {shiftActualCash > 0 && (
                  <div className="p-3 rounded-lg border flex items-center justify-between text-xs font-medium">
                    <span>Selisih Kas:</span>
                    <span className={`tabular-nums font-bold ${
                      shiftActualCash - currentShift.expectedCash === 0
                        ? 'text-emerald-600'
                        : shiftActualCash - currentShift.expectedCash > 0
                        ? 'text-sky-600'
                        : 'text-rose-600'
                    }`}>
                      {shiftActualCash - currentShift.expectedCash === 0
                        ? 'Pas (Tidak Ada Selisih)'
                        : (shiftActualCash - currentShift.expectedCash > 0 ? '+' : '') + formatRupiah(shiftActualCash - currentShift.expectedCash)}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsShiftModalOpen(false)}
                    className="flex-1 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      closeShift(shiftActualCash);
                      setIsShiftModalOpen(false);
                      alert('Shift kasir berhasil ditutup dan direkap!');
                    }}
                    className="flex-1 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Tutup Shift Sekarang
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Masukkan modal kas kecil awal (kembalian) yang disiapkan di dalam laci mesin kasir sebelum memulai penjualan.
                </p>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Modal Kas Awal (Rp)
                  </label>
                  <input
                    type="number"
                    value={shiftStartingCash || ''}
                    onChange={e => setShiftStartingCash(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Contoh: 200000"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsShiftModalOpen(false)}
                    className="flex-1 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      openShift(shiftStartingCash, activeMerchant?.currentCashierName || 'Kasir');
                      setIsShiftModalOpen(false);
                    }}
                    className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Buka Kasir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={(trx) => {
            setIsCheckoutOpen(false);
            setCompletedTransaction(trx);
          }}
        />
      )}

      {/* Receipt Modal */}
      {completedTransaction && activeMerchant && (
        <ReceiptModal
          transaction={completedTransaction}
          merchant={activeMerchant}
          onClose={() => setCompletedTransaction(null)}
          onNewTransaction={() => setCompletedTransaction(null)}
        />
      )}

    </div>
  );
};
