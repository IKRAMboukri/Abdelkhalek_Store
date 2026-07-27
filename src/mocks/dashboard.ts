import type { DashboardStats, MonthlySales, BestSellingProduct, RecentSale, RecentCustomer } from '../types';

export const mockDashboardStats: DashboardStats = {
  totalProducts: 101,
  totalCategories: 10,
  totalCustomers: 34,
  totalSuppliers: 12,
  totalSales: 90,
  totalRevenue: 189452.00,
  totalProfit: 78980.00,
  totalOrders: 90,
  lowStockProducts: 7,
  pendingCredits: 14,
  overdueCredits: 3,
  pendingCreditAmount: 26300.00,
  overdueCreditAmount: 4750.00
};

export const mockMonthlySales: MonthlySales[] = [
  {
    month: '2025-01',
    sales: 12850,
    revenue: 12850,
    profit: 5320,
    orders: 10
  },
  {
    month: '2025-02',
    sales: 18920,
    revenue: 18920,
    profit: 8130,
    orders: 11
  },
  {
    month: '2025-03',
    sales: 15680,
    revenue: 15680,
    profit: 6420,
    orders: 12
  },
  {
    month: '2025-04',
    sales: 45210,
    revenue: 45210,
    profit: 19450,
    orders: 13
  },
  {
    month: '2025-05',
    sales: 22450,
    revenue: 22450,
    profit: 9450,
    orders: 12
  },
  {
    month: '2025-06',
    sales: 31280,
    revenue: 31280,
    profit: 13120,
    orders: 17
  },
  {
    month: '2025-07',
    sales: 25680,
    revenue: 25680,
    profit: 10890,
    orders: 8
  },
  {
    month: '2025-08',
    sales: 0,
    revenue: 0,
    profit: 0,
    orders: 0
  },
  {
    month: '2025-09',
    sales: 0,
    revenue: 0,
    profit: 0,
    orders: 0
  },
  {
    month: '2025-10',
    sales: 0,
    revenue: 0,
    profit: 0,
    orders: 0
  },
  {
    month: '2025-11',
    sales: 0,
    revenue: 0,
    profit: 0,
    orders: 0
  },
  {
    month: '2025-12',
    sales: 0,
    revenue: 0,
    profit: 0,
    orders: 0
  }
];

export const mockBestSellingProducts: BestSellingProduct[] = [
  {
    productId: 'prod-37',
    productName: 'Herman Miller Aeron Chair Replica',
    quantity: 15,
    revenue: 10485
  },
  {
    productId: 'prod-43',
    productName: 'Ergonomic Mesh Office Chair',
    quantity: 12,
    revenue: 3828
  },
  {
    productId: 'prod-54',
    productName: 'Adirondack Chair Wooden',
    quantity: 12,
    revenue: 2388
  },
  {
    productId: 'prod-94',
    productName: 'King Size Memory Foam Mattress',
    quantity: 8,
    revenue: 7992
  },
  {
    productId: 'prod-50',
    productName: 'Teak Outdoor Dining Set',
    quantity: 7,
    revenue: 10493
  },
  {
    productId: 'prod-27',
    productName: 'Scandinavian Wooden Dining Table',
    quantity: 7,
    revenue: 6293
  },
  {
    productId: 'prod-2',
    productName: 'Velvet Tufted Accent Chair',
    quantity: 7,
    revenue: 3843
  },
  {
    productId: 'prod-1',
    productName: 'Sleek Modern Sofa',
    quantity: 6,
    revenue: 7794
  },
  {
    productId: 'prod-95',
    productName: 'Queen Hybrid Mattress',
    quantity: 5,
    revenue: 4395
  },
  {
    productId: 'prod-5',
    productName: 'Fabric Recliner Sofa',
    quantity: 5,
    revenue: 8495
  }
];

export const mockRecentSales: RecentSale[] = [
  {
    id: 'sale-90',
    invoiceNumber: 'INV-2025-0090',
    customerName: 'Olivia Martinez',
    total: 411,
    status: 'pending',
    createdAt: '2025-07-06T08:00:00Z'
  },
  {
    id: 'sale-85',
    invoiceNumber: 'INV-2025-0085',
    customerName: 'Sarah Johnson',
    total: 1908,
    status: 'completed',
    createdAt: '2025-07-06T10:00:00Z'
  },
  {
    id: 'sale-84',
    invoiceNumber: 'INV-2025-0084',
    customerName: 'Nathan Brooks',
    total: 1172,
    status: 'completed',
    createdAt: '2025-07-05T09:00:00Z'
  },
  {
    id: 'sale-83',
    invoiceNumber: 'INV-2025-0083',
    customerName: 'Amanda Foster',
    total: 1132,
    status: 'completed',
    createdAt: '2025-07-04T12:00:00Z'
  },
  {
    id: 'sale-82',
    invoiceNumber: 'INV-2025-0082',
    customerName: 'Daniel Garcia',
    total: 359,
    status: 'completed',
    createdAt: '2025-07-03T14:15:00Z'
  },
  {
    id: 'sale-81',
    invoiceNumber: 'INV-2025-0081',
    customerName: 'Benjamin Cooper',
    total: 276,
    status: 'completed',
    createdAt: '2025-07-02T10:30:00Z'
  },
  {
    id: 'sale-80',
    invoiceNumber: 'INV-2025-0080',
    customerName: 'Laura White',
    total: 593,
    status: 'completed',
    createdAt: '2025-07-01T11:00:00Z'
  },
  {
    id: 'sale-79',
    invoiceNumber: 'INV-2025-0079',
    customerName: 'Olivia Martinez',
    total: 719,
    status: 'pending',
    createdAt: '2025-06-30T15:30:00Z'
  },
  {
    id: 'sale-78',
    invoiceNumber: 'INV-2025-0078',
    customerName: 'Victoria Sanders',
    total: 1337,
    status: 'pending',
    createdAt: '2025-06-30T14:00:00Z'
  },
  {
    id: 'sale-77',
    invoiceNumber: 'INV-2025-0077',
    customerName: 'Greenleaf Hotels Group',
    total: 3058,
    status: 'completed',
    createdAt: '2025-06-29T10:00:00Z'
  }
];

export const mockRecentCustomers: RecentCustomer[] = [
  {
    id: 'cust-34',
    name: 'Victoria Sanders',
    email: 'victoria.sanders@gmail.com',
    totalSpent: 890.00,
    createdAt: '2024-11-01T09:30:00Z'
  },
  {
    id: 'cust-33',
    name: 'Benjamin Cooper',
    email: 'benjamin.cooper@gmail.com',
    totalSpent: 3876.00,
    createdAt: '2024-10-15T11:00:00Z'
  },
  {
    id: 'cust-32',
    name: 'Elite Coworking Spaces',
    email: 'hello@elitecoworking.com',
    totalSpent: 77733.00,
    createdAt: '2024-10-01T08:00:00Z'
  },
  {
    id: 'cust-31',
    name: 'Isabella Rossi',
    email: 'isabella.rossi@gmail.com',
    totalSpent: 12434.00,
    createdAt: '2024-09-20T10:30:00Z'
  },
  {
    id: 'cust-30',
    name: 'Northwood Property Developers',
    email: 'projects@northwooddevelopments.com',
    totalSpent: 105784.00,
    createdAt: '2024-09-10T09:00:00Z'
  },
  {
    id: 'cust-29',
    name: 'Ryan Mitchell',
    email: 'ryan.mitchell@protonmail.com',
    totalSpent: 4847.00,
    createdAt: '2024-09-01T15:00:00Z'
  },
  {
    id: 'cust-28',
    name: 'Dr. Patricia Hughes',
    email: 'patricia.hughes@medmail.com',
    totalSpent: 11505.00,
    createdAt: '2024-08-15T13:30:00Z'
  },
  {
    id: 'cust-27',
    name: 'Megan Turner',
    email: 'megan.turner@gmail.com',
    totalSpent: 13793.00,
    createdAt: '2024-08-01T10:00:00Z'
  },
  {
    id: 'cust-26',
    name: 'Summit Education Trust',
    email: 'facilities@summitedu.org',
    totalSpent: 83079.00,
    createdAt: '2024-07-20T08:00:00Z'
  },
  {
    id: 'cust-25',
    name: 'Hannah Lee',
    email: 'hannah.lee@yahoo.com',
    totalSpent: 10791.00,
    createdAt: '2024-07-10T09:30:00Z'
  }
];
