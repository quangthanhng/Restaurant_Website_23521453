import { useContext, useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../contexts/app.context'
import { useToast } from '../../components/Toast'
import orderApi from '../../apis/order.api'
import authApi from '../../apis/auth.api'
import type { User } from '../../types/user.type'

type TabType = 'profile' | 'orders'

interface Order {
  _id: string
  orderId: string
  tableId?: {
    tableNumber: number
    position: string
  }
  deleveryAddress?: string
  deliveryOptions: 'dine-in' | 'delivery' | 'pickup'
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

export default function Profile() {
  const { profile, setIsAuthenticated, setProfile } = useContext(AppContext)
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('orders')
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 5

  // Fetch user orders
  const { data: ordersData } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await orderApi.getOrders({})
      return response.data
    }
  })

  const orders: Order[] = (ordersData?.metadata as Order[]) || []
  const totalPages = Math.ceil(orders.length / ordersPerPage)
  const paginatedOrders = orders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  // Get status badge - Light theme
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; className: string }> = {
      pending: { text: 'Đang chờ', className: 'bg-amber-100 text-amber-700 border-amber-300' },
      confirmed: { text: 'Đã xác nhận', className: 'bg-blue-100 text-blue-700 border-blue-300' },
      completed: { text: 'Đã phục vụ', className: 'bg-green-100 text-green-700 border-green-300' },
      cancelled: { text: 'Đã hủy', className: 'bg-red-100 text-red-700 border-red-300' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex rounded-md border px-3 py-1 text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    )
  }

  // Get delivery type label
  const getDeliveryTypeLabel = (deliveryOptions: string) => {
    switch (deliveryOptions) {
      case 'dine-in':
        return { text: 'Dùng bữa tại quán', className: 'text-blue-600' }
      case 'delivery':
        return { text: 'Giao hàng', className: 'text-green-600' }
      case 'pickup':
        return { text: 'Tự đến lấy', className: 'text-amber-600' }
      default:
        return { text: 'Không xác định', className: 'text-gray-500' }
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('profile')
    setIsAuthenticated(false)
    setProfile(null)
    success('Đăng xuất thành công!')
    navigate('/')
  }

  return (
    <div className='min-h-screen bg-gray-50 pt-[74px]'>
      {/* Hero Section */}
      <section
        className='relative h-[200px] w-full bg-cover bg-center'
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920")'
        }}
      >
        <div className='flex h-full flex-col items-center justify-center'>
          <h1 className='mb-2 font-serif text-4xl font-bold text-gray-900'>Tài khoản</h1>
          <div className='flex items-center gap-2 text-sm text-gray-200'>
            <span className='cursor-pointer hover:text-gray-900' onClick={() => navigate('/')}>
              Trang chủ
            </span>
            <span>›</span>
            <span className='text-amber-400'>Tài khoản</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className='mx-auto max-w-7xl px-6 py-8'>
        <div className='flex flex-col gap-8 lg:flex-row'>
          {/* Sidebar */}
          <div className='w-full lg:w-72'>
            <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
              {/* User Card */}
              <div className='bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-6 text-center'>
                <div className='mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-white/20'>
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt={profile.username} className='h-full w-full object-cover' />
                  ) : (
                    <svg className='h-10 w-10 text-gray-900' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
                    </svg>
                  )}
                </div>
                <h2 className='text-lg font-bold text-gray-900'>{profile?.username || 'Người dùng'}</h2>
                <p className='mt-1 text-sm text-gray-900/80'>{profile?.email}</p>
              </div>

              {/* Menu */}
              <div className='p-2'>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-red-50 text-amber-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  Thông tin cá nhân
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-red-50 text-amber-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                    />
                  </svg>
                  Đơn hàng của bạn
                </button>

                <button
                  onClick={handleLogout}
                  className='flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900'
                >
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                    />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className='flex-1'>
            {activeTab === 'profile' && (
              <ProfileInfo profile={profile} setProfile={setProfile} success={success} error={error} />
            )}
            {activeTab === 'orders' && (
              <OrdersTable
                orders={paginatedOrders}
                totalOrders={orders.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                getStatusBadge={getStatusBadge}
                getDeliveryTypeLabel={getDeliveryTypeLabel}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// Profile Info Component with API update
function ProfileInfo({
  profile,
  setProfile,
  success,
  error
}: {
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  success: (msg: string) => void
  error: (msg: string) => void
}) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  // Fetch full profile from API when component mounts
  const { data: profileData } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await authApi.getProfile()
      return response.data
    },
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  })

  // Get full profile from server data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serverProfile = profileData?.metadata as any
  const fullProfile = useMemo(() => {
    // Prefer server data if available
    const baseProfile = serverProfile || profile
    if (!baseProfile) return null
    return {
      ...profile,
      ...baseProfile,
      phoneNumber: baseProfile.phoneNumber || ''
    }
  }, [serverProfile, profile])

  // Use server data for form if available, otherwise use empty values
  const initialFormData = useMemo(
    () => ({
      username: fullProfile?.username || '',
      phoneNumber: fullProfile?.phoneNumber || '',
      address: fullProfile?.address || '',
      dateOfBirth: fullProfile?.dateOfBirth?.split('T')[0] || ''
    }),
    [fullProfile?.username, fullProfile?.phoneNumber, fullProfile?.address, fullProfile?.dateOfBirth]
  )

  const [formData, setFormData] = useState(initialFormData)

  // Sync formData with server data when it changes (but not during editing)
  const [lastSyncedProfile, setLastSyncedProfile] = useState<string>('')
  const currentProfileKey = `${fullProfile?.username}-${fullProfile?.phoneNumber}-${fullProfile?.address}-${fullProfile?.dateOfBirth}`

  if (currentProfileKey !== lastSyncedProfile && !isEditing) {
    setFormData(initialFormData)
    setLastSyncedProfile(currentProfileKey)
  }

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (response) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serverData = response.data.metadata as any
      const updatedUser = {
        ...serverData,
        phoneNumber: serverData.phoneNumber || ''
      }
      // Update context
      setProfile({ ...profile, ...updatedUser })
      // Update localStorage
      localStorage.setItem('profile', JSON.stringify({ ...profile, ...updatedUser }))
      // Update form data to reflect new values
      setFormData({
        username: updatedUser.username || '',
        phoneNumber: updatedUser.phoneNumber || '',
        address: updatedUser.address || '',
        dateOfBirth: updatedUser.dateOfBirth?.split('T')[0] || ''
      })
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      success('Cập nhật thông tin thành công!')
      setIsEditing(false)
    },
    onError: (err: unknown) => {
      console.error('Profile update error:', err)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (err as any)?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!'
      error(errorMessage)
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    updateProfileMutation.mutate({
      username: formData.username,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      dateOfBirth: formData.dateOfBirth
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Thông Tin Cá Nhân</h2>
          <p className='mt-1 text-gray-500'>Quản lý thông tin tài khoản của bạn</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-red-100'
        >
          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
            />
          </svg>
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </button>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-600'>Tên người dùng</label>
          {isEditing ? (
            <input
              type='text'
              name='username'
              value={formData.username}
              onChange={handleInputChange}
              className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-red-500'
            />
          ) : (
            <p className='rounded-lg bg-gray-50 px-4 py-3 text-gray-900'>{fullProfile?.username || 'Chưa cập nhật'}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-600'>Email</label>
          <p className='rounded-lg bg-gray-100 px-4 py-3 text-gray-500'>{fullProfile?.email || 'Chưa cập nhật'}</p>
          <p className='text-xs text-gray-400'>Email không thể thay đổi</p>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-600'>Số điện thoại</label>
          {isEditing ? (
            <input
              type='tel'
              name='phoneNumber'
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder='Nhập số điện thoại'
              className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-red-500'
            />
          ) : (
            <p className='rounded-lg bg-gray-50 px-4 py-3 text-gray-900'>
              {fullProfile?.phoneNumber || 'Chưa cập nhật'}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-600'>Ngày sinh</label>
          {isEditing ? (
            <input
              type='date'
              name='dateOfBirth'
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-red-500'
            />
          ) : (
            <p className='rounded-lg bg-gray-50 px-4 py-3 text-gray-900'>{formatDate(fullProfile?.dateOfBirth)}</p>
          )}
        </div>

        <div className='space-y-2 md:col-span-2'>
          <label className='text-sm font-medium text-gray-600'>Địa chỉ</label>
          {isEditing ? (
            <input
              type='text'
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              placeholder='Nhập địa chỉ của bạn'
              className='w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-red-500'
            />
          ) : (
            <p className='rounded-lg bg-gray-50 px-4 py-3 text-gray-900'>{fullProfile?.address || 'Chưa cập nhật'}</p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className='mt-8 flex justify-end gap-4'>
          <button
            onClick={() => setIsEditing(false)}
            className='rounded-lg border border-gray-300 px-6 py-2.5 text-gray-600 transition-colors hover:bg-gray-50'
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className='flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 font-medium text-gray-900 transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {updateProfileMutation.isPending && (
              <svg className='h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
            )}
            Lưu thay đổi
          </button>
        </div>
      )}
    </div>
  )
}

// Orders Table Component - Light Theme
function OrdersTable({
  orders,
  totalOrders,
  currentPage,
  totalPages,
  onPageChange,
  formatDate,
  formatCurrency,
  getStatusBadge,
  getDeliveryTypeLabel
}: {
  orders: Order[]
  totalOrders: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  formatDate: (date: string) => string
  formatCurrency: (value: number) => string
  getStatusBadge: (status: string) => React.ReactNode
  getDeliveryTypeLabel: (type: string) => { text: string; className: string }
}) {
  return (
    <div className='rounded-xl border border-gray-200 bg-white shadow-sm'>
      <div className='border-b border-gray-200 p-6'>
        <h2 className='text-2xl font-bold text-gray-900'>Đơn Hàng Của Tôi</h2>
        <p className='mt-1 text-gray-500'>Theo dõi và quản lý đơn hàng của bạn</p>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-200 bg-gray-50'>
              <th className='px-4 py-4 text-left text-sm font-medium text-gray-600'>Mã đơn hàng</th>
              <th className='px-4 py-4 text-left text-sm font-medium text-gray-600'>Ngày đặt</th>
              <th className='px-4 py-4 text-left text-sm font-medium text-gray-600'>Hình thức</th>
              <th className='px-4 py-4 text-left text-sm font-medium text-gray-600'>Bàn/Địa chỉ</th>
              <th className='px-4 py-4 text-left text-sm font-medium text-gray-600'>Tổng tiền</th>
              <th className='px-4 py-4 text-left text-sm font-medium text-gray-600'>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => {
                const deliveryType = getDeliveryTypeLabel(order.deliveryOptions)
                return (
                  <tr key={order._id} className='border-b border-gray-100 hover:bg-gray-50'>
                    <td className='px-4 py-4'>
                      <span className='font-mono text-sm text-gray-900'>
                        #{order.orderId?.slice(0, 12) || order._id.slice(0, 12)}
                      </span>
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-600'>{formatDate(order.createdAt)}</td>
                    <td className='px-4 py-4'>
                      <span className={`text-sm font-medium ${deliveryType.className}`}>{deliveryType.text}</span>
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-600'>
                      {order.deliveryOptions === 'dine-in' ? (
                        order.tableId ? (
                          <span>
                            Bàn {order.tableId.tableNumber} - Tầng {order.tableId.position}
                          </span>
                        ) : (
                          <span className='text-gray-400'>—</span>
                        )
                      ) : order.deleveryAddress ? (
                        <span className='max-w-[150px] truncate block' title={order.deleveryAddress}>
                          {order.deleveryAddress}
                        </span>
                      ) : (
                        <span className='text-gray-400'>—</span>
                      )}
                    </td>
                    <td className='px-4 py-4 text-sm font-medium text-gray-900'>{formatCurrency(order.totalPrice)}</td>
                    <td className='px-4 py-4'>{getStatusBadge(order.status)}</td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className='px-6 py-12 text-center text-gray-500'>
                  Bạn chưa có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-between border-t border-gray-200 px-6 py-4'>
          <p className='text-sm text-gray-500'>Tổng {totalOrders} đơn hàng</p>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className='rounded-lg border border-gray-300 p-2 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-amber-600 text-gray-900'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className='rounded-lg border border-gray-300 p-2 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </div>
        </div>
      )}

      {orders.length > 0 && totalPages <= 1 && (
        <div className='border-t border-gray-200 px-6 py-4'>
          <p className='text-sm text-gray-500'>Tổng {totalOrders} đơn hàng</p>
        </div>
      )}
    </div>
  )
}
