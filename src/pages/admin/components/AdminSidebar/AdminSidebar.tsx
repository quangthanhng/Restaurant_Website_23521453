import { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppContext } from '../../../../contexts/app.context'
import { clearLS } from '../../../../utils/auth'

interface MenuItem {
  path: string
  icon: React.ReactNode
  label: string
}

const menuItems: MenuItem[] = [
  {
    path: '/admin/products',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
      </svg>
    ),
    label: 'Quản lý sản phẩm'
  },
  {
    path: '/admin/categories',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
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
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' />
      </svg>
    ),
    label: 'Quản lý đơn hàng'
  },
  {
    path: '/admin/users',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
      </svg>
    ),
    label: 'Quản lý người dùng'
  },
  {
    path: '/admin/coupons',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' />
      </svg>
    ),
    label: 'Quản lý mã giảm giá'
  },
  {
    path: '/admin/blogs',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
      </svg>
    ),
    label: 'Quản lý bài viết'
  },
  {
    path: '/admin/contacts',
    icon: (
      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
      </svg>
    ),
    label: 'Quản lý liên hệ'
  }
]

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, reset } = useContext(AppContext)

  const handleLogout = () => {
    clearLS()
    reset()
    navigate('/')
  }

  return (
    <aside className='fixed left-0 top-0 z-40 h-screen w-64 bg-neutral-950 text-white border-r border-neutral-800'>
      <div className='flex h-full flex-col'>
        {/* Logo */}
        <div className='flex items-center gap-3 px-6 py-5 border-b border-neutral-800'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-savoria-gold/20'>
            <svg className='h-6 w-6 text-savoria-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
            </svg>
          </div>
          <span className='text-lg font-semibold text-savoria-gold'>TS Restaurant</span>
        </div>

        {/* Menu Items */}
        <nav className='flex-1 space-y-1 px-3 py-4'>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                  ? 'bg-savoria-gold/20 text-savoria-gold'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-savoria-gold'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className='border-t border-neutral-800 p-4'>
          <div className='mb-3 rounded-lg bg-neutral-800/50 p-3'>
            <p className='text-xs text-neutral-500'>Đang đăng nhập với</p>
            <div className='mt-2 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-savoria-gold/20'>
                {profile?.avatar ? (
                  <img src={profile.avatar} alt='Avatar' className='h-full w-full rounded-full object-cover' />
                ) : (
                  <svg className='h-5 w-5 text-savoria-gold' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                  </svg>
                )}
              </div>
              <div>
                <p className='font-medium text-amber-50'>{profile?.username || 'Admin'}</p>
                <p className='text-xs text-neutral-500'>Quản trị viên</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className='flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 transition-all hover:bg-neutral-800 hover:text-red-400'
          >
            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
            </svg>
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  )
}
