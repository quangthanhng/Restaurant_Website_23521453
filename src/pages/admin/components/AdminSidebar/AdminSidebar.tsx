import { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppContext } from '../../../../contexts/app.context'
import { clearLS } from '../../../../utils/auth'

interface MenuItem {
  path: string
  icon: React.ReactNode
  label: string
}

const menuItems: MenuItem[] = [
  {
    path: '/admin/statistics',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        />
      </svg>
    ),
    label: 'Thống kê doanh số'
  },
  {
    path: '/admin/products',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
        />
      </svg>
    ),
    label: 'Quản lý món ăn'
  },
  {
    path: '/admin/categories',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
        />
      </svg>
    ),
    label: 'Quản lý danh mục'
  },
  {
    path: '/admin/tables',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 10h16M4 14h16M4 18h16' />
      </svg>
    ),
    label: 'Quản lý bàn'
  },
  {
    path: '/admin/orders',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
        />
      </svg>
    ),
    label: 'Quản lý đơn hàng'
  },
  {
    path: '/admin/coupons',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
        />
      </svg>
    ),
    label: 'Quản lý mã giảm giá'
  },
  {
    path: '/admin/blogs',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
        />
      </svg>
    ),
    label: 'Quản lý bài viết'
  },
  {
    path: '/admin/contacts',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        />
      </svg>
    ),
    label: 'Quản lý liên hệ'
  }
]

export default function AdminSidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, reset } = useContext(AppContext)

  const handleLogout = () => {
    clearLS()
    reset()
    navigate('/')
  }

  // Desktop sidebar
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className='lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm'
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className='lg:hidden fixed left-0 top-0 z-50 h-screen w-64 bg-white text-gray-900 border-r border-gray-200'
      >
        <div className='flex h-full flex-col'>
          {/* Logo with close button */}
          <div className='flex items-center justify-between gap-3 px-6 py-5 border-b border-gray-200'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20'>
                <svg className='h-6 w-6 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <span className='text-lg font-semibold text-amber-600'>TS Restaurant</span>
            </div>
            <button
              onClick={onClose}
              className='p-2 rounded-lg text-gray-500 hover:bg-stone-50 hover:text-gray-900 transition-colors'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <nav className='flex-1 space-y-1 px-3 py-4 overflow-y-auto'>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              return (
                <Link key={item.path} to={item.path} onClick={onClose} className='block relative'>
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: isActive ? 'rgba(245, 158, 11, 0.2)' : 'transparent'
                    }}
                    whileHover={{
                      backgroundColor: isActive ? 'rgba(245, 158, 11, 0.25)' : 'rgba(250, 250, 249, 1)',
                      x: 2
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                      isActive ? 'text-amber-600' : 'text-gray-500 hover:text-amber-600'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </motion.div>
                </Link>
              )
            })}
          </nav>
          {/* User Info */}
          <div className='border-t border-gray-200 p-4'>
            <div className='mb-3 rounded-lg bg-stone-50/50 p-3'>
              <p className='text-xs text-gray-400'>Đang đăng nhập với</p>
              <div className='mt-2 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20'>
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt='Avatar' className='h-full w-full rounded-full object-cover' />
                  ) : (
                    <svg className='h-5 w-5 text-amber-600' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                    </svg>
                  )}
                </div>
                <div>
                  <p className='font-medium text-gray-900'>{profile?.username || 'Admin'}</p>
                  <p className='text-xs text-gray-400'>Quản trị viên</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className='flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-500 transition-all hover:bg-stone-50 hover:text-amber-400'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside className='hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 bg-white text-gray-900 border-r border-gray-200'>
        <div className='flex h-full flex-col'>
          {/* Logo */}
          <div className='flex items-center gap-3 px-6 py-5 border-b border-gray-200'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20'>
              <svg className='h-6 w-6 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
              </svg>
            </div>
            <span className='text-lg font-semibold text-amber-600'>TS Restaurant</span>
          </div>

          {/* Menu Items */}
          <nav className='flex-1 space-y-1 px-3 py-4'>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              return (
                <Link key={item.path} to={item.path} className='block relative'>
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: isActive ? 'rgba(245, 158, 11, 0.2)' : 'transparent'
                    }}
                    whileHover={{
                      backgroundColor: isActive ? 'rgba(245, 158, 11, 0.25)' : 'rgba(250, 250, 249, 1)',
                      x: 2
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                      isActive ? 'text-amber-600' : 'text-gray-500 hover:text-amber-600'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className='border-t border-gray-200 p-4'>
            <div className='mb-3 rounded-lg bg-stone-50/50 p-3'>
              <p className='text-xs text-gray-400'>Đang đăng nhập với</p>
              <div className='mt-2 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20'>
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt='Avatar' className='h-full w-full rounded-full object-cover' />
                  ) : (
                    <svg className='h-5 w-5 text-amber-600' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                    </svg>
                  )}
                </div>
                <div>
                  <p className='font-medium text-gray-900'>{profile?.username || 'Admin'}</p>
                  <p className='text-xs text-gray-400'>Quản trị viên</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className='flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-500 transition-all hover:bg-stone-50 hover:text-amber-400'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
