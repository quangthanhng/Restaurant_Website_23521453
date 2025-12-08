import { useState, useRef, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import path from '../../constants/path'
import { AppContext } from '../../contexts/app.context'
import { clearLS } from '../../utils/auth'

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isAuthenticated, profile, reset } = useContext(AppContext)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle logout
  const handleLogout = () => {
    clearLS()
    reset()
    setIsOpen(false)
    navigate(path.home)
  }

  return (
    <div className='relative' ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-300 bg-stone-100 transition-all hover:border-amber-500 hover:bg-stone-200'
        aria-label='User menu'
      >
        {isAuthenticated && profile?.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.username || 'User'}
            className='h-full w-full rounded-full object-cover'
          />
        ) : (
          <svg className='h-6 w-6 text-gray-600' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl transition-all duration-200 ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        {isAuthenticated ? (
          // Menu khi đã đăng nhập
          <div className='py-2'>
            {/* User Info Header */}
            <div className='border-b border-gray-200 px-4 py-3'>
              <p className='text-sm font-medium text-gray-900 truncate'>{profile?.username || 'Người dùng'}</p>
              <p className='text-xs text-gray-500 truncate'>{profile?.email}</p>
            </div>

            {/* Profile Link */}
            <Link
              to='/profile'
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-amber-600'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
              Xem hồ sơ
            </Link>

            {/* Order History */}
            <Link
              to='/orders'
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-amber-600'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                />
              </svg>
              Lịch sử đơn hàng
            </Link>

            {/* Divider */}
            <div className='my-1 border-t border-gray-200'></div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className='flex w-full items-center gap-3 px-4 py-3 text-sm text-amber-600 transition-colors hover:bg-gray-100 hover:text-amber-700'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              Đăng xuất
            </button>
          </div>
        ) : (
          // Menu khi chưa đăng nhập
          <div className='py-2'>
            <Link
              to={path.login}
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-amber-600'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                />
              </svg>
              Đăng nhập
            </Link>
            <Link
              to={path.register}
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 px-4 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-amber-600'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                />
              </svg>
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
