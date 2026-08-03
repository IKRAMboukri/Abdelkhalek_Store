export const NAV_ITEMS: Array<{
  icon: string;
  label: string;
  path: string;
  subItems: Array<{ label: string; path: string }>;
}> = [
  {
    icon: 'LayoutDashboard',
    label: 'Dashboard',
    path: '/',
    subItems: [],
  },
  {
    icon: 'Package',
    label: 'Products',
    path: '/products',
    subItems: [
      { label: 'All Products', path: '/products' },
      { label: 'Add Product', path: '/products/new' },
      { label: 'Categories', path: '/categories' },
    ],
  },
  {
    icon: 'FolderTree',
    label: 'Categories',
    path: '/categories',
    subItems: [],
  },
  {
    icon: 'Warehouse',
    label: 'Inventory',
    path: '/inventory',
    subItems: [
      { label: 'Stock Overview', path: '/inventory' },
      { label: 'Movements', path: '/inventory/movements' },
      { label: 'Low Stock', path: '/inventory/low-stock' },
    ],
  },
  {
    icon: 'Users',
    label: 'Customers',
    path: '/customers',
    subItems: [
      { label: 'All Customers', path: '/customers' },
      { label: 'Add Customer', path: '/customers/new' },
    ],
  },
  {
    icon: 'ShoppingCart',
    label: 'Sales',
    path: '/sales',
    subItems: [
      { label: 'All Sales', path: '/sales' },
      { label: 'New Sale', path: '/sales/new' },
      { label: 'Invoices', path: '/sales/invoices' },
    ],
  },
  {
    icon: 'Wallet',
    label: 'Credits',
    path: '/credits',
    subItems: [
      { label: 'All Credits', path: '/credits' },
      { label: 'New Credit', path: '/credits/new' },
    ],
  },
  {
    icon: 'CreditCard',
    label: 'Payments',
    path: '/payments',
    subItems: [
      { label: 'All Payments', path: '/payments' },
      { label: 'New Payment', path: '/payments/new' },
    ],
  },
  {
    icon: 'BarChart3',
    label: 'Reports',
    path: '/reports',
    subItems: [
      { label: 'Sales Report', path: '/reports/sales' },
      { label: 'Inventory Report', path: '/reports/inventory' },
      { label: 'Financial Report', path: '/reports/financial' },
      { label: 'Customer Report', path: '/reports/customers' },
    ],
  },
  {
    icon: 'Bell',
    label: 'Notifications',
    path: '/notifications',
    subItems: [],
  },
  {
    icon: 'Settings',
    label: 'Settings',
    path: '/settings',
    subItems: [
      { label: 'General', path: '/settings' },
      { label: 'Store', path: '/settings/store' },
      { label: 'Users', path: '/settings/users' },

    ],
  },
];

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  discontinued: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  overdue: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  in: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  out: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  adjustment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  low_stock: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  credit_reminder: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  new_sale: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  system: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  sales: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
} as const;

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
] as const;

export const PAGINATION_DEFAULTS = {
  pageSize: 10,
  pageSizeOptions: [10, 25, 50],
  maxVisiblePages: 5,
} as const;

export const SORT_OPTIONS = {
  products: [
    { value: 'sellingPrice', label: 'Price' },
    { value: 'stock', label: 'Stock' },
    { value: 'createdAt', label: 'Date Added' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'categoryName', label: 'Category' },
    { value: 'status', label: 'Status' },
  ],
  categories: [
    { value: 'name', label: 'Name' },
    { value: 'productCount', label: 'Product Count' },
    { value: 'createdAt', label: 'Date Created' },
  ],
  customers: [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'totalSpent', label: 'Total Spent' },
    { value: 'totalPurchases', label: 'Total Purchases' },
    { value: 'creditBalance', label: 'Credit Balance' },
    { value: 'createdAt', label: 'Date Added' },
  ],
  sales: [
    { value: 'createdAt', label: 'Date' },
    { value: 'total', label: 'Total' },
    { value: 'customerName', label: 'Customer' },
    { value: 'status', label: 'Status' },
    { value: 'invoiceNumber', label: 'Invoice Number' },
  ],
  credits: [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'initialAmount', label: 'Amount' },
    { value: 'remainingBalance', label: 'Balance' },
    { value: 'customerName', label: 'Customer' },
    { value: 'status', label: 'Status' },
  ],
  payments: [
    { value: 'createdAt', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'customerName', label: 'Customer' },
    { value: 'method', label: 'Method' },
    { value: 'status', label: 'Status' },
  ],
  inventory: [
    { value: 'createdAt', label: 'Date' },
    { value: 'productName', label: 'Product' },
    { value: 'type', label: 'Type' },
    { value: 'quantity', label: 'Quantity' },
  ],
} as const;

export const CHART_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#f97316',
] as const;

export const DATE_FORMAT_OPTIONS = [
  { value: 'YYYY-MM-DD', label: '2024-01-15' },
  { value: 'DD/MM/YYYY', label: '15/01/2024' },
  { value: 'MM/DD/YYYY', label: '01/15/2024' },
  { value: 'DD.MM.YYYY', label: '15.01.2024' },
  { value: 'DD MMM YYYY', label: '15 Jan 2024' },
  { value: 'MMM DD, YYYY', label: 'Jan 15, 2024' },
  { value: 'DD MMMM YYYY', label: '15 January 2024' },
  { value: 'MMMM DD, YYYY', label: 'January 15, 2024' },
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { value: 'EUR', symbol: '€', label: 'Euro (€)' },
  { value: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { value: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)' },
  { value: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { value: 'MAD', symbol: 'DH', label: 'Moroccan Dirham (DH)' },
  { value: 'EGP', symbol: 'E£', label: 'Egyptian Pound (E£)' },
  { value: 'SAR', symbol: '﷼', label: 'Saudi Riyal (﷼)' },
  { value: 'AED', symbol: 'د.إ', label: 'UAE Dirham (د.إ)' },
] as const;

export const PRODUCT_UNITS = [
  { value: 'piece', label: 'Piece' },
  { value: 'set', label: 'Set' },
  { value: 'meter', label: 'Meter' },
  { value: 'square_meter', label: 'Square Meter' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'liter', label: 'Liter' },
  { value: 'box', label: 'Box' },
  { value: 'pair', label: 'Pair' },
] as const;

export const API_ENDPOINTS = {
  products: '/api/products',
  categories: '/api/categories',
  customers: '/api/customers',
  sales: '/api/sales',
  credits: '/api/credits',
  payments: '/api/payments',
  inventory: '/api/inventory',
  notifications: '/api/notifications',
  reports: '/api/reports',
  dashboard: '/api/dashboard',
  settings: '/api/settings',
  auth: '/api/auth',
  users: '/api/users',
} as const;

export const STORAGE_KEYS = {
  token: 'fs_token',
  user: 'fs_user',
  settings: 'fs_settings',
  theme: 'fs_theme',
  language: 'fs_language',
} as const;

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;
