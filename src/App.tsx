import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'

const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'))
const Dashboard = lazy(() => import('@/pages/Dashboard').then((module) => ({ default: module.Dashboard })))
const ProductList = lazy(() => import('@/pages/Products/ProductList').then((module) => ({ default: module.ProductList })))
const AddProduct = lazy(() => import('@/pages/Products/AddProduct').then((module) => ({ default: module.AddProduct })))
const ProductDetail = lazy(() => import('@/pages/Products/ProductDetail').then((module) => ({ default: module.ProductDetail })))
const CategoryList = lazy(() => import('@/pages/Categories/CategoryList').then((module) => ({ default: module.CategoryList })))
const CustomerList = lazy(() => import('@/pages/Customers/CustomerList').then((module) => ({ default: module.CustomerList })))
const CustomerDetail = lazy(() => import('@/pages/Customers/CustomerDetail').then((module) => ({ default: module.CustomerDetail })))
const SalesList = lazy(() => import('@/pages/Sales/SalesList').then((module) => ({ default: module.SalesList })))
const NewSale = lazy(() => import('@/pages/Sales/NewSale').then((module) => ({ default: module.NewSale })))
const InvoiceList = lazy(() => import('@/pages/Invoices/InvoiceList').then((module) => ({ default: module.InvoiceList })))
const InvoiceDetail = lazy(() => import('@/pages/Invoices/InvoiceDetail').then((module) => ({ default: module.InvoiceDetail })))
const CreditList = lazy(() => import('@/pages/Credits/CreditList').then((module) => ({ default: module.CreditList })))
const CreditDetail = lazy(() => import('@/pages/Credits/CreditDetail').then((module) => ({ default: module.CreditDetail })))
const CreditManage = lazy(() => import('@/pages/Credits/CreditManage').then((module) => ({ default: module.CreditManage })))
const Settings = lazy(() => import('@/pages/Settings/Settings').then((module) => ({ default: module.Settings })))

function RouteFallback() {
  return (
    <div className="flex min-h-48 items-center justify-center" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()
  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
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
      </Suspense>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
