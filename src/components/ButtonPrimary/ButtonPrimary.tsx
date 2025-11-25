import { Link } from 'react-router-dom'

interface ButtonPrimaryProps {
  to: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function ButtonPrimary({ to, children, className = '', onClick }: ButtonPrimaryProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group relative isolate flex items-center overflow-hidden rounded-lg bg-savoria-gold text-sm font-medium transition-colors duration-300 ${className}`}
      style={{ padding: '10px' }}
    >
      {/* Ripple effect background - starts hidden, expands on hover */}
      <span className='absolute right-[18px] top-1/2 -z-10 h-9 w-9 -translate-y-1/2 scale-0 rounded-full bg-neutral-900 transition-transform duration-700 ease-in-out group-hover:scale-[25]'></span>

      <span className='relative z-10 whitespace-nowrap text-neutral-900 transition-colors duration-500 group-hover:text-savoria-gold'>
        {children}
      </span>
      <span
        className='relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 transition-all duration-500 group-hover:bg-savoria-gold'
        style={{ marginLeft: '15px' }}
      >
        <svg
          className='h-4 w-4 -rotate-45 text-savoria-gold transition-all duration-500 group-hover:rotate-0 group-hover:text-neutral-900'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          strokeWidth='2.5'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M17 8l4 4m0 0l-4 4m4-4H3' />
        </svg>
      </span>
    </Link>
  )
}
