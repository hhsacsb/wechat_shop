import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardPage from './pages/Dashboard'
import ProductListPage from './pages/ProductList'
import ProductFormPage from './pages/ProductForm'
import CategoryListPage from './pages/CategoryList'
import OrderListPage from './pages/OrderList'
import OrderDetailPage from './pages/OrderDetail'
import UserListPage from './pages/UserList'
import AfterSaleListPage from './pages/AfterSaleList'
import CouponListPage from './pages/CouponList'
import BannerListPage from './pages/BannerList'
import BannerFormPage from './pages/BannerForm'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="categories" element={<CategoryListPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/add" element={<ProductFormPage />} />
        <Route path="products/edit/:id" element={<ProductFormPage />} />
        <Route path="banners" element={<BannerListPage />} />
        <Route path="banners/add" element={<BannerFormPage />} />
        <Route path="banners/edit/:id" element={<BannerFormPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="users" element={<UserListPage />} />
        <Route path="after-sales" element={<AfterSaleListPage />} />
        <Route path="coupons" element={<CouponListPage />} />
      </Route>
    </Routes>
  )
}

export default App
