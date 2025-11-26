import { Outlet } from 'react-router-dom'
import AdminSidebar from './components/AdminSidebar'

export default function AdminLayout() {
  return (
    <div className='min-h-screen bg-neutral-900'>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className='ml-64 min-h-screen p-6'>
        <Outlet />
      </main>
    </div>
  )
}
