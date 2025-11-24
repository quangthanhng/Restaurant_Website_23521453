import { Link } from 'react-router-dom'
import path from '../../constants/path'

export default function Header() {
  return (
    <header className='bg-dark-100 text-beige-100'>
      <div className='container mx-auto flex items-center justify-between px-6 py-4'>
        {/* Logo */}
        <Link to={path.home} className='text-2xl font-semibold tracking-wider'>
          SAVORIA
        </Link>

        {/* Navigation */}
        <nav className='flex items-center gap-8'>
          <Link
            to={path.home}
            className='text-sm font-medium transition-colors hover:text-beige-80'
          >
            Home
          </Link>
          <Link
            to='/menu'
            className='text-sm font-medium transition-colors hover:text-beige-80'
          >
            Menu
          </Link>
          <Link
            to='/about'
            className='text-sm font-medium transition-colors hover:text-beige-80'
          >
            About
          </Link>
          <Link
            to='/blog'
            className='text-sm font-medium transition-colors hover:text-beige-80'
          >
            Blog
          </Link>
        </nav>

        {/* Book A Table Button */}
        <Link
          to='/booking'
          className='flex items-center gap-2 rounded-md bg-beige-100 px-6 py-2.5 text-sm font-medium text-dark-100 transition-all hover:bg-beige-80'
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
      </div>
    </header>
  )
}
