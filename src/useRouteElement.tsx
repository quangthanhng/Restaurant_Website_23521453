import { Navigate, useRoutes } from 'react-router-dom'
import path from './constants/path'
import Login from './pages/Login'
import Register from './pages/Register'
import Homepage from './pages/homepage'
import AdminLayout from './pages/admin/AdminLayout'
import MainLayout from './layouts/MainLayout'
import RegisterLayout from './layouts/RegisterLayout'
import Menu from './pages/Menu'
import About from './pages/About'
import Blog from './pages/Blog'
import Booking from './pages/Booking'
import Payment from './pages/Payment'
import ForgotPassword from './pages/ForgotPassword'
import NotFound from './pages/NotFound'
import { AdminRoute, RejectedRoute, ProtectedRoute } from './components/ProtectedRoute'
import ProductManagement from './pages/admin/pages/ProductManagement'
import TableManagement from './pages/admin/pages/TableManagement'
import CategoryManagement from './pages/admin/pages/CategoryManagement'
import DiscountManagement from './pages/admin/pages/DiscountManagement'
import BlogManagement from './pages/admin/pages/BlogManagement'
import ContactManagement from './pages/admin/pages/ContactManagement'
import OrderManagement from './pages/admin/pages/OrderManagement'

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
    // Admin Routes - Chỉ cho admin
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
              element: <Navigate to={path.adminProducts} replace />
            },
            {
              path: path.adminProducts,
              element: <ProductManagement />
            },
            {
              path: path.adminTables,
              element: <TableManagement />
            },
            {
              path: path.adminCategories,
              element: <CategoryManagement />
            },
            {
              path: path.adminOrders,
              element: <OrderManagement />
            },
            {
              path: path.adminCoupons,
              element: <DiscountManagement />
            },
            {
              path: path.adminBlogs,
              element: <BlogManagement />
            },
            {
              path: path.adminContacts,
              element: <ContactManagement />
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
          path: path.profile,
          element: (
            <MainLayout>
              <div>Profile Page (Coming Soon)</div>
            </MainLayout>
          )
        }
      ]
    },
    {
      path: path.forgot_password,
      element: (
        <MainLayout>
          <ForgotPassword />
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
