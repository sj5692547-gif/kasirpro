/**
 * Formatting utilities for Indonesian currency, numbers, and dates
 */

export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount || 0);
  return 'Rp ' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatNumber(amount: number): string {
  const rounded = Math.round(amount || 0);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  } catch {
    return dateStr;
  }
}

export function generateInvoiceNo(prefix: string = 'TRX'): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}/${year}${month}${day}/${random}`;
}

export function buildReceiptWhatsAppText(merchantName: string, invoiceNo: string, date: string, items: Array<{ name: string; quantity: number; sellingPrice: number; subtotal: number }>, total: number, paymentMethod: string, cashier: string): string {
  let text = `*STRUK DIGITAL ${merchantName.toUpperCase()}*\n`;
  text += `No. Nota: ${invoiceNo}\n`;
  text += `Waktu: ${date}\n`;
  text += `Kasir: ${cashier}\n`;
  text += `--------------------------------\n`;
  
  items.forEach(item => {
    text += `${item.name}\n`;
    text += `  ${item.quantity}x @ ${formatRupiah(item.sellingPrice)} = ${formatRupiah(item.subtotal)}\n`;
  });
  
  text += `--------------------------------\n`;
  text += `*TOTAL: ${formatRupiah(total)}*\n`;
  text += `Metode: ${paymentMethod}\n`;
  text += `Status: LUNAS\n\n`;
  text += `Terima kasih telah berbelanja di ${merchantName}! Simpan struk ini sebagai bukti pembayaran yang sah.`;
  
  return encodeURIComponent(text);
}
