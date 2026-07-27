import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toast'
import Layout from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { ProductList } from '@/pages/Products/ProductList'
import { AddProduct } from '@/pages/Products/AddProduct'
import { ProductDetail } from '@/pages/Products/ProductDetail'
import { CategoryList } from '@/pages/Categories/CategoryList'
import { CustomerList } from '@/pages/Customers/CustomerList'
import { CustomerDetail } from '@/pages/Customers/CustomerDetail'
import { SalesList } from '@/pages/Sales/SalesList'
import { NewSale } from '@/pages/Sales/NewSale'
import { InvoiceList } from '@/pages/Invoices/InvoiceList'
import { InvoiceDetail } from '@/pages/Invoices/InvoiceDetail'
import { CreditList } from '@/pages/Credits/CreditList'
import { CreditDetail } from '@/pages/Credits/CreditDetail'
import { CreditManage } from '@/pages/Credits/CreditManage'
import { Settings } from '@/pages/Settings/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<AddProduct />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/sales" element={<SalesList />} />
            <Route path="/sales/new" element={<NewSale />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/credits" element={<CreditList />} />
            <Route path="/credits/new" element={<CreditManage />} />
            <Route path="/credits/:id" element={<CreditDetail />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
