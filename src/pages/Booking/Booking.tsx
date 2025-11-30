import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '../../contexts/CartContext'
import tableApi from '../../apis/table.api'
import { getDiscounts } from '../../apis/discount.api'
import type { Table } from '../../types/table.type'
import type { Discount } from '../../types/discount.type'
import path from '../../constants/path'

export default function Booking() {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart()

  // Form state
  const [selectedTableId, setSelectedTableId] = useState<string>('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null)

  // Fetch available tables
  const { data: tablesData, isLoading: isLoadingTables } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tableApi.getTables(),
    select: (response) => response.data.metadata || []
  })
  const tables: Table[] = tablesData || []
  const availableTables = tables.filter(table => table.status === 'available')

  // Fetch active discounts
  const { data: discountsData, isLoading: isLoadingDiscounts } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => getDiscounts(),
    select: (response) => response.data.metadata || []
  })
  const discounts: Discount[] = discountsData || []
  const activeDiscounts = discounts.filter(discount => discount.active)

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

  // Format datetime
  const currentDateTime = new Date().toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Handle form submission
  const handleConfirm = () => {
    // Validation
    if (!selectedTableId) {
      alert('Vui lòng chọn bàn')
      return
    }
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống. Vui lòng thêm món ăn từ menu')
      return
    }
    if (!fullName || !email || !phone) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    // Navigate to payment with booking data
    navigate(path.payment, {
      state: {
        tableId: selectedTableId,
        totalAmount: total,
        cartItems,
        customerInfo: {
          fullName,
          email,
          phone,
          notes
        },
        discountCode: selectedDiscount?.code || null,
        bookingTime: currentDateTime
      }
    })
  }

  return (
    <div className='min-h-screen w-full bg-neutral-950 pt-[74px]'>
      {/* Hero Section */}
      <section className='relative h-[300px] w-full overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950'>
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
          <h1 className='mb-4 font-serif text-5xl font-bold text-white md:text-6xl'>
            Đặt Bàn
            <span className='block text-savoria-gold'>Book a Table</span>
          </h1>
          <p className='max-w-2xl text-lg text-neutral-300'>
            Chọn bàn, món ăn và hoàn tất đặt chỗ của bạn
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className='mx-auto max-w-7xl px-6 py-12'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Left Column - Tables & Cart */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Table Selection */}
            <div className='rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6'>
              <h2 className='mb-6 font-serif text-2xl font-bold text-white'>
                Danh sách bàn
              </h2>

              {isLoadingTables ? (
                <div className='flex items-center justify-center py-12'>
                  <svg className='h-8 w-8 animate-spin text-savoria-gold' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                </div>
              ) : availableTables.length === 0 ? (
                <div className='py-12 text-center text-neutral-400'>
                  Hiện tại không có bàn trống
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {availableTables.map((table) => (
                    <button
                      key={table._id}
                      onClick={() => setSelectedTableId(table._id)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${selectedTableId === table._id
                        ? 'border-savoria-gold bg-savoria-gold/10'
                        : 'border-neutral-700 hover:border-savoria-gold/50'
                        }`}
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='font-semibold text-white'>Bàn {table.tableNumber}</h3>
                          <p className='text-sm text-neutral-400'>{table.position}</p>
                          <p className='text-sm text-neutral-400'>{table.maximumCapacity} người</p>
                        </div>
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selectedTableId === table._id
                          ? 'border-savoria-gold bg-savoria-gold'
                          : 'border-neutral-600'
                          }`}>
                          {selectedTableId === table._id && (
                            <svg className='h-4 w-4 text-neutral-900' fill='currentColor' viewBox='0 0 20 20'>
                              <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className='mt-2 inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400'>
                        Trống
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className='rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6'>
              <h2 className='mb-6 font-serif text-2xl font-bold text-white'>
                Giỏ hàng
              </h2>

              {cartItems.length === 0 ? (
                <div className='py-12 text-center'>
                  <svg className='mx-auto mb-4 h-16 w-16 text-neutral-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
                  </svg>
                  <p className='text-neutral-400'>Giỏ hàng trống</p>
                  <button
                    onClick={() => navigate(path.menu)}
                    className='mt-4 text-savoria-gold hover:underline'
                  >
                    Thêm món từ menu →
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {cartItems.map((item) => (
                    <div key={item.dish._id} className='flex gap-4 rounded-xl border border-neutral-800 bg-neutral-950/50 p-4'>
                      <img
                        src={item.dish.image || 'https://via.placeholder.com/100'}
                        alt={item.dish.name}
                        className='h-20 w-20 rounded-lg object-cover'
                      />
                      <div className='flex-1'>
                        <h3 className='font-semibold text-white'>{item.dish.name}</h3>
                        <p className='text-sm text-neutral-400'>{formatPrice(item.dish.finalPrice)}</p>
                        <div className='mt-2 flex items-center gap-2'>
                          <button
                            onClick={() => updateQuantity(item.dish._id, item.quantity - 1)}
                            className='flex h-6 w-6 items-center justify-center rounded bg-neutral-800 text-white hover:bg-neutral-700'
                          >
                            −
                          </button>
                          <span className='w-8 text-center text-white'>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.dish._id, item.quantity + 1)}
                            className='flex h-6 w-6 items-center justify-center rounded bg-neutral-800 text-white hover:bg-neutral-700'
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className='flex flex-col items-end justify-between'>
                        <button
                          onClick={() => removeFromCart(item.dish._id)}
                          className='text-red-400 hover:text-red-300'
                        >
                          <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                          </svg>
                        </button>
                        <p className='font-semibold text-savoria-gold'>
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
            <div className='rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6'>
              <h2 className='mb-6 font-serif text-2xl font-bold text-white'>
                Tạm tính
              </h2>

              <div className='space-y-4'>
                <div className='flex justify-between text-neutral-300'>
                  <span>Tổng cộng:</span>
                  <span className='font-semibold'>{formatPrice(subtotal)}</span>
                </div>

                {selectedDiscount && (
                  <div className='flex justify-between text-green-400'>
                    <span>Giảm giá ({selectedDiscount.percentage}%):</span>
                    <span className='font-semibold'>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className='border-t border-neutral-700 pt-4'>
                  <div className='flex justify-between text-xl font-bold text-savoria-gold'>
                    <span>Thành tiền:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className='text-sm text-neutral-400'>
                  <p>Thời gian đặt bàn:</p>
                  <p className='font-medium text-white'>{currentDateTime}</p>
                </div>
              </div>
            </div>

            {/* Customer Info Form */}
            <div className='rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6'>
              <h3 className='mb-4 font-semibold text-white'>Thông tin khách hàng</h3>

              <div className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm text-neutral-400'>Họ và tên *</label>
                  <input
                    type='text'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder='Nhập họ và tên'
                    className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-savoria-gold focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm text-neutral-400'>Email *</label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='example@email.com'
                    className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-savoria-gold focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm text-neutral-400'>Số điện thoại *</label>
                  <input
                    type='tel'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='0123456789'
                    className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-savoria-gold focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm text-neutral-400'>Mã giảm giá</label>
                  {isLoadingDiscounts ? (
                    <div className='text-sm text-neutral-500'>Đang tải...</div>
                  ) : activeDiscounts.length === 0 ? (
                    <div className='text-sm text-neutral-500'>Không có mã giảm giá</div>
                  ) : (
                    <div className='space-y-2'>
                      {activeDiscounts.map((discount) => (
                        <button
                          key={discount._id}
                          onClick={() => setSelectedDiscount(discount)}
                          className={`w-full rounded-lg border p-3 text-left transition-all ${selectedDiscount?._id === discount._id
                            ? 'border-savoria-gold bg-savoria-gold/10'
                            : 'border-neutral-700 hover:border-savoria-gold/50'
                            }`}
                        >
                          <div className='flex items-center justify-between'>
                            <div>
                              <p className='font-semibold text-white'>{discount.code}</p>
                              <p className='text-xs text-neutral-400'>{discount.description}</p>
                            </div>
                            <span className='rounded-full bg-savoria-gold px-3 py-1 text-sm font-bold text-neutral-900'>
                              -{discount.percentage}%
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className='mb-2 block text-sm text-neutral-400'>Ghi chú</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder='Yêu cầu đặc biệt...'
                    rows={3}
                    className='w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-savoria-gold focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
                  />
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              className='w-full rounded-xl bg-savoria-gold py-4 font-semibold text-neutral-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-savoria-gold/30'
            >
              Xác nhận đặt bàn
            </button>
          </div>
        </div>
      </section >
    </div >
  )
}
