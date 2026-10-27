import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Merchant, 
  Product, 
  Transaction, 
  StockMovement, 
  SubscriptionPlan, 
  SaaSInvoice, 
  CartItem, 
  PaymentMethod, 
  ActivePlatformView,
  StockMovementType,
  CashierShift,
  UserAccount,
  UserRole
} from '../types';
import { 
  INITIAL_MERCHANTS, 
  INITIAL_PRODUCTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_STOCK_MOVEMENTS, 
  INITIAL_PLANS, 
  INITIAL_SAAS_INVOICES 
} from '../utils/mockData';
import { generateInvoiceNo } from '../utils/formatters';

export const DEFAULT_USERS: Array<UserAccount & { password?: string }> = [
  {
    id: 'usr-admin',
    name: 'Super Admin (Anda)',
    email: 'sj5692547@gmail.com',
    password: 'admin123',
    role: 'SUPER_ADMIN',
    title: 'Platform Owner & Super Admin'
  },
  {
    id: 'usr-admin-alt',
    name: 'Admin KasirPro',
    email: 'admin@kasirpro.id',
    password: 'admin123',
    role: 'SUPER_ADMIN',
    title: 'Administrator Platform'
  },
  {
    id: 'usr-owner-1',
    name: 'Budi Santoso',
    email: 'budikopi@gmail.com',
    password: 'owner123',
    role: 'MERCHANT_OWNER',
    merchantId: 'merch-kopi',
    title: 'Pemilik Toko (Kopi Kenangan Senja)'
  },
  {
    id: 'usr-cashier-1',
    name: 'Rian Pratama',
    email: 'rian.kasir@gmail.com',
    password: 'kasir123',
    pin: '1234',
    role: 'CASHIER',
    merchantId: 'merch-kopi',
    title: 'Kasir Shift (Kopi Kenangan Senja)'
  }
];

interface AppContextType {
  activeView: ActivePlatformView;
  setActiveView: (view: ActivePlatformView) => void;
  currentUser: UserAccount;
  login: (emailOrId: string, passwordOrPin: string) => { success: boolean; message: string };
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  availableCredentials: Array<UserAccount & { password?: string }>;
  merchants: Merchant[];
  activeMerchantId: string;
  setActiveMerchantId: (id: string) => void;
  activeMerchant: Merchant | undefined;
  products: Product[];
  currentMerchantProducts: Product[];
  transactions: Transaction[];
  currentMerchantTransactions: Transaction[];
  stockMovements: StockMovement[];
  currentMerchantStockMovements: StockMovement[];
  plans: SubscriptionPlan[];
  saasInvoices: SaaSInvoice[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, note?: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemCount: number;
  checkoutTransaction: (params: {
    paymentMethod: PaymentMethod;
    cashGiven: number;
    discountTotal?: number;
    customerName?: string;
    customerPhone?: string;
    applyTax?: boolean;
    applyService?: boolean;
  }) => Transaction;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'merchantId'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, deltaQty: number, type: StockMovementType, notes: string) => void;
  addMerchant: (merchant: Omit<Merchant, 'id' | 'createdAt'>) => Merchant;
  updateMerchant: (id: string, updates: Partial<Merchant>) => void;
  renewMerchantSubscription: (merchantId: string, planId: string, cycle: 'MONTHLY' | 'YEARLY') => void;
  updatePlan: (id: string, updates: Partial<SubscriptionPlan>) => void;
  currentShift: CashierShift | null;
  openShift: (startingCash: number, cashierName: string) => void;
  closeShift: (actualCash: number, notes?: string) => CashierShift;
  lastCompletedTransaction: Transaction | null;
  setLastCompletedTransaction: (trx: Transaction | null) => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'kasirpro_user_v1',
  MERCHANTS: 'kasirpro_merchants_v1',
  ACTIVE_MERCHANT: 'kasirpro_active_merchant_v1',
  PRODUCTS: 'kasirpro_products_v1',
  TRANSACTIONS: 'kasirpro_transactions_v1',
  STOCK_MOVEMENTS: 'kasirpro_stock_movs_v1',
  PLANS: 'kasirpro_plans_v1',
  SAAS_INVOICES: 'kasirpro_saas_invs_v1',
  SHIFT: 'kasirpro_shift_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : DEFAULT_USERS[0];
  });
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ActivePlatformView>('super_admin');
  
  // Initialize with localStorage or initial mock data
  const [merchants, setMerchants] = useState<Merchant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MERCHANTS);
    return saved ? JSON.parse(saved) : INITIAL_MERCHANTS;
  });

  const [activeMerchantId, setActiveMerchantId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_MERCHANT);
    return saved || 'merch-kopi';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [saasInvoices, setSaasInvoices] = useState<SaaSInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAAS_INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_SAAS_INVOICES;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);

  const [currentShift, setCurrentShift] = useState<CashierShift | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHIFT);
    return saved ? JSON.parse(saved) : {
      id: 'shift-1',
      merchantId: 'merch-kopi',
      cashierName: 'Rian Pratama',
      startTime: new Date().toISOString(),
      startingCash: 250000,
      expectedCash: 302000,
      status: 'OPEN'
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(merchants));
  }, [merchants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MERCHANT, activeMerchantId);
  }, [activeMerchantId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAAS_INVOICES, JSON.stringify(saasInvoices));
  }, [saasInvoices]);

  useEffect(() => {
    if (currentShift) {
      localStorage.setItem(STORAGE_KEYS.SHIFT, JSON.stringify(currentShift));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SHIFT);
    }
  }, [currentShift]);

  const activeMerchant = merchants.find(m => m.id === activeMerchantId) || merchants[0];
  const currentMerchantProducts = products.filter(p => p.merchantId === activeMerchantId);
  const currentMerchantTransactions = transactions.filter(t => t.merchantId === activeMerchantId);
  const currentMerchantStockMovements = stockMovements.filter(sm => sm.merchantId === activeMerchantId);

  // Cart operations
  const addToCart = (product: Product, quantity: number = 1, note?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          note: note !== undefined ? note : next[existingIndex].note
        };
        return next;
      }
      return [...prev, { product, quantity, note }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Checkout transaction
  const checkoutTransaction = (params: {
    paymentMethod: PaymentMethod;
    cashGiven: number;
    discountTotal?: number;
    customerName?: string;
    customerPhone?: string;
    applyTax?: boolean;
    applyService?: boolean;
  }): Transaction => {
    const discount = params.discountTotal || 0;
    const subtotalAfterDiscount = Math.max(0, cartSubtotal - discount);
    
    // Tax (PPN 11% optional)
    const tax = params.applyTax ? Math.round(subtotalAfterDiscount * 0.11) : 0;
    const serviceCharge = params.applyService ? Math.round(subtotalAfterDiscount * 0.05) : 0;
    const total = subtotalAfterDiscount + tax + serviceCharge;
    
    const cashGiven = params.paymentMethod === 'CASH' ? params.cashGiven : total;
    const change = Math.max(0, cashGiven - total);

    const invoiceNumber = generateInvoiceNo('INV');
    const now = new Date().toISOString();

    const transactionItems = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      costPrice: item.product.costPrice,
      sellingPrice: item.product.sellingPrice,
      discount: item.discountAmount || 0,
      subtotal: item.product.sellingPrice * item.quantity - (item.discountAmount || 0)
    }));

    const newTransaction: Transaction = {
      id: 'trx-' + Date.now(),
      invoiceNumber,
      merchantId: activeMerchantId,
      cashierName: activeMerchant?.currentCashierName || 'Kasir',
      cashierId: 'csh-active',
      items: transactionItems,
      subtotal: cartSubtotal,
      discountTotal: discount,
      tax,
      serviceCharge,
      total,
      paymentMethod: params.paymentMethod,
      cashGiven,
      change,
      customerName: params.customerName || '',
      customerPhone: params.customerPhone || '',
      createdAt: now,
      status: 'PAID'
    };

    // 1. Save transaction
    setTransactions(prev => [newTransaction, ...prev]);

    // 2. Real-time stock reduction
    const updatedProducts = products.map(prod => {
      const cartItem = cart.find(ci => ci.product.id === prod.id);
      if (cartItem) {
        const newStock = Math.max(0, prod.stock - cartItem.quantity);
        return {
          ...prod,
          stock: newStock,
          updatedAt: now
        };
      }
      return prod;
    });
    setProducts(updatedProducts);

    // 3. Record stock movements
    const newMovements: StockMovement[] = cart.map(ci => ({
      id: 'mov-' + Date.now() + '-' + ci.product.id,
      merchantId: activeMerchantId,
      productId: ci.product.id,
      productName: ci.product.name,
      type: 'SALE',
      quantity: -ci.quantity,
      previousStock: ci.product.stock,
      newStock: Math.max(0, ci.product.stock - ci.quantity),
      referenceNumber: invoiceNumber,
      notes: `Penjualan Kasir (${params.paymentMethod})`,
      date: now,
      by: activeMerchant?.currentCashierName || 'Kasir'
    }));
    setStockMovements(prev => [...newMovements, ...prev]);

    // 4. Update shift cash if cash payment
    if (params.paymentMethod === 'CASH' && currentShift && currentShift.status === 'OPEN') {
      setCurrentShift(prev => prev ? {
        ...prev,
        expectedCash: prev.expectedCash + total
      } : null);
    }

    // 5. Clear cart and set completed transaction
    clearCart();
    setLastCompletedTransaction(newTransaction);
    return newTransaction;
  };

  // Product management
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'merchantId'>): Product => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...prodData,
      id: 'prod-' + Date.now(),
      merchantId: activeMerchantId,
      createdAt: now,
      updatedAt: now
    };
    setProducts(prev => [newProduct, ...prev]);

    // Add initial stock movement if starting stock > 0
    if (newProduct.stock > 0) {
      const initialMovement: StockMovement = {
        id: 'mov-' + Date.now(),
        merchantId: activeMerchantId,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'IN',
        quantity: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        notes: 'Stok Awal Produk Baru',
        date: now,
        by: 'Admin UMKM'
      };
      setStockMovements(prev => [initialMovement, ...prev]);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updates, updatedAt: new Date().toISOString() };
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Stock Opname & Restock
  const adjustStock = (productId: string, deltaQty: number, type: StockMovementType, notes: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + deltaQty);
    const now = new Date().toISOString();

    updateProduct(productId, { stock: newStock });

    const movement: StockMovement = {
      id: 'mov-' + Date.now(),
      merchantId: activeMerchantId,
      productId: product.id,
      productName: product.name,
      type,
      quantity: deltaQty,
      previousStock,
      newStock,
      notes: notes || (deltaQty > 0 ? 'Penambahan Stok / Kulakan' : 'Penyesuaian Stok / Rusak'),
      date: now,
      by: activeMerchant?.ownerName || 'Admin'
    };

    setStockMovements(prev => [movement, ...prev]);
  };

  // Merchant operations (for Super Admin)
  const addMerchant = (data: Omit<Merchant, 'id' | 'createdAt'>): Merchant => {
    const newMerchant: Merchant = {
      ...data,
      id: 'merch-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setMerchants(prev => [newMerchant, ...prev]);
    return newMerchant;
  };

  const updateMerchant = (id: string, updates: Partial<Merchant>) => {
    setMerchants(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  // Subscription Renewal & Invoicing
  const renewMerchantSubscription = (merchantId: string, planId: string, cycle: 'MONTHLY' | 'YEARLY') => {
    const merchant = merchants.find(m => m.id === merchantId);
    const plan = plans.find(p => p.id === planId) || plans[0];
    if (!merchant) return;

    const currentExpire = new Date(merchant.subscriptionExpiresAt);
    const baseDate = currentExpire > new Date() ? currentExpire : new Date();
    
    // Add 30 days or 365 days
    const newDate = new Date(baseDate);
    if (cycle === 'MONTHLY') {
      newDate.setDate(newDate.getDate() + 30);
    } else {
      newDate.setDate(newDate.getDate() + 365);
    }

    const expiryStr = newDate.toISOString().split('T')[0];
    const amount = cycle === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly;

    // Update merchant
    updateMerchant(merchantId, {
      activePlanId: planId,
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiresAt: expiryStr
    });

    // Create SaaS Invoice
    const newInvoice: SaaSInvoice = {
      id: 'sinv-' + Date.now(),
      invoiceNo: `SAS/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(10 + Math.random() * 90)}`,
      merchantId,
      merchantName: merchant.name,
      planId,
      planName: plan.name,
      amount,
      billingCycle: cycle,
      date: new Date().toISOString().split('T')[0],
      status: 'PAID',
      paymentMethod: 'BCA / QRIS Platform'
    };

    setSaasInvoices(prev => [newInvoice, ...prev]);
  };

  const updatePlan = (id: string, updates: Partial<SubscriptionPlan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Cashier Shift management
  const openShift = (startingCash: number, cashierName: string) => {
    const newShift: CashierShift = {
      id: 'shift-' + Date.now(),
      merchantId: activeMerchantId,
      cashierName,
      startTime: new Date().toISOString(),
      startingCash,
      expectedCash: startingCash,
      status: 'OPEN'
    };
    setCurrentShift(newShift);
  };

  const closeShift = (actualCash: number, notes?: string): CashierShift => {
    if (!currentShift) {
      throw new Error('Tidak ada shift aktif');
    }
    const difference = actualCash - currentShift.expectedCash;
    const closed: CashierShift = {
      ...currentShift,
      endTime: new Date().toISOString(),
      actualCash,
      difference,
      status: 'CLOSED',
      notes
    };
    setCurrentShift(null);
    return closed;
  };

  // Authentication functions
  const login = (emailOrId: string, passwordOrPin: string): { success: boolean; message: string } => {
    const input = emailOrId.trim().toLowerCase();
    const secret = passwordOrPin.trim();

    const matchedUser = DEFAULT_USERS.find(u => {
      const matchEmailOrId = u.email.toLowerCase() === input || u.id.toLowerCase() === input;
      const matchPassword = u.password === secret;
      const matchPin = u.pin && u.pin === secret;
      return matchEmailOrId && (matchPassword || matchPin);
    });

    if (matchedUser) {
      setCurrentUser(matchedUser);
      // Auto route to their corresponding portal
      if (matchedUser.role === 'SUPER_ADMIN') {
        setActiveView('super_admin');
      } else if (matchedUser.role === 'MERCHANT_OWNER') {
        if (matchedUser.merchantId) setActiveMerchantId(matchedUser.merchantId);
        setActiveView('merchant_backoffice');
      } else if (matchedUser.role === 'CASHIER') {
        if (matchedUser.merchantId) setActiveMerchantId(matchedUser.merchantId);
        setActiveView('merchant_pos');
      }
      return { success: true, message: `Selamat datang, ${matchedUser.name}!` };
    }

    return { success: false, message: 'Email/ID atau Password/PIN salah. Silakan coba lagi.' };
  };

  const logout = () => {
    // Revert to demo guest or open auth modal
    setIsAuthModalOpen(true);
  };

  const resetToDemoData = () => {
    setMerchants(INITIAL_MERCHANTS);
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setPlans(INITIAL_PLANS);
    setSaasInvoices(INITIAL_SAAS_INVOICES);
    setActiveMerchantId('merch-kopi');
    setCurrentUser(DEFAULT_USERS[0]);
    clearCart();
    setLastCompletedTransaction(null);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        currentUser,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        availableCredentials: DEFAULT_USERS,
        merchants,
        activeMerchantId,
        setActiveMerchantId,
        activeMerchant,
        products,
        currentMerchantProducts,
        transactions,
        currentMerchantTransactions,
        stockMovements,
        currentMerchantStockMovements,
        plans,
        saasInvoices,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartItemCount,
        checkoutTransaction,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addMerchant,
        updateMerchant,
        renewMerchantSubscription,
        updatePlan,
        currentShift,
        openShift,
        closeShift,
        lastCompletedTransaction,
        setLastCompletedTransaction,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
