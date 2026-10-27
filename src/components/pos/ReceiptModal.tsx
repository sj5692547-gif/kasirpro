import React from 'react';
import { Transaction, Merchant } from '../../types';
import { formatRupiah, formatDateTime, buildReceiptWhatsAppText } from '../../utils/formatters';
import { Printer, Share2, CheckCircle2, X, Download, RotateCcw } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction;
  merchant: Merchant;
  onClose: () => void;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  merchant,
  onClose,
  onNewTransaction
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = buildReceiptWhatsAppText(
      merchant.name,
      transaction.invoiceNumber,
      formatDateTime(transaction.createdAt),
      transaction.items,
      transaction.total,
      transaction.paymentMethod,
      transaction.cashierName
    );
    const phone = transaction.customerPhone?.replace(/^0/, '62') || '';
    const url = phone 
      ? `https://wa.me/${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleDownloadTxt = () => {
    let content = `================================\n`;
    content += `        ${merchant.name.toUpperCase()}\n`;
    content += `   ${merchant.address}\n`;
    content += `================================\n`;
    content += `No. Nota : ${transaction.invoiceNumber}\n`;
    content += `Tanggal  : ${formatDateTime(transaction.createdAt)}\n`;
    content += `Kasir    : ${transaction.cashierName}\n`;
    if (transaction.customerName) {
      content += `Customer : ${transaction.customerName}\n`;
    }
    content += `--------------------------------\n`;
    transaction.items.forEach(it => {
      content += `${it.name}\n`;
      content += `  ${it.quantity} x ${it.sellingPrice} = ${it.subtotal}\n`;
    });
    content += `--------------------------------\n`;
    content += `Subtotal : ${formatRupiah(transaction.subtotal)}\n`;
    if (transaction.discountTotal > 0) {
      content += `Diskon   : -${formatRupiah(transaction.discountTotal)}\n`;
    }
    if (transaction.tax > 0) {
      content += `PPN (11%): ${formatRupiah(transaction.tax)}\n`;
    }
    if (transaction.serviceCharge > 0) {
      content += `Layanan  : ${formatRupiah(transaction.serviceCharge)}\n`;
    }
    content += `TOTAL    : ${formatRupiah(transaction.total)}\n`;
    content += `Metode   : ${transaction.paymentMethod}\n`;
    if (transaction.paymentMethod === 'CASH') {
      content += `Tunai    : ${formatRupiah(transaction.cashGiven)}\n`;
      content += `Kembali  : ${formatRupiah(transaction.change)}\n`;
    }
    content += `================================\n`;
    content += `      TERIMA KASIH ATAS\n`;
    content += `      KUNJUNGAN ANDA!\n`;
    content += `   Powered by KasirPro UMKM\n`;
    content += `================================\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Struk-${transaction.invoiceNumber.replace(/\//g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header Success Banner */}
        <div className="bg-emerald-600 text-white p-4 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-bold">Transaksi Berhasil!</h3>
          <p className="text-emerald-100 text-xs">
            Stok barang telah otomatis terpotong secara real-time
          </p>
        </div>

        {/* Authentic Thermal Receipt Paper Preview */}
        <div className="p-6 bg-slate-100/60 flex justify-center">
          <div 
            id="thermal-receipt-print-area"
            className="w-full max-w-[320px] bg-white p-5 shadow-md border border-dashed border-slate-300 rounded-sm font-mono text-[11px] leading-relaxed text-slate-800"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <h2 className="text-sm font-bold tracking-tight text-slate-900">{merchant.name}</h2>
              <p className="text-[10px] text-slate-600 mt-0.5">{merchant.address}</p>
              <p className="text-[10px] text-slate-600">Telp: {merchant.phone}</p>
            </div>

            {/* Meta Info */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>No. Nota</span>
                <span className="font-semibold">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu</span>
                <span>{formatDateTime(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{transaction.cashierName}</span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span>Pelanggan</span>
                  <span>{transaction.customerName}</span>
                </div>
              )}
            </div>

            {/* Itemized List */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
              {transaction.items.map((it, idx) => (
                <div key={idx}>
                  <div className="font-semibold text-slate-900">{it.name}</div>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>{it.quantity} x {formatRupiah(it.sellingPrice)}</span>
                    <span className="tabular-nums font-medium text-slate-800">{formatRupiah(it.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon Nota</span>
                  <span className="tabular-nums">-{formatRupiah(transaction.discountTotal)}</span>
                </div>
              )}
              {transaction.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>PPN (11%)</span>
                  <span className="tabular-nums">{formatRupiah(transaction.tax)}</span>
                </div>
              )}
              {transaction.serviceCharge > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Layanan</span>
                  <span className="tabular-nums">{formatRupiah(transaction.serviceCharge)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300">
                <span>TOTAL</span>
                <span className="tabular-nums text-emerald-700">{formatRupiah(transaction.total)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Metode Bayar</span>
                <span className="font-semibold">{transaction.paymentMethod}</span>
              </div>
              {transaction.paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between">
                    <span>Tunai Diterima</span>
                    <span className="tabular-nums">{formatRupiah(transaction.cashGiven)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-[11px]">
                    <span>Kembalian</span>
                    <span className="tabular-nums text-emerald-600">{formatRupiah(transaction.change)}</span>
                  </div>
                </>
              )}
              {transaction.paymentMethod === 'QRIS' && (
                <div className="text-center text-[9px] text-slate-500 pt-1">
                  NMID: {merchant.nmid} · QRIS Terverifikasi
                </div>
              )}
            </div>

            {/* Footer message */}
            <div className="text-center pt-3 text-[10px] text-slate-500 space-y-1">
              <p className="font-medium">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
              <p className="text-[9px]">Barang yang sudah dibeli tidak dapat ditukar</p>
              <p className="text-[8px] text-slate-400 mt-2">KasirPro UMKM · Solusi POS Indonesia</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Thermal</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Kirim WhatsApp</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadTxt}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Teks</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNewTransaction();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Transaksi Baru</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
