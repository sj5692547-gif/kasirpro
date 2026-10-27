export type BusinessCategory = 'F&B / Kafe' | 'Retail & Minimarket' | 'Fashion & Butik' | 'Jasa & Servis' | 'Lainnya';

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  costPrice: number; // HPP (Harga Pokok Penjualan)
  sellingPrice: number; // Harga Jual
  stock: number;
  minStockAlert: number;
  unit: string; // 'pcs', 'porsi', 'botol', 'kg', 'pack', etc.
  imageUrl?: string;
  colorTag?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
  discountPercent?: number;
  discountAmount?: number;
  selectedVariant?: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'TRANSFER' | 'DEBT';

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  discount: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  merchantId: string;
  cashierName: string;
  cashierId: string;
  items: TransactionItem[];
  subtotal: number;
  discountTotal: number;
  tax: number; // PPN
  serviceCharge: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashGiven: number;
  change: number;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  status: 'PAID' | 'REFUNDED';
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUST' | 'SALE' | 'RETURN';

export interface StockMovement {
  id: string;
  merchantId: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceNumber?: string;
  notes: string;
  date: string;
  by: string;
}

export interface CashierShift {
  id: string;
  merchantId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  targetAudience: string;
  features: string[];
  maxProducts: number;
  maxCashiers: number;
  hasAnalytics: boolean;
  hasWhatsAppReceipt: boolean;
  hasMultiOutlet: boolean;
  isPopular?: boolean;
}

export interface Merchant {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: BusinessCategory;
  address: string;
  activePlanId: string;
  subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'PENDING';
  subscriptionExpiresAt: string;
  currentCashierName: string;
  outletsCount: number;
  currency: string;
  qrisMerchantName: string;
  nmid: string;
  taxRatePercent: number;
  serviceRatePercent: number;
  createdAt: string;
}

export interface SaaSInvoice {
  id: string;
  invoiceNo: string;
  merchantId: string;
  merchantName: string;
  planId: string;
  planName: string;
  amount: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  date: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paymentMethod: string;
}

export type UserRole = 'SUPER_ADMIN' | 'MERCHANT_OWNER' | 'CASHIER';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  merchantId?: string;
  pin?: string;
  title: string;
}

export type ActivePlatformView = 
  | 'super_admin'       // You as the SaaS Owner / Administrator
  | 'merchant_pos'      // Real Cashier POS view for frontliner
  | 'merchant_backoffice' // Merchant Owner managing products, stock & analytics
  | 'marketing_landing'; // The public website to sell & market subscriptions to Indonesian MSMEs

