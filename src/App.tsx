import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreLayout } from '@/components/layout/StoreLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AdminRoute } from '@/routes/AdminRoute'
import { SplashScreen } from '@/components/SplashScreen'
import HomePage from '@/pages/HomePage'
import ShopPage from '@/pages/ShopPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import OrderConfirmationPage from '@/pages/OrderConfirmationPage'
import AccountPage from '@/pages/AccountPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import WishlistPage from '@/pages/WishlistPage'
import NotificationsPage from '@/pages/NotificationsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminProducts from '@/pages/admin/Products'
import AdminProductForm from '@/pages/admin/ProductForm'
import AdminCategories from '@/pages/admin/Categories'
import AdminOrders from '@/pages/admin/Orders'
import AdminOrderDetail from '@/pages/admin/OrderDetail'
import AdminCustomers from '@/pages/admin/Customers'
import AdminReviews from '@/pages/admin/Reviews'
import AdminInventory from '@/pages/admin/Inventory'
import AdminSettings from '@/pages/admin/Settings'

const SPLASH_KEY = 'kulu_splash_shown'

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only once per browser session
    if (typeof window === 'undefined') return true
    return !sessionStorage.getItem(SPLASH_KEY)
  })

  const handleSplashFinish = useCallback(() => {
    sessionStorage.setItem(SPLASH_KEY, '1')
    setShowSplash(false)
  }, [])

  // Safety: never block the app if something goes wrong with the timer
  useEffect(() => {
    if (!showSplash) return
    const safety = setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, '1')
      setShowSplash(false)
    }, 3500)
    return () => clearTimeout(safety)
  }, [showSplash])

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <BrowserRouter>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          <Route path="admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
