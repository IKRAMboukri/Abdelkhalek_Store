import type { Credit } from '../types';

export const mockCredits: Credit[] = [
  {
    id: 'cred-1',
    customerId: 'cust-2',
    customerName: 'Michael Chen',
    initialAmount: 5000,
    paidAmount: 2500,
    remainingBalance: 2500,
    dueDate: '2025-08-15T00:00:00Z',
    status: 'active',
    notes: 'Credit for design project materials. Monthly payments of DH 500.',
    payments: [
      { id: 'cp-1', amount: 500, paymentMethod: 'bank_transfer', paymentDate: '2025-03-15T10:00:00Z', notes: 'March payment' },
      { id: 'cp-2', amount: 500, paymentMethod: 'bank_transfer', paymentDate: '2025-04-15T09:30:00Z', notes: 'April payment' },
      { id: 'cp-3', amount: 500, paymentMethod: 'bank_transfer', paymentDate: '2025-05-15T11:00:00Z', notes: 'May payment' },
      { id: 'cp-4', amount: 500, paymentMethod: 'bank_transfer', paymentDate: '2025-06-15T10:30:00Z', notes: 'June payment' },
      { id: 'cp-5', amount: 500, paymentMethod: 'bank_transfer', paymentDate: '2025-07-15T08:00:00Z', notes: 'July payment' }
    ],
    createdAt: '2025-02-15T10:00:00Z',
    updatedAt: '2025-07-15T08:00:00Z',
    saleId: 'sale-6',
    invoiceNumber: 'INV-2025-0006'
  },
  {
    id: 'cred-2',
    customerId: 'cust-5',
    customerName: 'Corporate Office Solutions Ltd',
    initialAmount: 10000,
    paidAmount: 5200,
    remainingBalance: 4800,
    dueDate: '2025-12-31T00:00:00Z',
    status: 'active',
    notes: 'Large corporate credit line for office furniture purchases.',
    payments: [
      { id: 'cp-6', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-03-01T09:00:00Z', notes: 'Q1 payment' },
      { id: 'cp-7', amount: 1200, paymentMethod: 'bank_transfer', paymentDate: '2025-04-01T09:00:00Z', notes: 'April payment' },
      { id: 'cp-8', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-05-01T09:00:00Z', notes: 'May payment' },
      { id: 'cp-9', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-06-01T09:00:00Z', notes: 'June payment' },
      { id: 'cp-10', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-07-01T09:00:00Z', notes: 'July payment' }
    ],
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-07-01T09:00:00Z',
    saleId: 'sale-16',
    invoiceNumber: 'INV-2025-0016'
  },
  {
    id: 'cred-3',
    customerId: 'cust-3',
    customerName: 'Emily Rodriguez',
    initialAmount: 2000,
    paidAmount: 1200,
    remainingBalance: 800,
    dueDate: '2025-08-01T00:00:00Z',
    status: 'active',
    notes: 'Credit for bedroom furniture purchase.',
    payments: [
      { id: 'cp-11', amount: 400,     paymentMethod: 'bank_transfer', paymentDate: '2025-05-01T14:00:00Z', notes: 'May payment' },
      { id: 'cp-12', amount: 400,     paymentMethod: 'bank_transfer', paymentDate: '2025-06-01T14:00:00Z', notes: 'June payment' },
      { id: 'cp-13', amount: 400,     paymentMethod: 'bank_transfer', paymentDate: '2025-07-01T14:00:00Z', notes: 'July payment' }
    ],
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-07-01T14:00:00Z',
    saleId: 'sale-14',
    invoiceNumber: 'INV-2025-0014'
  },
  {
    id: 'cred-4',
    customerId: 'cust-10',
    customerName: 'Greenleaf Hotels Group',
    initialAmount: 8000,
    paidAmount: 4800,
    remainingBalance: 3200,
    dueDate: '2025-10-15T00:00:00Z',
    status: 'active',
    notes: 'Credit line for hotel chain renovation projects.',
    payments: [
      { id: 'cp-14', amount: 800, paymentMethod: 'bank_transfer', paymentDate: '2025-04-15T09:00:00Z', notes: 'April payment' },
      { id: 'cp-15', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-05-15T09:00:00Z', notes: 'May payment' },
      { id: 'cp-16', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-06-15T09:00:00Z', notes: 'June payment' },
      { id: 'cp-17', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-07-15T09:00:00Z', notes: 'July payment' },
      { id: 'cp-18', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-08-15T09:00:00Z', notes: 'August payment' }
    ],
    createdAt: '2025-03-15T08:30:00Z',
    updatedAt: '2025-08-15T09:00:00Z',
    saleId: 'sale-7',
    invoiceNumber: 'INV-2025-0007'
  },
  {
    id: 'cred-5',
    customerId: 'cust-6',
    customerName: 'Luxury Living Interiors',
    initialAmount: 3000,
    paidAmount: 1500,
    remainingBalance: 1500,
    dueDate: '2025-09-01T00:00:00Z',
    status: 'active',
    notes: 'Credit for interior design project materials.',
    payments: [
      { id: 'cp-19', amount: 500, paymentMethod: 'bank_transfer', paymentDate: '2025-06-01T10:00:00Z', notes: 'June payment' },
      { id: 'cp-20', amount: 500, paymentMethod: 'bank_transfer', paymentDate: '2025-07-01T10:00:00Z', notes: 'July payment' },
      { id: 'cp-21', amount: 500, paymentMethod: 'bank_transfer', paymentDate: '2025-08-01T10:00:00Z', notes: 'August payment' }
    ],
    createdAt: '2025-05-01T09:00:00Z',
    updatedAt: '2025-08-01T10:00:00Z',
    saleId: 'sale-18',
    invoiceNumber: 'INV-2025-0018'
  },
  {
    id: 'cred-6',
    customerId: 'cust-13',
    customerName: 'Modern Space Design Studio',
    initialAmount: 4500,
    paidAmount: 2700,
    remainingBalance: 1800,
    dueDate: '2025-11-30T00:00:00Z',
    status: 'active',
    notes: 'Studio credit for design samples and project materials.',
    payments: [
      { id: 'cp-22', amount: 600, paymentMethod: 'bank_transfer', paymentDate: '2025-05-15T11:00:00Z', notes: 'May payment' },
      { id: 'cp-23', amount: 700, paymentMethod: 'bank_transfer', paymentDate: '2025-06-15T11:00:00Z', notes: 'June payment' },
      { id: 'cp-24', amount: 700, paymentMethod: 'bank_transfer', paymentDate: '2025-07-15T11:00:00Z', notes: 'July payment' },
      { id: 'cp-25', amount: 700, paymentMethod: 'bank_transfer', paymentDate: '2025-08-15T11:00:00Z', notes: 'August payment' }
    ],
    createdAt: '2025-04-15T10:30:00Z',
    updatedAt: '2025-08-15T11:00:00Z',
    saleId: 'sale-20',
    invoiceNumber: 'INV-2025-0020'
  },
  {
    id: 'cred-7',
    customerId: 'cust-20',
    customerName: 'Parkview Senior Living',
    initialAmount: 6000,
    paidAmount: 3900,
    remainingBalance: 2100,
    dueDate: '2025-10-01T00:00:00Z',
    status: 'active',
    notes: 'Credit for senior facility furnishing project.',
    payments: [
      { id: 'cp-26', amount: 600, paymentMethod: 'bank_transfer', paymentDate: '2025-05-01T08:00:00Z', notes: 'May payment' },
      { id: 'cp-27', amount: 700, paymentMethod: 'bank_transfer', paymentDate: '2025-06-01T08:00:00Z', notes: 'June payment' },
      { id: 'cp-28', amount: 800, paymentMethod: 'bank_transfer', paymentDate: '2025-07-01T08:00:00Z', notes: 'July payment' },
      { id: 'cp-29', amount: 900, paymentMethod: 'bank_transfer', paymentDate: '2025-08-01T08:00:00Z', notes: 'August payment' },
      { id: 'cp-30', amount: 900, paymentMethod: 'bank_transfer', paymentDate: '2025-09-01T08:00:00Z', notes: 'September payment' }
    ],
    createdAt: '2025-04-01T09:00:00Z',
    updatedAt: '2025-09-01T08:00:00Z',
    saleId: 'sale-26',
    invoiceNumber: 'INV-2025-0026'
  },
  {
    id: 'cred-8',
    customerId: 'cust-22',
    customerName: 'Coastal Retreat Rentals',
    initialAmount: 7000,
    paidAmount: 7000,
    remainingBalance: 0,
    dueDate: '2025-07-15T00:00:00Z',
    status: 'paid',
    notes: 'Fully paid. Credit for rental property outdoor furniture.',
    payments: [
      { id: 'cp-31', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-03-15T09:30:00Z', notes: 'March payment' },
      { id: 'cp-32', amount: 1500, paymentMethod: 'bank_transfer', paymentDate: '2025-04-15T09:30:00Z', notes: 'April payment' },
      { id: 'cp-33', amount: 1500, paymentMethod: 'bank_transfer', paymentDate: '2025-05-15T09:30:00Z', notes: 'May payment' },
      { id: 'cp-34', amount: 1500, paymentMethod: 'bank_transfer', paymentDate: '2025-06-15T09:30:00Z', notes: 'June payment' },
      { id: 'cp-35', amount: 1500, paymentMethod: 'bank_transfer', paymentDate: '2025-07-15T09:30:00Z', notes: 'Final payment' }
    ],
    createdAt: '2025-02-15T08:00:00Z',
    updatedAt: '2025-07-15T09:30:00Z',
    saleId: 'sale-24',
    invoiceNumber: 'INV-2025-0024'
  },
  {
    id: 'cred-9',
    customerId: 'cust-26',
    customerName: 'Summit Education Trust',
    initialAmount: 8000,
    paidAmount: 3000,
    remainingBalance: 5000,
    dueDate: '2025-12-15T00:00:00Z',
    status: 'active',
    notes: 'Educational institution credit with flexible payment terms.',
    payments: [
      { id: 'cp-36', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-05-15T10:00:00Z', notes: 'May payment' },
      { id: 'cp-37', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-06-15T10:00:00Z', notes: 'June payment' },
      { id: 'cp-38', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-07-15T10:00:00Z', notes: 'July payment' }
    ],
    createdAt: '2025-04-10T08:00:00Z',
    updatedAt: '2025-07-15T10:00:00Z',
    saleId: 'sale-38',
    invoiceNumber: 'INV-2025-0038'
  },
  {
    id: 'cred-10',
    customerId: 'cust-30',
    customerName: 'Northwood Property Developers',
    initialAmount: 7500,
    paidAmount: 3000,
    remainingBalance: 4500,
    dueDate: '2025-11-01T00:00:00Z',
    status: 'active',
    notes: 'Project credit for model home furniture.',
    payments: [
      { id: 'cp-39', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-05-01T09:00:00Z', notes: 'May payment' },
      { id: 'cp-40', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-06-01T09:00:00Z', notes: 'June payment' },
      { id: 'cp-41', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-07-01T09:00:00Z', notes: 'July payment' }
    ],
    createdAt: '2025-04-01T08:30:00Z',
    updatedAt: '2025-07-01T09:00:00Z',
    saleId: 'sale-37',
    invoiceNumber: 'INV-2025-0037'
  },
  {
    id: 'cred-11',
    customerId: 'cust-19',
    customerName: 'Rachel Green',
    initialAmount: 1500,
    paidAmount: 300,
    remainingBalance: 1200,
    dueDate: '2025-09-30T00:00:00Z',
    status: 'active',
    notes: 'Credit for decor and accent pieces.',
    payments: [
      { id: 'cp-42', amount: 300,     paymentMethod: 'bank_transfer', paymentDate: '2025-07-01T15:00:00Z', notes: 'First payment' }
    ],
    createdAt: '2025-06-01T11:00:00Z',
    updatedAt: '2025-07-01T15:00:00Z',
    saleId: 'sale-41',
    invoiceNumber: 'INV-2025-0041'
  },
  {
    id: 'cred-12',
    customerId: 'cust-9',
    customerName: 'Robert Kim',
    initialAmount: 1000,
    paidAmount: 650,
    remainingBalance: 350,
    dueDate: '2025-08-01T00:00:00Z',
    status: 'active',
    notes: 'Small credit for apartment furnishing.',
    payments: [
      { id: 'cp-43', amount: 200,     paymentMethod: 'bank_transfer', paymentDate: '2025-06-01T12:00:00Z', notes: 'June' },
      { id: 'cp-44', amount: 250,     paymentMethod: 'bank_transfer', paymentDate: '2025-07-01T12:00:00Z', notes: 'July' },
      { id: 'cp-45', amount: 200,     paymentMethod: 'bank_transfer', paymentDate: '2025-07-20T12:00:00Z', notes: 'Extra payment' }
    ],
    createdAt: '2025-05-01T09:00:00Z',
    updatedAt: '2025-07-20T12:00:00Z',
    saleId: 'sale-68',
    invoiceNumber: 'INV-2025-0068'
  },
  {
    id: 'cred-13',
    customerId: 'cust-14',
    customerName: 'Olivia Martinez',
    initialAmount: 1500,
    paidAmount: 1000,
    remainingBalance: 500,
    dueDate: '2025-07-01T00:00:00Z',
    status: 'overdue',
    notes: 'Overdue payment. Follow up needed.',
    payments: [
      { id: 'cp-46', amount: 500,     paymentMethod: 'bank_transfer', paymentDate: '2025-05-01T10:00:00Z', notes: 'May payment' },
      { id: 'cp-47', amount: 500,     paymentMethod: 'bank_transfer', paymentDate: '2025-06-01T10:00:00Z', notes: 'June payment' }
    ],
    createdAt: '2025-04-05T10:00:00Z',
    updatedAt: '2025-07-01T10:00:00Z',
    saleId: 'sale-79',
    invoiceNumber: 'INV-2025-0079'
  },
  {
    id: 'cred-14',
    customerId: 'cust-23',
    customerName: 'Laura White',
    initialAmount: 1200,
    paidAmount: 450,
    remainingBalance: 750,
    dueDate: '2025-06-30T00:00:00Z',
    status: 'overdue',
    notes: 'Past due date. Second reminder sent.',
    payments: [
      { id: 'cp-48', amount: 250,     paymentMethod: 'bank_transfer', paymentDate: '2025-05-15T14:00:00Z', notes: 'First payment' },
      { id: 'cp-49', amount: 200,     paymentMethod: 'bank_transfer', paymentDate: '2025-06-15T14:00:00Z', notes: 'Second payment' }
    ],
    createdAt: '2025-04-20T11:00:00Z',
    updatedAt: '2025-06-30T14:00:00Z',
    saleId: 'sale-80',
    invoiceNumber: 'INV-2025-0080'
  },
  {
    id: 'cred-15',
    customerId: 'cust-34',
    customerName: 'Victoria Sanders',
    initialAmount: 5000,
    paidAmount: 1500,
    remainingBalance: 3500,
    dueDate: '2025-05-15T00:00:00Z',
    status: 'overdue',
    notes: 'Seriously overdue. Account has been blocked.',
    payments: [
      { id: 'cp-50', amount: 500,     paymentMethod: 'bank_transfer', paymentDate: '2025-03-15T10:00:00Z', notes: 'March payment' },
      { id: 'cp-51', amount: 500,     paymentMethod: 'bank_transfer', paymentDate: '2025-04-15T10:00:00Z', notes: 'April payment' },
      { id: 'cp-52', amount: 500,     paymentMethod: 'bank_transfer', paymentDate: '2025-05-15T10:00:00Z', notes: 'May payment' }
    ],
    createdAt: '2025-02-15T09:00:00Z',
    updatedAt: '2025-05-15T10:00:00Z',
    saleId: 'sale-89',
    invoiceNumber: 'INV-2025-0089'
  },
  {
    id: 'cred-16',
    customerId: 'cust-27',
    customerName: 'Megan Turner',
    initialAmount: 1000,
    paidAmount: 400,
    remainingBalance: 600,
    dueDate: '2025-09-01T00:00:00Z',
    status: 'active',
    notes: 'Credit for decor content creation supplies.',
    payments: [
      { id: 'cp-53', amount: 200,     paymentMethod: 'bank_transfer', paymentDate: '2025-07-01T16:00:00Z', notes: 'July payment' },
      { id: 'cp-54', amount: 200,     paymentMethod: 'bank_transfer', paymentDate: '2025-08-01T16:00:00Z', notes: 'August payment' }
    ],
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2025-08-01T16:00:00Z',
    saleId: 'sale-43',
    invoiceNumber: 'INV-2025-0043'
  },
  {
    id: 'cred-17',
    customerId: 'cust-32',
    customerName: 'Elite Coworking Spaces',
    initialAmount: 5500,
    paidAmount: 2700,
    remainingBalance: 2800,
    dueDate: '2025-12-01T00:00:00Z',
    status: 'active',
    notes: 'Credit for coworking space furniture.',
    payments: [
      { id: 'cp-55', amount: 700, paymentMethod: 'bank_transfer', paymentDate: '2025-06-01T09:00:00Z', notes: 'June payment' },
      { id: 'cp-56', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-07-01T09:00:00Z', notes: 'July payment' },
      { id: 'cp-57', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-08-01T09:00:00Z', notes: 'August payment' }
    ],
    createdAt: '2025-05-01T08:00:00Z',
    updatedAt: '2025-08-01T09:00:00Z',
    saleId: 'sale-54',
    invoiceNumber: 'INV-2025-0054'
  },
  {
    id: 'cred-18',
    customerId: 'cust-33',
    customerName: 'Benjamin Cooper',
    initialAmount: 600,
    paidAmount: 400,
    remainingBalance: 200,
    dueDate: '2025-08-30T00:00:00Z',
    status: 'active',
    notes: 'Small credit for art studio supplies.',
    payments: [
      { id: 'cp-58', amount: 200,     paymentMethod: 'bank_transfer', paymentDate: '2025-07-15T12:00:00Z', notes: 'First payment' },
      { id: 'cp-59', amount: 200,     paymentMethod: 'bank_transfer', paymentDate: '2025-08-15T12:00:00Z', notes: 'Second payment' }
    ],
    createdAt: '2025-07-01T09:00:00Z',
    updatedAt: '2025-08-15T12:00:00Z',
    saleId: 'sale-81',
    invoiceNumber: 'INV-2025-0081'
  },
  {
    id: 'cred-19',
    customerId: 'cust-22',
    customerName: 'Coastal Retreat Rentals',
    initialAmount: 4000,
    paidAmount: 4000,
    remainingBalance: 0,
    dueDate: '2025-06-01T00:00:00Z',
    status: 'paid',
    notes: 'Fully paid off. Credit closed.',
    payments: [
      { id: 'cp-60', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-03-01T08:00:00Z', notes: 'March' },
      { id: 'cp-61', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-04-01T08:00:00Z', notes: 'April' },
      { id: 'cp-62', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-05-01T08:00:00Z', notes: 'May' },
      { id: 'cp-63', amount: 1000, paymentMethod: 'bank_transfer', paymentDate: '2025-06-01T08:00:00Z', notes: 'Final' }
    ],
    createdAt: '2025-02-01T09:00:00Z',
    updatedAt: '2025-06-01T08:00:00Z',
    saleId: 'sale-42',
    invoiceNumber: 'INV-2025-0042'
  },
  {
    id: 'cred-20',
    customerId: 'cust-3',
    customerName: 'Emily Rodriguez',
    initialAmount: 2000,
    paidAmount: 2000,
    remainingBalance: 0,
    dueDate: '2025-05-01T00:00:00Z',
    status: 'paid',
    notes: 'Fully paid.',
    payments: [
      { id: 'cp-64', amount: 500,     paymentMethod: 'bank_transfer', paymentDate: '2025-02-01T10:00:00Z', notes: 'Feb' },
      { id: 'cp-65', amount: 500,     paymentMethod: 'bank_transfer', paymentDate: '2025-03-01T10:00:00Z', notes: 'Mar' },
      { id: 'cp-66', amount: 500,     paymentMethod: 'bank_transfer', paymentDate: '2025-04-01T10:00:00Z', notes: 'Apr' },
      { id: 'cp-67', amount: 500,     paymentMethod: 'bank_transfer', paymentDate: '2025-05-01T10:00:00Z', notes: 'Final' }
    ],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-05-01T10:00:00Z',
    saleId: 'sale-3',
    invoiceNumber: 'INV-2025-0003'
  },
  {
    id: 'cred-21',
    customerId: 'cust-10',
    customerName: 'Greenleaf Hotels Group',
    initialAmount: 6000,
    paidAmount: 6000,
    remainingBalance: 0,
    dueDate: '2025-06-15T00:00:00Z',
    status: 'paid',
    notes: 'Fully paid. Credit settled.',
    payments: [
      { id: 'cp-68', amount: 1200, paymentMethod: 'bank_transfer', paymentDate: '2025-03-15T08:00:00Z', notes: 'Mar' },
      { id: 'cp-69', amount: 1200, paymentMethod: 'bank_transfer', paymentDate: '2025-04-15T08:00:00Z', notes: 'Apr' },
      { id: 'cp-70', amount: 1200, paymentMethod: 'bank_transfer', paymentDate: '2025-05-15T08:00:00Z', notes: 'May' },
      { id: 'cp-71', amount: 1200, paymentMethod: 'bank_transfer', paymentDate: '2025-06-15T08:00:00Z', notes: 'Jun' },
      { id: 'cp-72', amount: 1200, paymentMethod: 'bank_transfer', paymentDate: '2025-06-20T08:00:00Z', notes: 'Final' }
    ],
    createdAt: '2025-02-15T08:30:00Z',
    updatedAt: '2025-06-20T08:00:00Z',
    saleId: 'sale-15',
    invoiceNumber: 'INV-2025-0015'
  },
  {
    id: 'cred-22',
    customerId: 'cust-34',
    customerName: 'Victoria Sanders',
    initialAmount: 3000,
    paidAmount: 0,
    remainingBalance: 3000,
    dueDate: '2025-04-01T00:00:00Z',
    status: 'cancelled',
    notes: 'Credit cancelled due to non-payment and account issues.',
    payments: [],
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-04-15T10:00:00Z'
  }
];
