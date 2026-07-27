import type { Notification } from '../types';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Wooden TV Stand (prod-13) is out of stock. Minimum stock level is 4 units.',
    read: false,
    link: '/products/prod-13',
    createdAt: '2025-07-05T08:30:00Z'
  },
  {
    id: 'notif-2',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Queen Headboard with LED Lights (prod-26) is discontinued but still has 0 stock remaining.',
    read: false,
    link: '/products/prod-26',
    createdAt: '2025-07-05T08:30:00Z'
  },
  {
    id: 'notif-3',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Sun Lounger Adjustable (prod-59) is out of stock. Minimum stock level is 5 units.',
    read: false,
    link: '/products/prod-59',
    createdAt: '2025-07-04T10:15:00Z'
  },
  {
    id: 'notif-4',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Decorative Wall Clock (prod-91) is out of stock. Consider restocking.',
    read: false,
    link: '/products/prod-91',
    createdAt: '2025-07-04T10:15:00Z'
  },
  {
    id: 'notif-5',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Bathroom Mirror LED (prod-73) is out of stock. Minimum stock level is 4 units.',
    read: true,
    link: '/products/prod-73',
    createdAt: '2025-07-03T09:00:00Z'
  },
  {
    id: 'notif-6',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Office Partition Screen (prod-47) is out of stock and marked inactive.',
    read: true,
    link: '/products/prod-47',
    createdAt: '2025-07-02T11:30:00Z'
  },
  {
    id: 'notif-7',
    type: 'credit_reminder',
    title: 'Credit Payment Due',
    message: 'Olivia Martinez (cust-14) has an overdue credit of DH 500. Payment was due on July 1, 2025.',
    read: false,
    link: '/credits/cred-13',
    createdAt: '2025-07-06T06:00:00Z'
  },
  {
    id: 'notif-8',
    type: 'credit_reminder',
    title: 'Credit Payment Due',
    message: 'Laura White (cust-23) has an overdue credit balance of DH 750. Second reminder sent.',
    read: false,
    link: '/credits/cred-14',
    createdAt: '2025-07-05T06:00:00Z'
  },
  {
    id: 'notif-9',
    type: 'credit_reminder',
    title: 'Credit Payment Due',
    message: 'Victoria Sanders (cust-34) has an overdue credit of DH 3,500. Account has been blocked.',
    read: true,
    link: '/credits/cred-15',
    createdAt: '2025-07-01T06:00:00Z'
  },
  {
    id: 'notif-10',
    type: 'credit_reminder',
    title: 'Upcoming Credit Payment',
    message: 'Robert Kim (cust-9) has a credit payment of DH 350 due on August 1, 2025.',
    read: false,
    link: '/credits/cred-12',
    createdAt: '2025-07-06T06:00:00Z'
  },
  {
    id: 'notif-11',
    type: 'credit_reminder',
    title: 'Upcoming Credit Payment',
    message: 'Michael Chen (cust-2) has a credit payment of DH 2,500 due on August 15, 2025.',
    read: false,
    link: '/credits/cred-1',
    createdAt: '2025-07-06T06:00:00Z'
  },
  {
    id: 'notif-12',
    type: 'new_sale',
    title: 'New Sale Completed',
    message: 'Sarah Johnson (cust-1) made a purchase of DH 1,908. Invoice INV-2025-0085.',
    read: false,
    link: '/sales/sale-85',
    createdAt: '2025-07-06T10:00:00Z'
  },
  {
    id: 'notif-13',
    type: 'new_sale',
    title: 'New Sale Completed',
    message: 'Nathan Brooks (cust-21) made a purchase of DH 1,172. Invoice INV-2025-0084.',
    read: false,
    link: '/sales/sale-84',
    createdAt: '2025-07-05T09:00:00Z'
  },
  {
    id: 'notif-14',
    type: 'new_sale',
    title: 'New Sale Completed',
    message: 'Amanda Foster (cust-8) made a purchase of DH 1,132. Invoice INV-2025-0083.',
    read: true,
    link: '/sales/sale-83',
    createdAt: '2025-07-04T12:00:00Z'
  },
  {
    id: 'notif-15',
    type: 'new_sale',
    title: 'New Sale Completed',
    message: 'Benjamin Cooper (cust-33) made a purchase of DH 276. Invoice INV-2025-0081.',
    read: true,
    link: '/sales/sale-81',
    createdAt: '2025-07-02T10:30:00Z'
  },
  {
    id: 'notif-16',
    type: 'new_sale',
    title: 'New Sale Completed',
    message: 'Laura White (cust-23) made a purchase of DH 593. Invoice INV-2025-0080.',
    read: true,
    link: '/sales/sale-80',
    createdAt: '2025-07-01T11:00:00Z'
  },
  {
    id: 'notif-17',
    type: 'new_sale',
    title: 'New Sale Pending',
    message: 'Olivia Martinez (cust-14) has a pending order of DH 411. Invoice INV-2025-0090.',
    read: false,
    link: '/sales/sale-90',
    createdAt: '2025-07-06T08:00:00Z'
  },
  {
    id: 'notif-18',
    type: 'new_sale',
    title: 'New Sale Pending',
    message: 'Victoria Sanders (cust-34) has a pending order of DH 1,337. Invoice INV-2025-0078.',
    read: false,
    link: '/sales/sale-78',
    createdAt: '2025-06-30T14:00:00Z'
  },
  {
    id: 'notif-19',
    type: 'system',
    title: 'Monthly Report Ready',
    message: 'The June 2025 sales report has been generated. Total revenue: DH 45,892.',
    read: false,
    link: '/reports',
    createdAt: '2025-07-01T00:00:00Z'
  },
  {
    id: 'notif-20',
    type: 'system',
    title: 'System Backup Complete',
    message: 'Daily system backup completed successfully at 3:00 AM. All data has been secured.',
    read: true,
    link: '',
    createdAt: '2025-07-06T03:00:00Z'
  },
  {
    id: 'notif-21',
    type: 'system',
    title: 'Supplier Restock Reminder',
    message: '5 products are below minimum stock levels. Please review inventory and place supplier orders.',
    read: false,
    link: '/inventory',
    createdAt: '2025-07-06T07:00:00Z'
  },
  {
    id: 'notif-22',
    type: 'system',
    title: 'New User Registration',
    message: 'A new admin account has been created for the store manager. Please verify permissions.',
    read: true,
    link: '/settings/users',
    createdAt: '2025-06-28T14:00:00Z'
  },
  {
    id: 'notif-23',
    type: 'credit_reminder',
    title: 'Credit Payment Received',
    message: 'Benjamin Cooper (cust-33) made a credit payment of DH 200. Remaining balance: DH 200.',
    read: true,
    link: '/credits/cred-18',
    createdAt: '2025-07-05T12:00:00Z'
  },
  {
    id: 'notif-24',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Microwave Cart Stand (prod-67) is out of stock and marked inactive.',
    read: false,
    link: '/products/prod-67',
    createdAt: '2025-07-03T14:00:00Z'
  },
  {
    id: 'notif-25',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Large Sectional Sofa (prod-7) has only 6 units remaining. Minimum stock is 3.',
    read: true,
    link: '/products/prod-7',
    createdAt: '2025-06-30T10:00:00Z'
  },
  {
    id: 'notif-27',
    type: 'credit_reminder',
    title: 'Credit Payment Received',
    message: 'Megan Turner (cust-27) made a credit payment of DH 200. Remaining balance: DH 600.',
    read: false,
    link: '/credits/cred-16',
    createdAt: '2025-07-06T16:00:00Z'
  }
];
