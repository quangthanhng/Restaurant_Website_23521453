import { Suspense, lazy } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import path from './constants/path'
import Login from './pages/Login'
import Register from './pages/Register'
import Homepage from './pages/homepage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/pages/AdminLogin'
import MainLayout from './layouts/MainLayout'
import RegisterLayout from './layouts/RegisterLayout'
import Menu from './pages/Menu'
import DishDetail from './pages/DishDetail'
import About from './pages/About'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import Booking from './pages/Booking'
import Payment from './pages/Payment'
import PaymentResult from './pages/PaymentResult'
import Checkout from './pages/Checkout'
import Cart from './pages/Cart'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOtp from './pages/VerifyOtp'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import OrderHistory from './pages/OrderHistory'
import { AdminRoute, RejectedRoute, ProtectedRoute } from './components/ProtectedRoute'
import PageLoader from './pages/admin/components/PageLoader'

// Lazy load admin pages for better performance
const ProductManagement = lazy(() => import('./pages/admin/pages/ProductManagement'))
const TableManagement = lazy(() => import('./pages/admin/pages/TableManagement'))
const CategoryManagement = lazy(() => import('./pages/admin/pages/CategoryManagement'))
const DiscountManagement = lazy(() => import('./pages/admin/pages/DiscountManagement'))
const BlogManagement = lazy(() => import('./pages/admin/pages/BlogManagement'))
const ContactManagement = lazy(() => import('./pages/admin/pages/ContactManagement'))
const OrderManagement = lazy(() => import('./pages/admin/pages/OrderManagement'))
const Statistics = lazy(() => import('./pages/admin/pages/Statistics'))

export default function useRouteElement() {
  const routeElements = useRoutes([
    {
      path: path.home,
      element: (
        <MainLayout>
          <Homepage />
        </MainLayout>
      )
    },
    // Admin Login - Trang đăng nhập riêng cho admin
    {
      path: path.adminLogin,
      element: <AdminLogin />
    },
    // Rejected Routes - Chỉ cho user chưa đăng nhập
    {
      path: '',
      element: <RejectedRoute />,
      children: [
        {
          path: path.login,
          element: (
            <RegisterLayout>
              <Login />
            </RegisterLayout>
          )
        },
        {
          path: path.register,
          element: (
            <RegisterLayout>
              <Register />
            </RegisterLayout>
          )
        }
      ]
    },
    // Admin Routes - Chỉ cho admin (phải đăng nhập qua /admin/login)
    {
      path: '',
      element: <AdminRoute />,
      children: [
        {
          path: path.admin,
          element: <AdminLayout />,
          children: [
            {
              index: true,
              element: <Navigate to={path.adminStatistics} replace />
            },
            {
              path: path.adminStatistics,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <Statistics />
                </Suspense>
              )
            },
            {
              path: path.adminProducts,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <ProductManagement />
                </Suspense>
              )
            },
            {
              path: path.adminTables,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <TableManagement />
                </Suspense>
              )
            },
            {
              path: path.adminCategories,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <CategoryManagement />
                </Suspense>
              )
            },
            {
              path: path.adminOrders,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <OrderManagement />
                </Suspense>
              )
            },
            {
              path: path.adminCoupons,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <DiscountManagement />
                </Suspense>
              )
            },
            {
              path: path.adminBlogs,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <BlogManagement />
                </Suspense>
              )
            },
            {
              path: path.adminContacts,
              element: (
                <Suspense fallback={<PageLoader />}>
                  <ContactManagement />
                </Suspense>
              )
            }
          ]
        }
      ]
    },
    {
      path: path.menu,
      element: (
        <MainLayout>
          <Menu />
        </MainLayout>
      )
    },
    {
      path: path.dishDetail,
      element: (
        <MainLayout>
          <DishDetail />
        </MainLayout>
      )
    },
    {
      path: path.blogDetail,
      element: (
        <MainLayout>
          <Suspense>
            <BlogDetail />
          </Suspense>
        </MainLayout>
      )
    },
    {
      path: path.about,
      element: (
        <MainLayout>
          <About />
        </MainLayout>
      )
    },
    {
      path: path.blog,
      element: (
        <MainLayout>
          <Blog />
        </MainLayout>
      )
    },
    // Protected Routes - Yêu cầu đăng nhập
    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        {
          path: path.booking,
          element: (
            <MainLayout>
              <Booking />
            </MainLayout>
          )
        },
        {
          path: path.payment,
          element: (
            <MainLayout>
              <Payment />
            </MainLayout>
          )
        },
        {
          path: path.cart,
          element: (
            <MainLayout>
              <Cart />
            </MainLayout>
          )
        },
        {
          path: path.checkout,
          element: (
            <MainLayout>
              <Checkout />
            </MainLayout>
          )
        },
        {
          path: path.profile,
          element: (
            <MainLayout>
              <Profile />
            </MainLayout>
          )
        },
        {
          path: path.orders,
          element: (
            <MainLayout>
              <OrderHistory />
            </MainLayout>
          )
        }
      ]
    },
    {
      path: path.forgot_password,
      element: (
        <RegisterLayout>
          <ForgotPassword />
        </RegisterLayout>
      )
    },
    {
      path: path.verify_otp,
      element: (
        <RegisterLayout>
          <VerifyOtp />
        </RegisterLayout>
      )
    },
    {
      path: path.reset_password,
      element: (
        <RegisterLayout>
          <ResetPassword />
        </RegisterLayout>
      )
    },
    {
      path: path.paymentResult,
      element: (
        <MainLayout>
          <PaymentResult />
        </MainLayout>
      )
    },
    {
      path: path.paymentResultLegacy,
      element: (
        <MainLayout>
          <PaymentResult />
        </MainLayout>
      )
    },
    {
      path: path.notFound,
      element: <NotFound />
    }
  ])
  return routeElements
}
