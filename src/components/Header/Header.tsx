import { Link, useLocation } from 'react-router-dom'
import { useContext, useState, useEffect } from 'react'
import path from '../../constants/path'
import UserDropdown from '../UserDropdown'
import ButtonPrimary from '../ButtonPrimary'
import { AppContext } from '../../contexts/app.context'
import { useCart } from '../../contexts/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated } = useContext(AppContext)
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()
  const location = useLocation()

  // Only homepage gets transparent header
  const isHomepage = location.pathname === '/'

  // Track scroll for header background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Header should be solid (white) if: not on homepage OR scrolled
  const useSolidHeader = !isHomepage || isScrolled

  const isActive = (pathName: string) => location.pathname === pathName

  const navLinks = [
    { to: path.home, label: 'Trang chủ' },
    { to: path.menu, label: 'Thực đơn' },
    { to: path.about, label: 'Giới thiệu' },
    { to: path.blog, label: 'Tin tức' }
  ]

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        useSolidHeader ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-stone-100' : 'bg-transparent'
      }`}
    >
      <div className='mx-auto max-w-7xl px-6'>
        <div className='flex h-20 items-center justify-between'>
          {/* Logo */}
          <Link to={path.home} className='group flex items-center gap-3' onClick={scrollToTop}>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg transition-transform group-hover:scale-105'>
              <span className='text-2xl'>🍜</span>
            </div>
            <div>
              <span
                className={`block text-xl font-bold transition-colors ${useSolidHeader ? 'text-stone-800' : 'text-white'} group-hover:text-amber-500`}
              >
                TS Restaurant
              </span>
              <span className={`block text-xs ${useSolidHeader ? 'text-stone-500' : 'text-white/70'}`}>
                Ẩm thực Việt Nam
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden items-center gap-1 lg:flex'>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={scrollToTop}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
                  isActive(link.to)
                    ? 'bg-amber-500 text-white shadow-lg'
                    : useSolidHeader
                      ? 'text-stone-600 hover:text-amber-600 hover:bg-amber-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className='flex items-center gap-3'>
            {/* Cart */}
            {isAuthenticated && (
              <Link
                to={path.cart}
                className={`relative hidden lg:flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
                  useSolidHeader
                    ? 'bg-stone-100 text-stone-600 hover:bg-amber-500 hover:text-white'
                    : 'bg-white/10 text-white hover:bg-amber-500'
                }`}
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
                {totalItems > 0 && (
                  <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse'>
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Book Table Button */}
            <ButtonPrimary to={path.booking} className='hidden lg:flex shadow-lg hover:shadow-xl transition-shadow'>
              <svg className='mr-2 h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              Đặt bàn
            </ButtonPrimary>

            {/* User Dropdown */}
            <div className='hidden lg:block'>
              <UserDropdown />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-xl lg:hidden transition-colors ${
                useSolidHeader ? 'bg-stone-100' : 'bg-white/10'
              }`}
            >
              <span
                className={`h-0.5 w-6 transition-all duration-300 ${useSolidHeader ? 'bg-stone-700' : 'bg-white'} ${
                  isMenuOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              />
              <span
                className={`h-0.5 w-6 transition-all duration-300 ${useSolidHeader ? 'bg-stone-700' : 'bg-white'} ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-0.5 w-6 transition-all duration-300 ${useSolidHeader ? 'bg-stone-700' : 'bg-white'} ${
                  isMenuOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute left-0 top-full w-full overflow-hidden transition-all duration-300 lg:hidden ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='border-b border-stone-200 bg-white/95 backdrop-blur-lg'>
          <nav className='mx-auto max-w-7xl flex flex-col gap-1 px-6 py-6'>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  setIsMenuOpen(false)
                  scrollToTop()
                }}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${
                  isActive(link.to)
                    ? 'bg-amber-500 text-white'
                    : 'text-stone-700 hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <Link
                to={path.cart}
                onClick={() => {
                  setIsMenuOpen(false)
                  scrollToTop()
                }}
                className='flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-600'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
                Giỏ hàng
                {totalItems > 0 && (
                  <span className='ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white'>
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            <Link
              to={path.booking}
              onClick={() => setIsMenuOpen(false)}
              className='mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              Đặt bàn ngay
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
