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
      className={`group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 font-semibold text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/40 active:scale-100 ${className}`}
      style={{ padding: '14px 28px' }}
    >
      {children}
    </Link>
  )
}
