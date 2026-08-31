import type {
  BestSellingProduct,
  Category,
  CategoryOption,
  Credit,
  CreditPayment,
  Customer,
  DashboardStats,
  Invoice,
  InvoiceItem,
  MonthlySales,
  Notification,
  Payment,
  Product,
  RecentCustomer,
  RecentSale,
  Sale,
  SaleItem,
  StoreSettings,
  SubCategory,
  UserSettings,
} from '@/types';

function sid(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value);
}

/**
 * Coerce any incoming numeric value (number | numeric string | formatted
 * string like "2 590,00") into a finite number. Guarantees that every
 * consumer of mapped data works with real numbers in the browser,
 * regardless of backend serialization quirks.
 */
export function num(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[\s'’]/g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function optional(value: unknown): string | undefined {
  return value == null || value === '' ? undefined : String(value);
}

export interface RawPage<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RawProduct {
  id: number;
  name: string;
  description: string;
  categoryId?: number | null;
  categoryName?: string | null;
  subCategoryId?: number | null;
  subCategoryName?: string | null;
  options?: Record<string, string>;
  purchasePrice: number;
  sellingPrice: number;
  availability: Product['availability'];
  unit: string;
  image: string;
  status: Product['status'];
  barcode: string;
  createdAt: string;
  updatedAt: string;
}

export function mapProduct(raw: RawProduct): Product {
  return {
    id: String(raw.id),
    name: raw.name,
    description: raw.description,
    categoryId: raw.categoryId == null ? null : String(raw.categoryId),
    categoryName: raw.categoryName ?? '',
    subCategoryId: optional(raw.subCategoryId),
    subCategoryName: optional(raw.subCategoryName),
    options: raw.options ?? {},
    purchasePrice: num(raw.purchasePrice),
    sellingPrice: num(raw.sellingPrice),
    availability: raw.availability,
    unit: raw.unit,
    image: raw.image,
    status: raw.status,
    barcode: raw.barcode,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export interface RawCategoryOption {
  id: number;
  label: string;
  values?: Array<{ value?: unknown; label?: unknown }>;
}

export interface RawSubCategory {
  id: number;
  name: string;
  options?: RawCategoryOption[] | null;
}

export interface RawCategory {
  id: number;
  name: string;
  description: string;
  productCount: number;
  image?: string;
  createdAt: string;
  subcategories?: RawSubCategory[] | null;
}

function mapCategoryOption(raw: RawCategoryOption): CategoryOption {
  return {
    id: String(raw.id),
    label: raw.label,
    values: (raw.values ?? []).map((v) => ({
      value: sid(v.value),
      label: sid(v.label),
    })),
  };
}

export function mapSubCategory(raw: RawSubCategory): SubCategory {
  const sub: SubCategory = { id: String(raw.id), name: raw.name };
  if (raw.options && raw.options.length > 0) {
    sub.options = raw.options.map(mapCategoryOption);
  }
  return sub;
}

export function mapCategory(raw: RawCategory): Category {
  return {
    id: String(raw.id),
    name: raw.name,
    description: raw.description,
    productCount: raw.productCount,
    image: raw.image,
    createdAt: raw.createdAt,
    subcategories: raw.subcategories ? raw.subcategories.map(mapSubCategory) : undefined,
  };
}

export interface RawCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  notes: string;
  totalPurchases: number;
  creditBalance: number;
  status: Customer['status'];
  createdAt: string;
  updatedAt: string;
}

export function mapCustomer(raw: RawCustomer): Customer {
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    address: raw.address,
    company: raw.company,
    notes: raw.notes,
    totalPurchases: raw.totalPurchases,
    creditBalance: raw.creditBalance,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export interface RawSaleItem {
  id?: number | null;
  productId?: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function mapSaleItem(raw: RawSaleItem): SaleItem {
  return {
    productId: sid(raw.productId),
    productName: raw.productName,
    quantity: num(raw.quantity),
    unitPrice: num(raw.unitPrice),
    total: num(raw.total),
  };
}

export interface RawSale {
  id: number;
  invoiceNumber: string;
  customerId?: number | null;
  customerName: string;
  items: RawSaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: Sale['paymentMethod'];
  status: Sale['status'];
  notes: string;
  createdAt: string;
}

export function mapSale(raw: RawSale): Sale {
  return {
    id: String(raw.id),
    invoiceNumber: raw.invoiceNumber,
    customerId: sid(raw.customerId),
    customerName: raw.customerName,
    items: raw.items.map(mapSaleItem),
    subtotal: num(raw.subtotal),
    discount: num(raw.discount),
    total: num(raw.total),
    paymentMethod: raw.paymentMethod,
    status: raw.status,
    notes: raw.notes,
    createdAt: raw.createdAt,
  };
}

export interface RawCreditPayment {
  id: number;
  amount: number;
  paymentMethod: CreditPayment['paymentMethod'];
  paymentDate: string;
  notes: string;
}

function mapCreditPayment(raw: RawCreditPayment): CreditPayment {
  return {
    id: String(raw.id),
    amount: num(raw.amount),
    paymentMethod: raw.paymentMethod,
    paymentDate: raw.paymentDate,
    notes: raw.notes,
  };
}

export interface RawCredit {
  id: number;
  customerId: number;
  customerName: string;
  initialAmount: number;
  paidAmount: number;
  remainingBalance: number;
  dueDate: string;
  status: Credit['status'];
  notes: string;
  payments: RawCreditPayment[];
  saleId?: number | null;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export function mapCredit(raw: RawCredit): Credit {
  const credit: Credit = {
    id: String(raw.id),
    customerId: String(raw.customerId),
    customerName: raw.customerName,
    initialAmount: num(raw.initialAmount),
    paidAmount: num(raw.paidAmount),
    remainingBalance: num(raw.remainingBalance),
    dueDate: raw.dueDate,
    status: raw.status,
    notes: raw.notes,
    payments: raw.payments.map(mapCreditPayment),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
  if (raw.saleId != null) {
    credit.saleId = String(raw.saleId);
  }
  if (raw.invoiceNumber) {
    credit.invoiceNumber = raw.invoiceNumber;
  }
  return credit;
}

export interface RawPayment {
  id: number;
  saleId?: number | null;
  invoiceNumber: string;
  customerId?: number | null;
  customerName: string;
  amount: number;
  method: Payment['method'];
  status: Payment['status'];
  reference: string;
  notes: string;
  createdAt: string;
}

export function mapPayment(raw: RawPayment): Payment {
  return {
    id: String(raw.id),
    saleId: sid(raw.saleId),
    invoiceNumber: raw.invoiceNumber,
    customerId: sid(raw.customerId),
    customerName: raw.customerName,
    amount: num(raw.amount),
    method: raw.method,
    status: raw.status,
    reference: raw.reference,
    notes: raw.notes,
    createdAt: raw.createdAt,
  };
}

export interface RawNotification {
  id: number;
  type: Notification['type'];
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export function mapNotification(raw: RawNotification): Notification {
  const notification: Notification = {
    id: String(raw.id),
    type: raw.type,
    title: raw.title,
    message: raw.message,
    read: raw.read,
    createdAt: raw.createdAt,
  };
  if (raw.link) {
    notification.link = raw.link;
  }
  return notification;
}

export interface RawInvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

function mapInvoiceItem(raw: RawInvoiceItem): InvoiceItem {
  return {
    productName: raw.productName,
    quantity: num(raw.quantity),
    unitPrice: num(raw.unitPrice),
    total: num(raw.total),
  };
}

export interface RawInvoice {
  id: number;
  saleId: number;
  invoiceNumber: string;
  storeName: string;
  storeLogo: string;
  storePhone: string;
  storeAddress: string;
  storeEmail: string;
  customerId?: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: RawInvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  remainingBalance: number;
  paymentMethod: Invoice['paymentMethod'];
  status: Invoice['status'];
  notes: string;
  createdAt: string;
}

export function mapInvoice(raw: RawInvoice): Invoice {
  return {
    id: String(raw.id),
    saleId: String(raw.saleId),
    invoiceNumber: raw.invoiceNumber,
    storeName: raw.storeName,
    storeLogo: raw.storeLogo,
    storePhone: raw.storePhone,
    storeAddress: raw.storeAddress,
    storeEmail: raw.storeEmail,
    customerId: sid(raw.customerId),
    customerName: raw.customerName,
    customerPhone: raw.customerPhone,
    customerAddress: raw.customerAddress,
    items: raw.items.map(mapInvoiceItem),
    subtotal: num(raw.subtotal),
    discount: num(raw.discount),
    total: num(raw.total),
    amountPaid: num(raw.amountPaid),
    remainingBalance: raw.remainingBalance,
    paymentMethod: raw.paymentMethod,
    status: raw.status,
    notes: raw.notes,
    createdAt: raw.createdAt,
  };
}

export interface RawRecentSale {
  id: number;
  invoiceNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export function mapRecentSale(raw: RawRecentSale): RecentSale {
  return {
    id: String(raw.id),
    invoiceNumber: raw.invoiceNumber,
    customerName: raw.customerName,
    total: raw.total,
    status: raw.status,
    createdAt: raw.createdAt,
  };
}

export interface RawRecentCustomer {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export function mapRecentCustomer(raw: RawRecentCustomer): RecentCustomer {
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    createdAt: raw.createdAt,
  };
}

export interface RawBestSellingProduct {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
}

export function mapBestSellingProduct(raw: RawBestSellingProduct): BestSellingProduct {
  return {
    productId: String(raw.productId),
    productName: raw.productName,
    quantity: raw.quantity,
    revenue: raw.revenue,
  };
}

export function mapMonthlySales(raw: MonthlySales): MonthlySales {
  return raw;
}

export function mapDashboardStats(raw: DashboardStats): DashboardStats {
  return raw;
}

export interface RawStoreSettings {
  id?: number;
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

export function mapStoreSettings(raw: RawStoreSettings): StoreSettings {
  return {
    storeName: raw.storeName,
    storeEmail: raw.storeEmail,
    storePhone: raw.storePhone,
    storeAddress: raw.storeAddress,
    currency: raw.currency,
    currencySymbol: raw.currencySymbol,
    logo: raw.logo,
    fiscalYear: raw.fiscalYear,
    timezone: raw.timezone,
    dateFormat: raw.dateFormat,
  };
}

export interface RawUserSettings {
  id: number;
  name: string;
  email: string;
  role: UserSettings['role'];
  avatar: string;
  active: boolean;
}

export function mapUserSettings(raw: RawUserSettings): UserSettings {
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    role: raw.role,
    avatar: raw.avatar,
    active: raw.active,
  };
}
