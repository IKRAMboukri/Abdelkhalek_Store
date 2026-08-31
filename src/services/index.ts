import { InvoiceService } from './api/InvoiceService';
import { ProductService } from './api/ProductService';
import { CategoryService } from './api/CategoryService';
import { CustomerService } from './api/CustomerService';
import { SaleService } from './api/SaleService';
import { CreditService } from './api/CreditService';
import { PaymentService } from './api/PaymentService';
import { NotificationService } from './api/NotificationService';
import { SettingsService } from './api/SettingsService';
import { DashboardService } from './api/DashboardService';
import { AuthService } from './api/AuthService';

export type { AuthUser } from './api/AuthService';

export const invoiceService = new InvoiceService();
export const productService = new ProductService();
export const categoryService = new CategoryService();
export const customerService = new CustomerService();
export const saleService = new SaleService();
export const creditService = new CreditService();
export const paymentService = new PaymentService();
export const notificationService = new NotificationService();
export const settingsService = new SettingsService();
export const dashboardService = new DashboardService();
export const authService = new AuthService();
