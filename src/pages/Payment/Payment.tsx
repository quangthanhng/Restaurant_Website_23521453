import { useLocation, useNavigate } from 'react-router-dom'
import path from '../../constants/path'

// Types cho Payment
interface PaymentDish {
  _id: string
  name: string
  price: number
  finalPrice?: number
  image?: string
}

interface PaymentCartItem {
  dish: PaymentDish
  quantity: number
}

interface PaymentDiscount {
  code: string
  percentage: number
  description?: string
}

interface PaymentCustomerInfo {
  fullName: string
  email: string
  phone: string
  notes?: string
}

interface PaymentBookingData {
  tableId: string
  tableNumber: string
  totalAmount: number
  subtotal: number
  discountAmount: number
  cartItems: PaymentCartItem[]
  customerInfo: PaymentCustomerInfo
  discount: PaymentDiscount | null
  bookingTime: string
}

// Helper format price - xử lý NaN và undefined
const formatPrice = (price: number | undefined | null): string => {
  const numPrice = Number(price)
  if (isNaN(numPrice)) {
    return '0 ₫'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(numPrice)
}

// Helper để lấy giá từ item
const getItemPrice = (item: PaymentCartItem): number => {
  if (!item || !item.dish) return 0
  const price = item.dish.finalPrice ?? item.dish.price ?? 0
  return Number(price) || 0
}

// Helper để tính subtotal từ cartItems
const calculateSubtotal = (cartItems: PaymentCartItem[]): number => {
  if (!cartItems || !Array.isArray(cartItems)) return 0
  return cartItems.reduce((total: number, item: PaymentCartItem) => {
    const price = getItemPrice(item)
    const quantity = Number(item.quantity) || 0
    return total + price * quantity
  }, 0)
}

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const bookingData = location.state as PaymentBookingData | null

  if (!bookingData) {
    return (
      <div className='min-h-screen bg-neutral-950 pt-[74px]'>
        <div className='mx-auto max-w-4xl px-6 py-12 text-center'>
          <h1 className='mb-4 text-2xl font-bold text-white'>Không tìm thấy thông tin đặt bàn</h1>
          <button onClick={() => navigate(path.booking)} className='text-savoria-gold hover:underline'>
            Quay lại trang đặt bàn
          </button>
        </div>
      </div>
    )
  }

  // Lấy cartItems
  const cartItems: PaymentCartItem[] = bookingData.cartItems || []

  // Tính toán các giá trị - ưu tiên dữ liệu từ state, fallback tính toán
  const subtotal = Number(bookingData.subtotal) || calculateSubtotal(cartItems)
  const discountPercentage = bookingData.discount?.percentage || 0
  const discountAmount = Number(bookingData.discountAmount) || (subtotal * discountPercentage) / 100
  const totalAmount = Number(bookingData.totalAmount) || subtotal - discountAmount

  return (
    <div className='min-h-screen bg-neutral-950 pt-[74px]'>
      <div className='mx-auto max-w-4xl px-6 py-12'>
        <div className='rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 md:p-12'>
          <h1 className='mb-8 text-center font-serif text-3xl font-bold text-white md:text-4xl'>
            Xác nhận thanh toán
          </h1>

          <div className='space-y-6 text-neutral-300'>
            {/* Customer & Booking Info */}
            <div className='grid grid-cols-1 gap-4 border-b border-neutral-800 pb-6 md:grid-cols-2'>
              <div>
                <p className='text-sm text-neutral-500'>Khách hàng</p>
                <p className='font-semibold text-white'>{bookingData.customerInfo?.fullName || 'N/A'}</p>
                <p>{bookingData.customerInfo?.phone || 'N/A'}</p>
                <p>{bookingData.customerInfo?.email || 'N/A'}</p>
              </div>
              <div className='text-left md:text-right'>
                <p className='text-sm text-neutral-500'>Thời gian</p>
                <p className='font-semibold text-white'>{bookingData.bookingTime || 'Chưa chọn'}</p>
                <p className='text-savoria-gold'>Bàn số: {bookingData.tableNumber || 'Chưa chọn'}</p>
              </div>
            </div>

            {/* Cart Items */}
            <div>
              <p className='mb-4 text-sm text-neutral-500'>Món ăn đã chọn ({cartItems.length} món)</p>
              {cartItems.length === 0 ? (
                <p className='text-neutral-500 italic'>Không có món ăn nào</p>
              ) : (
                <div className='space-y-2'>
                  {cartItems.map((item: PaymentCartItem, index: number) => {
                    const price = getItemPrice(item)
                    const quantity = Number(item.quantity) || 0
                    const itemTotal = price * quantity
                    return (
                      <div key={item.dish._id || index} className='flex justify-between py-2'>
                        <span>
                          {item.dish.name || 'Món ăn'} x {quantity}
                        </span>
                        <span>{formatPrice(itemTotal)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Subtotal */}
            <div className='border-t border-neutral-800 pt-4'>
              <div className='flex justify-between text-neutral-400'>
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            {/* Discount Section */}
            {bookingData.discount && discountAmount > 0 && (
              <div className='rounded-lg border border-green-500/30 bg-green-500/10 p-4'>
                <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20'>
                      <svg className='h-5 w-5 text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                        />
                      </svg>
                    </div>
                    <div>
                      <p className='font-semibold text-green-400'>{bookingData.discount.code}</p>
                      <p className='text-sm text-green-300/70'>{bookingData.discount.description || ''}</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-green-300/70'>Giảm {discountPercentage}%</p>
                    <p className='font-semibold text-green-400'>-{formatPrice(discountAmount)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            <div className='border-t border-neutral-800 pt-6'>
              <div className='flex justify-between text-xl font-bold text-savoria-gold'>
                <span>Tổng thanh toán</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Notes */}
            {bookingData.customerInfo?.notes && (
              <div className='rounded-lg border border-neutral-800 bg-neutral-900 p-4'>
                <p className='text-sm text-neutral-500'>Ghi chú</p>
                <p className='text-neutral-300'>{bookingData.customerInfo.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex flex-col gap-4 pt-4 md:flex-row'>
              <button
                onClick={() => navigate(path.booking)}
                className='flex-1 rounded-xl border border-neutral-700 py-4 font-bold text-neutral-300 transition-all hover:border-neutral-600 hover:bg-neutral-800'
              >
                Quay lại chỉnh sửa
              </button>
              <button className='flex-1 rounded-xl bg-savoria-gold py-4 font-bold text-neutral-900 shadow-lg transition-all hover:scale-105'>
                Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
