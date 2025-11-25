import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AppContext } from '../../contexts/app.context'
import path from '../../constants/path'

/**
 * ProtectedRoute - Bảo vệ các route yêu cầu đăng nhập
 * Nếu chưa đăng nhập -> redirect về trang login
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)

  return isAuthenticated ? <Outlet /> : <Navigate to={path.login} replace />
}

/**
 * RejectedRoute - Ngăn user đã đăng nhập truy cập
 * Nếu đã đăng nhập -> redirect về trang chủ
 * Dùng cho: login, register
 */
export function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)

  return !isAuthenticated ? <Outlet /> : <Navigate to={path.home} replace />
}

/**
 * AdminRoute - Bảo vệ các route chỉ dành cho admin
 * Nếu chưa đăng nhập -> redirect về trang login
 * Nếu đã đăng nhập nhưng không phải admin -> hiện trang 404
 */
export function AdminRoute() {
  const { isAuthenticated, profile } = useContext(AppContext)

  if (!isAuthenticated) {
    return <Navigate to={path.login} replace />
  }

  if (!profile?.isAdmin) {
    return <Navigate to={path.home} replace />
  }

  return <Outlet />
}
