import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Transaction } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { 
  Banknote, 
  QrCode, 
  CreditCard, 
  Building, 
  BookOpen, 
  X, 
  Check, 
  Percent, 
  User, 
  Phone,
  Clock,
  Sparkles
} from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: (trx: Transaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const { cartSubtotal, cartItemCount, activeMerchant, checkoutTransaction } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<number>(cartSubtotal);
  const [discountTotal, setDiscountTotal] = useState<number>(0);
  const [applyTax, setApplyTax] = useState<boolean>(false);
  const [applyService, setApplyService] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [qrisTimer, setQrisTimer] = useState<number>(300); // 5 mins in seconds
  const [cardRefNo, setCardRefNo] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('BCA');

  // Calculations
  const subtotalAfterDiscount = Math.max(0, cartSubtotal - discountTotal);
  const tax = applyTax ? Math.round(subtotalAfterDiscount * 0.11) : 0;
  const service = applyService ? Math.round(subtotalAfterDiscount * 0.05) : 0;
  const grandTotal = subtotalAfterDiscount + tax + service;

  // Change calculation
  const change = Math.max(0, cashGiven - grandTotal);
  const isCashSufficient = paymentMethod !== 'CASH' || cashGiven >= grandTotal;

  // Update default cash given when total changes
  useEffect(() => {
    if (cashGiven < grandTotal) {
      setCashGiven(grandTotal);
    }
  }, [grandTotal]);

  // QRIS countdown timer
  useEffect(() => {
    if (paymentMethod !== 'QRIS') return;
    const interval = setInterval(() => {
      setQrisTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentMethod]);

  const handleQuickCash = (amount: number) => {
    setCashGiven(amount);
  };

  const handleCheckout = () => {
    if (!isCashSufficient) {
      alert('Uang tunai yang diterima masih kurang!');
      return;
    }

    if (paymentMethod === 'DEBT' && !customerName.trim()) {
      alert('Harap isi Nama Pelanggan untuk catatan kasbon/hutang!');
      return;
    }

    const trx = checkoutTransaction({
      paymentMethod,
      cashGiven: paymentMethod === 'CASH' ? cashGiven : grandTotal,
      discountTotal,
      customerName,
      customerPhone,
      applyTax,
      applyService
    });

    onSuccess(trx);
  };

  // Quick cash options based on grandTotal
  const getQuickCashOptions = () => {
    const options = [grandTotal];
    const rounded50k = Math.ceil(grandTotal / 50000) * 50000;
    const rounded100k = Math.ceil(grandTotal / 100000) * 100000;

    if (rounded50k > grandTotal && !options.includes(rounded50k)) {
      options.push(rounded50k);
    }
    if (rounded100k > grandTotal && !options.includes(rounded100k)) {
      options.push(rounded100k);
    }
    if (!options.includes(50000) && grandTotal < 50000) options.push(50000);
    if (!options.includes(100000) && grandTotal < 100000) options.push(100000);
    if (!options.includes(200000) && grandTotal < 200000) options.push(200000);

    return Array.from(new Set(options)).slice(0, 4);
  };

  const minutes = Math.floor(qrisTimer / 60);
  const seconds = qrisTimer % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pembayaran Kasir</h2>
            <p className="text-xs text-slate-500">
              {cartItemCount} item · Total Tagihan: <span className="font-bold text-slate-900 tabular-nums">{formatRupiah(grandTotal)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Payment Methods & Details */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Method Tabs */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-2">
                Pilih Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'CASH' as PaymentMethod, label: 'Tunai', icon: Banknote },
                  { id: 'QRIS' as PaymentMethod, label: 'QRIS', icon: QrCode },
                  { id: 'DEBIT' as PaymentMethod, label: 'Debit EDC', icon: CreditCard },
                  { id: 'TRANSFER' as PaymentMethod, label: 'Transfer', icon: Building },
                  { id: 'DEBT' as PaymentMethod, label: 'Kasbon', icon: BookOpen }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-800 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Specific Panels */}
            {paymentMethod === 'CASH' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <label className="text-xs font-semibold text-slate-700 block">
                  Jumlah Uang Diterima (Rp)
                </label>
                
                {/* Custom Cash Input */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={cashGiven || ''}
                    onChange={e => setCashGiven(Number(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-lg font-bold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                  />
                </div>

                {/* Quick Cash Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {getQuickCashOptions().map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickCash(opt)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        cashGiven === opt
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt === grandTotal ? 'Uang Pas' : formatRupiah(opt)}
                    </button>
                  ))}
                </div>

                {/* Kembalian Display Box */}
                <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Uang Kembalian:</span>
                  <span className={`text-xl font-bold tabular-nums ${
                    isCashSufficient ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {isCashSufficient ? formatRupiah(change) : 'Kurang ' + formatRupiah(grandTotal - cashGiven)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'QRIS' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-3">
                <div className="inline-block bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  {/* Dynamic SVG QR Code Simulation */}
                  <div className="w-36 h-36 bg-slate-900 p-2 rounded-lg flex flex-col justify-between items-center text-white relative">
                    <div className="w-full flex justify-between">
                      <div className="w-8 h-8 bg-white border-2 border-slate-900 rounded-sm"></div>
                      <div className="w-8 h-8 bg-white border-2 border-slate-900 rounded-sm"></div>
                    </div>
                    <div className="text-[10px] font-bold tracking-widest bg-emerald-500 text-slate-950 px-2 py-0.5 rounded uppercase">
                      QRIS INDONESIA
                    </div>
                    <div className="w-full flex justify-between">
                      <div className="w-8 h-8 bg-white border-2 border-slate-900 rounded-sm"></div>
                      <div className="text-[9px] font-mono text-slate-300">NMID OK</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900">{activeMerchant?.qrisMerchantName || activeMerchant?.name}</div>
                  <div className="text-[11px] text-slate-500">NMID: {activeMerchant?.nmid || 'ID1020087192837'}</div>
                  <div className="text-sm font-bold text-emerald-600 tabular-nums mt-1">
                    {formatRupiah(grandTotal)}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200 max-w-xs mx-auto">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Masa berlaku QR: <strong className="font-mono tabular-nums">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong></span>
                </div>
              </div>
            )}

            {paymentMethod === 'DEBIT' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {['BCA', 'Mandiri', 'BRI', 'BNI'].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border cursor-pointer ${
                        selectedBank === bank
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Nomor Referensi EDC / Approval Code (Opsional)
                  </label>
                  <input
                    type="text"
                    value={cardRefNo}
                    onChange={e => setCardRefNo(e.target.value)}
                    placeholder="Contoh: REF90281"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'TRANSFER' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <p className="font-medium text-slate-700">Rekening Tujuan Toko:</p>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank BCA:</span>
                    <span className="font-mono font-bold text-slate-800">8012-9988-7711</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Atas Nama:</span>
                    <span className="font-medium text-slate-800">{activeMerchant?.ownerName}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Pastikan dana sudah masuk ke mutasi sebelum menyelesaikan transaksi.
                </p>
              </div>
            )}

            {paymentMethod === 'DEBT' && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>Pencatatan Kasbon / Hutang Pelanggan</span>
                </div>
                <p className="text-xs text-amber-800">
                  Transaksi ini akan dicatat sebagai piutang toko. Pastikan identitas pelanggan diisi dengan benar.
                </p>
              </div>
            )}

            {/* Customer Info (For WhatsApp Receipt & Kasbon) */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Data Pelanggan (Opsional - Untuk Struk WA)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Nama Pelanggan"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="No. WhatsApp (0812...)"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Discounts */}
          <div className="md:col-span-5 bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Rincian Tagihan
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Belanja</span>
                  <span className="tabular-nums font-medium text-slate-900">{formatRupiah(cartSubtotal)}</span>
                </div>

                {/* Diskon Nota Input */}
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-emerald-600" />
                      <span>Diskon Nota (Rp)</span>
                    </span>
                  </div>
                  <input
                    type="number"
                    value={discountTotal || ''}
                    onChange={e => setDiscountTotal(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Toggles for Tax & Service Charge */}
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <label className="flex items-center justify-between cursor-pointer text-slate-700">
                    <span className="text-[11px]">PPN 11%</span>
                    <input
                      type="checkbox"
                      checked={applyTax}
                      onChange={e => setApplyTax(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>
                  {applyTax && (
                    <div className="flex justify-between text-[11px] text-slate-500 pl-2">
                      <span>Nilai Pajak</span>
                      <span className="tabular-nums">+{formatRupiah(tax)}</span>
                    </div>
                  )}

                  <label className="flex items-center justify-between cursor-pointer text-slate-700">
                    <span className="text-[11px]">Biaya Layanan (5%)</span>
                    <input
                      type="checkbox"
                      checked={applyService}
                      onChange={e => setApplyService(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                  </label>
                  {applyService && (
                    <div className="flex justify-between text-[11px] text-slate-500 pl-2">
                      <span>Nilai Layanan</span>
                      <span className="tabular-nums">+{formatRupiah(service)}</span>
                    </div>
                  )}
                </div>

                {/* Final Total Box */}
                <div className="pt-3 border-t-2 border-slate-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-slate-700">TOTAL BAYAR</span>
                    <span className="text-xl font-extrabold text-emerald-700 tabular-nums">
                      {formatRupiah(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Checkout Button */}
            <div className="pt-5 space-y-2">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!isCashSufficient}
                className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isCashSufficient
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-[0.99]'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <Check className="w-5 h-5" />
                <span>
                  {paymentMethod === 'QRIS'
                    ? 'Konfirmasi Bayar & Struk'
                    : 'Selesaikan & Cetak Struk'}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Batal / Kembali ke Kasir
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
