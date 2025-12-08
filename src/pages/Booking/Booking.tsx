import { useState, useEffect, useMemo, useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../components/Toast'
import { AppContext } from '../../contexts/app.context'
import tableApi from '../../apis/table.api'
import { getDiscounts } from '../../apis/discount.api'
import type { Table } from '../../types/table.type'
import type { Discount } from '../../types/discount.type'
import path from '../../constants/path'

// Helper function to get default date
const getDefaultDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Helper function to get default time
const getDefaultTime = () => {
  const today = new Date()
  return today.toTimeString().slice(0, 5)
}

export default function Booking() {
  const navigate = useNavigate()
  const {
    cart,
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    isLoading: isLoadingCart,
    fetchCart
  } = useCart()
  const { isAuthenticated, profile } = useContext(AppContext)
  const { success, error } = useToast()

  // Form state
  const [selectedTableId, setSelectedTableId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Date & Time picker state - initialize with default values
  const [bookingDate, setBookingDate] = useState<string>(getDefaultDate)
  const [bookingTime, setBookingTime] = useState<string>(getDefaultTime)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      error('Vui lòng đăng nhập để đặt bàn!')
      navigate(path.login)
    }
  }, [isAuthenticated, navigate, error])

  // Fetch cart on mount
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Fetch available tables
  const { data: tablesData, isLoading: isLoadingTables } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tableApi.getTables(),
    select: (response) => response.data.metadata || []
  })
  const tables: Table[] = tablesData || []

  // Helper function to get table status display
  const getTableStatusDisplay = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'Trống', className: 'bg-green-500/10 text-green-500' }
      case 'reserved':
        return { text: 'Đã đặt trước', className: 'bg-amber-500/10 text-amber-600' }
      case 'occupied':
        return { text: 'Đang sử dụng', className: 'bg-red-500/10 text-red-500' }
      default:
        return { text: 'Trống', className: 'bg-green-500/10 text-green-500' }
    }
  }

  // Check if table is bookable
  const isTableBookable = (table: Table) => table.status === 'available'

  // Fetch active discounts
  const { data: discountsData, isLoading: isLoadingDiscounts } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => getDiscounts(),
    select: (response) => response.data.metadata || []
  })

  // Filter discounts: active AND valid for selected booking date
  const validDiscounts = useMemo(() => {
    const discounts: Discount[] = discountsData || []
    if (!bookingDate) return []

    const selectedDate = new Date(bookingDate)
    selectedDate.setHours(0, 0, 0, 0)

    return discounts.filter((discount) => {
      if (!discount.active) return false

      const validFrom = new Date(discount.validFrom)
      const validTo = new Date(discount.validTo)
      validFrom.setHours(0, 0, 0, 0)
      validTo.setHours(23, 59, 59, 999)

      return selectedDate >= validFrom && selectedDate <= validTo
    })
  }, [discountsData, bookingDate])

  // Handle date change and reset discount if invalid
  const handleDateChange = useCallback(
    (newDate: string) => {
      setBookingDate(newDate)
      // Check if current discount is still valid for new date
      if (selectedDiscount && newDate) {
        const selectedDate = new Date(newDate)
        selectedDate.setHours(0, 0, 0, 0)

        const validFrom = new Date(selectedDiscount.validFrom)
        const validTo = new Date(selectedDiscount.validTo)
        validFrom.setHours(0, 0, 0, 0)
        validTo.setHours(23, 59, 59, 999)

        if (selectedDate < validFrom || selectedDate > validTo) {
          setSelectedDiscount(null)
        }
      }
    },
    [selectedDiscount]
  )

  // Calculate totals
  const subtotal = getTotalPrice()
  const discountAmount = selectedDiscount ? (subtotal * selectedDiscount.percentage) / 100 : 0
  const total = subtotal - discountAmount

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Format booking datetime for display
  const formattedBookingDateTime = useMemo(() => {
    if (!bookingDate || !bookingTime) return ''
    const date = new Date(`${bookingDate}T${bookingTime}`)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [bookingDate, bookingTime])

  // Get min date (today)
  const minDate = new Date().toISOString().split('T')[0]

  // Handle form submission
  const handleConfirm = async () => {
    // Validation
    if (!isAuthenticated || !profile) {
      error('Vui lòng đăng nhập để đặt bàn!')
      navigate(path.login)
      return
    }
    if (!selectedTableId) {
      error('Vui lòng chọn bàn')
      return
    }
    if (cartItems.length === 0) {
      error('Giỏ hàng trống. Vui lòng thêm món ăn từ menu')
      return
    }
    if (!bookingDate || !bookingTime) {
      error('Vui lòng chọn ngày và giờ đặt bàn')
      return
    }
    if (!cart?._id) {
      error('Không tìm thấy thông tin giỏ hàng. Vui lòng thử lại.')
      return
    }

    setIsSubmitting(true)

    try {
      // Tìm thông tin bàn đã chọn
      const selectedTable = tables.find((t) => t._id === selectedTableId)

      success('Đang chuyển đến trang thanh toán...')

      // Navigate to payment with booking data (không tạo order ở đây)
      // Order sẽ được tạo ở Payment khi user chọn phương thức thanh toán
      navigate(path.payment, {
        state: {
          // Booking data để tạo order ở Payment
          cartId: cart._id,
          tableId: selectedTableId,
          tableNumber: selectedTable?.tableNumber || '',
          totalAmount: total,
          subtotal,
          discountAmount,
          cartItems,
          customerInfo: {
            fullName: profile?.username || '',
            email: profile?.email || '',
            phone: profile?.phoneNumber || '',
            notes
          },
          discount: selectedDiscount
            ? {
                code: selectedDiscount.code,
                percentage: selectedDiscount.percentage,
                description: selectedDiscount.description
              }
            : null,
          bookingTime: formattedBookingDateTime
        }
      })
    } catch (err) {
      console.error('Error:', err)
      error('Có lỗi xảy ra. Vui lòng thử lại!')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-screen w-full bg-white pt-[74px]'>
      {/* Hero Section */}
      <section className='relative h-[300px] w-full overflow-hidden bg-linear-to-b from-gray-50 to-white'>
        <div className='absolute inset-0 opacity-[0.03]'>
          <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
            <defs>
              <pattern id='booking-grid' width='60' height='60' patternUnits='userSpaceOnUse'>
                <path d='M 60 0 L 0 0 0 60' fill='none' stroke='white' strokeWidth='1' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#booking-grid)' />
          </svg>
        </div>

        <div className='relative flex h-full flex-col items-center justify-center px-6 text-center'>
          <h1 className='mb-4 font-serif text-5xl font-bold text-gray-900 md:text-6xl'>
            Đặt Bàn
            <span className='block text-amber-600'>Book a Table</span>
          </h1>
          <p className='max-w-2xl text-lg text-gray-600'>Chọn bàn, món ăn và hoàn tất đặt chỗ của bạn</p>
        </div>
      </section>

      {/* Main Content */}
      <section className='mx-auto max-w-7xl px-6 py-12'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Left Column - Tables & Cart */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Table Selection */}
            <div className='rounded-2xl border border-gray-100 bg-white p-6'>
              <h2 className='mb-6 font-serif text-2xl font-bold text-gray-900'>Danh sách bàn</h2>

              {isLoadingTables ? (
                <div className='flex items-center justify-center py-12'>
                  <svg className='h-8 w-8 animate-spin text-amber-600' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                </div>
              ) : tables.length === 0 ? (
                <div className='py-12 text-center text-gray-500'>Hiện tại không có bàn trống</div>
              ) : (
                <div className='overflow-hidden rounded-xl border border-gray-100 bg-white'>
                  <div className='max-h-[400px] overflow-y-auto'>
                    <table className='w-full text-left text-sm text-gray-500'>
                      <thead className='sticky top-0 bg-gray-100 text-xs uppercase text-gray-700'>
                        <tr>
                          <th scope='col' className='px-6 py-4'>
                            Chọn
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Số bàn
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Tên bàn
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Vị trí
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Số ghế
                          </th>
                          <th scope='col' className='px-6 py-4'>
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-neutral-800'>
                        {tables.map((table) => {
                          const statusDisplay = getTableStatusDisplay(table.status)
                          const bookable = isTableBookable(table)
                          return (
                            <tr
                              key={table._id}
                              className={`transition-colors ${
                                bookable
                                  ? 'cursor-pointer hover:bg-stone-50'
                                  : 'cursor-not-allowed bg-gray-50 opacity-60'
                              } ${selectedTableId === table._id && bookable ? 'bg-amber-500/10' : ''}`}
                              onClick={() => bookable && setSelectedTableId(table._id)}
                            >
                              <td className='px-6 py-4'>
                                <div
                                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                    !bookable
                                      ? 'border-gray-300 bg-gray-200'
                                      : selectedTableId === table._id
                                        ? 'border-amber-500 bg-amber-500'
                                        : 'border-neutral-600'
                                  }`}
                                >
                                  {selectedTableId === table._id && bookable && (
                                    <div className='h-2 w-2 rounded-full bg-white' />
                                  )}
                                  {!bookable && (
                                    <svg
                                      className='h-3 w-3 text-gray-400'
                                      fill='none'
                                      stroke='currentColor'
                                      viewBox='0 0 24 24'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth='2'
                                        d='M6 18L18 6M6 6l12 12'
                                      />
                                    </svg>
                                  )}
                                </div>
                              </td>
                              <td className={`px-6 py-4 font-medium ${bookable ? 'text-gray-900' : 'text-gray-400'}`}>
                                {table.tableNumber}
                              </td>
                              <td className={`px-6 py-4 font-medium ${bookable ? 'text-gray-900' : 'text-gray-400'}`}>
                                Bàn {table.tableNumber}
                              </td>
                              <td className={`px-6 py-4 ${bookable ? '' : 'text-gray-400'}`}>{table.position}</td>
                              <td className={`px-6 py-4 ${bookable ? '' : 'text-gray-400'}`}>
                                {table.maximumCapacity} người
                              </td>
                              <td className='px-6 py-4'>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusDisplay.className}`}
                                >
                                  {statusDisplay.text}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <div className='rounded-2xl border border-gray-100 bg-white p-6'>
              <h2 className='mb-6 font-serif text-2xl font-bold text-gray-900'>Giỏ hàng</h2>

              {isLoadingCart ? (
                <div className='flex items-center justify-center py-12'>
                  <svg className='h-8 w-8 animate-spin text-amber-600' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                </div>
              ) : cartItems.length === 0 ? (
                <div className='py-12 text-center'>
                  <svg
                    className='mx-auto mb-4 h-16 w-16 text-gray-300'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='1.5'
                      d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                  <p className='text-gray-500'>Giỏ hàng trống</p>
                  <button onClick={() => navigate(path.menu)} className='mt-4 text-amber-600 hover:underline'>
                    Thêm món từ menu →
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {cartItems.map((item) => (
                    <div key={item.dish._id} className='flex gap-4 rounded-xl border border-gray-100 bg-white/50 p-4'>
                      <img
                        src={item.dish.image || 'https://via.placeholder.com/100'}
                        alt={item.dish.name}
                        className='h-20 w-20 rounded-lg object-cover'
                      />
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900'>{item.dish.name}</h3>
                        <p className='text-sm text-gray-500'>{formatPrice(item.dish.finalPrice)}</p>
                        <div className='mt-2 flex items-center gap-2'>
                          <button
                            onClick={() => updateQuantity(item.dish._id, item.quantity - 1)}
                            className='flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-900 hover:bg-neutral-700'
                          >
                            −
                          </button>
                          <span className='w-8 text-center text-gray-900'>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.dish._id, item.quantity + 1)}
                            className='flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-900 hover:bg-neutral-700'
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className='flex flex-col items-end justify-between'>
                        <button
                          onClick={() => removeFromCart(item.dish._id)}
                          className='text-amber-400 hover:text-red-300'
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
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        </button>
                        <p className='font-semibold text-amber-600'>
                          {formatPrice(item.dish.finalPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Customer Info & Summary */}
          <div className='space-y-6'>
            {/* Payment Summary */}
            <div className='rounded-2xl border border-gray-100 bg-white p-6'>
              <h2 className='mb-6 font-serif text-2xl font-bold text-gray-900'>Tạm tính</h2>

              <div className='space-y-4'>
                <div className='flex justify-between text-gray-600'>
                  <span>Tổng cộng:</span>
                  <span className='font-semibold'>{formatPrice(subtotal)}</span>
                </div>

                {selectedDiscount && (
                  <div className='flex justify-between text-green-400'>
                    <span>Giảm giá ({selectedDiscount.percentage}%):</span>
                    <span className='font-semibold'>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className='border-t border-stone-200 pt-4'>
                  <div className='flex justify-between text-xl font-bold text-amber-600'>
                    <span>Thành tiền:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className='text-sm text-gray-500'>
                  <p>Thời gian đặt bàn:</p>
                  <p className='font-medium text-gray-900'>{formattedBookingDateTime || 'Chưa chọn'}</p>
                </div>
              </div>
            </div>

            {/* Customer Info Form */}
            <div className='rounded-2xl bg-white p-6 shadow-sm'>
              <h3 className='mb-4 font-semibold text-gray-900'>Thông tin khách hàng</h3>

              <div className='space-y-4'>
                {/* Display User Info (read-only) */}
                <div className='rounded-xl bg-amber-50 p-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-3'>
                      <svg className='h-5 w-5 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                      <span className='font-medium text-gray-900'>{profile?.username || 'Người dùng'}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <svg className='h-5 w-5 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        />
                      </svg>
                      <span className='text-gray-700'>{profile?.email}</span>
                    </div>
                    {profile?.phoneNumber && (
                      <div className='flex items-center gap-3'>
                        <svg className='h-5 w-5 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                          />
                        </svg>
                        <span className='text-gray-700'>{profile.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Time Picker */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='mb-2 block text-sm text-gray-500'>Ngày đặt bàn *</label>
                    <input
                      type='date'
                      value={bookingDate}
                      min={minDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className='w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20'
                    />
                  </div>
                  <div>
                    <label className='mb-2 block text-sm text-gray-500'>Giờ đặt bàn *</label>
                    <input
                      type='time'
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className='w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20'
                    />
                  </div>
                </div>

                <div>
                  <label className='mb-2 block text-sm text-gray-500'>
                    Mã giảm giá
                    {bookingDate && (
                      <span className='ml-2 text-xs text-gray-400'>
                        (Hiệu lực cho ngày {new Date(bookingDate).toLocaleDateString('vi-VN')})
                      </span>
                    )}
                  </label>
                  {isLoadingDiscounts ? (
                    <div className='text-sm text-gray-400'>Đang tải...</div>
                  ) : !bookingDate ? (
                    <div className='rounded-lg bg-stone-100 p-3 text-sm text-gray-400'>
                      Vui lòng chọn ngày đặt bàn để xem mã giảm giá
                    </div>
                  ) : validDiscounts.length === 0 ? (
                    <div className='rounded-lg bg-stone-100 p-3 text-sm text-gray-400'>
                      Không có mã giảm giá cho ngày này
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      {validDiscounts.map((discount) => (
                        <button
                          key={discount._id}
                          onClick={() => setSelectedDiscount(selectedDiscount?._id === discount._id ? null : discount)}
                          className={`w-full rounded-lg border p-3 text-left transition-all ${
                            selectedDiscount?._id === discount._id
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-stone-200 hover:border-amber-500/50'
                          }`}
                        >
                          <div className='flex items-center justify-between'>
                            <div>
                              <p className='font-semibold text-gray-900'>{discount.code}</p>
                              <p className='text-xs text-gray-500'>{discount.description}</p>
                              <p className='mt-1 text-xs text-gray-400'>
                                HSD: {new Date(discount.validFrom).toLocaleDateString('vi-VN')} -{' '}
                                {new Date(discount.validTo).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                            <span className='rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-neutral-900'>
                              -{discount.percentage}%
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className='mb-2 block text-sm text-gray-500'>Ghi chú</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder='Yêu cầu đặc biệt...'
                    rows={3}
                    className='w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
                  />
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`w-full rounded-xl py-4 font-semibold shadow-lg transition-all ${
                isSubmitting
                  ? 'cursor-not-allowed bg-neutral-600 text-gray-500'
                  : 'bg-amber-500 text-neutral-900 hover:scale-105 hover:shadow-xl hover:shadow-savoria-gold/30'
              }`}
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg className='h-5 w-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Xác nhận đặt bàn'
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
