import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import AdminSidebar from './components/AdminSidebar'

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className='min-h-screen bg-neutral-900'>
      {/* Sidebar (desktop + mobile overlay) */}
      <AdminSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Mobile top bar with hamburger */}
      <div className='lg:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur-sm flex items-center justify-between px-4 h-14 border-b border-neutral-800'>
        <button
          onClick={() => setMobileOpen(true)}
          className='p-2 rounded-md text-amber-50 hover:bg-neutral-800'
          aria-label='Open menu'
        >
          <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        </button>
        <div className='text-amber-50 font-semibold'>Quản trị</div>
        <div className='w-8' />
      </div>

      {/* Main Content - use lg:ml-64 so mobile doesn't reserve sidebar space */}
      <main className='lg:ml-64 min-h-screen p-6 pt-16 lg:pt-6'>
        <Outlet />
      </main>
    </div>
  )
}
