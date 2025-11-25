import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import path from '../../constants/path'

export default function UserDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

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

    return (
        <div className='relative' ref={dropdownRef}>
            {/* User Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-700 bg-neutral-800 transition-all hover:border-savoria-gold hover:bg-neutral-700'
                aria-label='User menu'
            >
                {/* Default User Icon */}
                <svg
                    className='h-6 w-6 text-white'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                </svg>
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-xl transition-all duration-200 ${isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
                    }`}
            >
                <div className='py-2'>
                    <Link
                        to={path.login}
                        onClick={() => setIsOpen(false)}
                        className='flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-savoria-gold'
                    >
                        <svg
                            className='h-5 w-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            strokeWidth='2'
                        >
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
                        className='flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-savoria-gold'
                    >
                        <svg
                            className='h-5 w-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                            strokeWidth='2'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                            />
                        </svg>
                        Đăng ký
                    </Link>
                </div>
            </div>
        </div>
    )
}
