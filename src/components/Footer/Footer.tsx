import { Link } from 'react-router-dom'
import path from '../../constants/path'

export default function Footer() {
  return (
    <footer className='w-full bg-neutral-950 text-neutral-300'>
      {/* Main Footer Content */}
      <div className='flex h-[650px] items-center justify-center px-[30px]'>
        <div className='w-full max-w-7xl grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3'>
          {/* Column 1 - Quick Links */}
          <div>
            <h3 className='mb-8 text-lg font-medium text-neutral-100'>Quick Links</h3>
            <div className='flex flex-col gap-4'>
              <Link
                to={path.home}
                className='group flex items-center justify-between border border-neutral-800 px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900'
              >
                <span className='text-base text-neutral-300 transition-colors group-hover:text-neutral-100'>
                  Home
                </span>
                <svg
                  className='h-4 w-4 -rotate-45 text-neutral-500 transition-all duration-300 group-hover:rotate-0 group-hover:text-neutral-100'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </Link>

              <Link
                to={path.menu}
                className='group flex items-center justify-between border border-neutral-800 px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900'
              >
                <span className='text-base text-neutral-300 transition-colors group-hover:text-neutral-100'>
                  Menu
                </span>
                <svg
                  className='h-4 w-4 -rotate-45 text-neutral-500 transition-all duration-300 group-hover:rotate-0 group-hover:text-neutral-100'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </Link>

              <Link
                to={path.about}
                className='group flex items-center justify-between border border-neutral-800 px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900'
              >
                <span className='text-base text-neutral-300 transition-colors group-hover:text-neutral-100'>
                  About
                </span>
                <svg
                  className='h-4 w-4 -rotate-45 text-neutral-500 transition-all duration-300 group-hover:rotate-0 group-hover:text-neutral-100'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </Link>

              <Link
                to='/reservation'
                className='group flex items-center justify-between border border-neutral-800 px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900'
              >
                <span className='text-base text-neutral-300 transition-colors group-hover:text-neutral-100'>
                  Reservation
                </span>
                <svg
                  className='h-4 w-4 -rotate-45 text-neutral-500 transition-all duration-300 group-hover:rotate-0 group-hover:text-neutral-100'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </Link>
            </div>
          </div>

          {/* Column 2 - Utility Pages */}
          <div>
            <h3 className='mb-8 text-lg font-medium text-neutral-100'>Utility Pages</h3>
            <div className='flex flex-col gap-4'>
              <Link
                to={path.blog}
                className='group flex items-center justify-between border border-neutral-800 px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900'
              >
                <span className='text-base text-neutral-300 transition-colors group-hover:text-neutral-100'>
                  Blogs
                </span>
                <svg
                  className='h-4 w-4 -rotate-45 text-neutral-500 transition-all duration-300 group-hover:rotate-0 group-hover:text-neutral-100'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </Link>

              <Link
                to='/terms'
                className='group flex items-center justify-between border border-neutral-800 px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900'
              >
                <span className='text-base text-neutral-300 transition-colors group-hover:text-neutral-100'>
                  Terms & Conditions
                </span>
                <svg
                  className='h-4 w-4 -rotate-45 text-neutral-500 transition-all duration-300 group-hover:rotate-0 group-hover:text-neutral-100'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </Link>

              <Link
                to='/privacy'
                className='group flex items-center justify-between border border-neutral-800 px-4 py-3 transition-colors hover:border-neutral-700 hover:bg-neutral-900'
              >
                <span className='text-base text-neutral-300 transition-colors group-hover:text-neutral-100'>
                  Privacy Policy
                </span>
                <svg
                  className='h-4 w-4 -rotate-45 text-neutral-500 transition-all duration-300 group-hover:rotate-0 group-hover:text-neutral-100'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </Link>
            </div>
          </div>

          {/* Column 3 - Newsletter */}
          <div>
            <h3 className='mb-4 text-lg font-medium text-neutral-100'>Newsletter</h3>
            <p className='mb-6 text-sm leading-relaxed text-neutral-400'>
              Sign up today and let us serve you unforgettable flavors and moments, right to your inbox!
            </p>

            {/* Email Input */}
            <div className='mb-8 flex items-center border border-neutral-800 bg-neutral-900/50 transition-colors focus-within:border-neutral-700'>
              <input
                type='email'
                placeholder='jane@framer.com'
                className='flex-1 bg-transparent px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none'
              />
              <button
                type='submit'
                className='flex h-12 w-12 items-center justify-center bg-neutral-800 transition-colors hover:bg-neutral-700'
                aria-label='Subscribe'
              >
                <svg
                  className='h-5 w-5 text-neutral-100'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  strokeWidth='2'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
                </svg>
              </button>
            </div>

            {/* Social Media Icons */}
            <div className='flex gap-4'>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-all hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-100'
                aria-label='Instagram'
              >
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                </svg>
              </a>

              <a
                href='https://linkedin.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-all hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-100'
                aria-label='LinkedIn'
              >
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                </svg>
              </a>

              <a
                href='https://pinterest.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-all hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-100'
                aria-label='Pinterest'
              >
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z' />
                </svg>
              </a>

              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-all hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-100'
                aria-label='Facebook'
              >
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                </svg>
              </a>

              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 text-neutral-400 transition-all hover:border-neutral-600 hover:bg-neutral-900 hover:text-neutral-100'
                aria-label='X (Twitter)'
              >
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className='border-t border-neutral-900'>
        <div className='flex flex-col items-center justify-between gap-4 p-[30px] md:flex-row'>
          <p className='text-sm text-neutral-500'>Copyrights are reserved @ TS Restaurant</p>
          <p className='text-sm text-neutral-500'>
            Designed by Jitu Raut{' '}
            <a
              href='https://fremix.design'
              target='_blank'
              rel='noopener noreferrer'
              className='text-neutral-400 transition-colors hover:text-neutral-100'
            >
              @fremix.design
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
