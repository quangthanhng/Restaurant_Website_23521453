import { Link } from 'react-router-dom'
import path from '../../constants/path'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className='fixed left-0 right-0 top-0 z-50 w-full bg-neutral-900/70 backdrop-blur-md'>
      <div className='relative flex h-[74px] w-full items-center'>
        {/* Left section - Logo positioned at left with 100px margin, flexible */}
        <div className='flex items-center' style={{ marginLeft: '100px' }}>
          <Link
            to={path.home}
            className='font-serif text-4xl font-medium capitalize leading-logo tracking-logo text-savoria-gold transition-colors hover:text-amber-50'
          >
            TS Restaurant
          </Link>
        </div>

        {/* Spacer to create flexible space */}
        <div className='flex-1'></div>

        {/* Center section - Desktop Navigation - positioned in center */}
        <nav className='hidden absolute left-1/2 -translate-x-1/2 transform items-center gap-12 lg:flex'>
          <Link
            to={path.home}
            className='group relative pb-1 text-base font-normal text-neutral-300 transition-colors hover:text-amber-50'
          >
            Home
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-amber-50 transition-all duration-300 group-hover:w-full'></span>
          </Link>
          <Link
            to={path.menu}
            className='group relative pb-1 text-base font-normal text-neutral-300 transition-colors hover:text-amber-50'
          >
            Menu
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-amber-50 transition-all duration-300 group-hover:w-full'></span>
          </Link>
          <Link
            to={path.about}
            className='group relative pb-1 text-base font-normal text-neutral-300 transition-colors hover:text-amber-50'
          >
            About
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-amber-50 transition-all duration-300 group-hover:w-full'></span>
          </Link>
          <Link
            to={path.blog}
            className='group relative pb-1 text-base font-normal text-neutral-300 transition-colors hover:text-amber-50'
          >
            Blog
            <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-amber-50 transition-all duration-300 group-hover:w-full'></span>
          </Link>
        </nav>

        {/* Another spacer for right side */}
        <div className='flex-1'></div>

        {/* Right section - Book A Table Button with 100px margin from right edge */}
        <div className='flex items-center gap-4' style={{ marginRight: '100px' }}>
          {/* Book A Table Button - Desktop Only */}
          <Link
            to='/booking'
            className='group relative isolate hidden h-[50px] items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-savoria-gold px-6 text-sm font-medium transition-colors duration-300 lg:flex'
          >
            {/* Ripple effect background - starts hidden, expands on hover */}
            <span className='absolute right-[18px] top-1/2 -z-10 h-9 w-9 -translate-y-1/2 scale-0 rounded-full bg-neutral-900 transition-transform duration-700 ease-in-out group-hover:scale-[25]'></span>

            <span className='relative z-10 whitespace-nowrap text-neutral-900 transition-colors duration-500 group-hover:text-savoria-gold'>
              Book A Table
            </span>
            <span className='relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 transition-all duration-500 group-hover:bg-savoria-gold'>
              <svg
                className='h-4 w-4 -rotate-45 text-savoria-gold transition-colors duration-500 group-hover:text-neutral-900'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                strokeWidth='2.5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M17 8l4 4m0 0l-4 4m4-4H3'
                />
              </svg>
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg bg-neutral-800 p-2 transition-colors hover:bg-neutral-700 lg:hidden'
            aria-label='Toggle menu'
          >
            <span
              className={`h-0.5 w-6 bg-amber-50 transition-all duration-300 ${isMenuOpen ? 'translate-y-2 rotate-45' : ''
                }`}
            />
            <span
              className={`h-0.5 w-6 bg-amber-50 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''
                }`}
            />
            <span
              className={`h-0.5 w-6 bg-amber-50 transition-all duration-300 ${isMenuOpen ? '-translate-y-2 -rotate-45' : ''
                }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute left-0 top-full w-full overflow-hidden border-b border-neutral-800 bg-neutral-900/98 backdrop-blur-md transition-all duration-300 lg:hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <nav className='flex flex-col gap-1 px-4 py-6'>
          <Link
            to={path.home}
            onClick={() => setIsMenuOpen(false)}
            className='rounded-lg px-4 py-3 text-sm font-medium uppercase tracking-wider text-amber-50 transition-colors hover:bg-neutral-800 hover:text-amber-100'
          >
            Home
          </Link>
          <Link
            to={path.menu}
            onClick={() => setIsMenuOpen(false)}
            className='rounded-lg px-4 py-3 text-sm font-medium uppercase tracking-wider text-amber-50 transition-colors hover:bg-neutral-800 hover:text-amber-100'
          >
            Menu
          </Link>
          <Link
            to={path.about}
            onClick={() => setIsMenuOpen(false)}
            className='rounded-lg px-4 py-3 text-sm font-medium uppercase tracking-wider text-amber-50 transition-colors hover:bg-neutral-800 hover:text-amber-100'
          >
            About
          </Link>
          <Link
            to={path.blog}
            onClick={() => setIsMenuOpen(false)}
            className='rounded-lg px-4 py-3 text-sm font-medium uppercase tracking-wider text-amber-50 transition-colors hover:bg-neutral-800 hover:text-amber-100'
          >
            Blog
          </Link>
          <Link
            to='/booking'
            onClick={() => setIsMenuOpen(false)}
            className='mt-4 flex items-center justify-center gap-2 rounded-full bg-amber-600 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-amber-500'
          >
            Book A Table
            <svg
              className='h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 8l4 4m0 0l-4 4m4-4H3'
              />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  )
}