export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  image: string;
  status: 'active' | 'inactive' | 'discontinued';
  barcode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  image: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  notes: string;
  totalPurchases: number;
  totalSpent: number;
  creditBalance: number;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  notes: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Credit {
  id: string;
  customerId: string;
  customerName: string;
  initialAmount: number;
  paidAmount: number;
  remainingBalance: number;
  dueDate: string;
  status: 'active' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  payments: CreditPayment[];
  createdAt: string;
  updatedAt: string;
  saleId?: string;
  invoiceNumber?: string;
}

export interface CreditPayment {
  id: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  paymentDate: string;
  notes: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reference: string;
  notes: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  saleId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  reference: string;
  notes: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'credit_reminder' | 'new_sale' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  lowStockProducts: number;
  pendingCredits: number;
  overdueCredits: number;
  pendingCreditAmount: number;
  overdueCreditAmount: number;
}

export interface MonthlySales {
  month: string;
  sales: number;
  revenue: number;
  profit: number;
  orders: number;
}

export interface BestSellingProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface RecentSale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface RecentCustomer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  logo: string;
  fiscalYear: string;
  timezone: string;
  dateFormat: string;
}

export interface UserSettings {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'viewer';
  avatar: string;
  active: boolean;
}

export interface FilterOptions {
  search: string;
  status: string;
  category: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportData {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  averageOrderValue: number;
  periodStart: string;
  periodEnd: string;
}

export interface InvoiceItem {
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  saleId: string
  invoiceNumber: string
  storeName: string
  storeLogo: string
  storePhone: string
  customerId: string
  customerName: string
  customerPhone: string
  items: InvoiceItem[]
  total: number
  amountPaid: number
  remainingBalance: number
  createdAt: string
}

export type SortDirection = 'asc' | 'desc';

export interface SelectOption {
  value: string;
  label: string;
}
