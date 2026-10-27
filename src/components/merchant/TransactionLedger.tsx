import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { ReceiptModal } from '../pos/ReceiptModal';
import { Search, Eye, Printer, FileText, CheckCircle2 } from 'lucide-react';

export const TransactionLedger: React.FC = () => {
  const { currentMerchantTransactions, activeMerchant } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  const filteredTransactions = currentMerchantTransactions.filter(trx => {
    const q = searchQuery.toLowerCase();
    return !q ||
      trx.invoiceNumber.toLowerCase().includes(q) ||
      (trx.customerName && trx.customerName.toLowerCase().includes(q)) ||
      trx.paymentMethod.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi Penjualan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap nota kasir, rincian pembayaran, dan cetak ulang struk thermal.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari No. Nota, Pelanggan, Metode..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Nota</th>
                <th className="py-3 px-4">Waktu Transaksi</th>
                <th className="py-3 px-4">Kasir</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4 text-center">Metode</th>
                <th className="py-3 px-4 text-center">Jumlah Item</th>
                <th className="py-3 px-4 text-right">Total Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada transaksi yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(trx => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {trx.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDateTime(trx.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      {trx.cashierName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {trx.customerName || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                      {trx.items.length} item
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatRupiah(trx.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        LUNAS
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTrx(trx)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Cetak Ulang</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Re-open Receipt Modal */}
      {selectedTrx && activeMerchant && (
        <ReceiptModal
          transaction={selectedTrx}
          merchant={activeMerchant}
          onClose={() => setSelectedTrx(null)}
          onNewTransaction={() => setSelectedTrx(null)}
        />
      )}

    </div>
  );
};
