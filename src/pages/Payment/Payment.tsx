import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import path from '../../constants/path'
import { useToast } from '../../components/Toast'
import { useCart } from '../../contexts/CartContext'
import orderApi from '../../apis/order.api'
import paymentApi from '../../apis/payment.api'
import tableApi from '../../apis/table.api'

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
  phoneNumber: string
  notes?: string
}

interface PaymentBookingData {
  // Booking data (order chưa được tạo)
  cartId: string
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
  const { success, error } = useToast()
  const { clearCart } = useCart()
  const [isMoMoProcessing, setIsMoMoProcessing] = useState(false)
  const [isCashProcessing, setIsCashProcessing] = useState(false)
  const bookingData = location.state as PaymentBookingData | null

  if (!bookingData) {
    return (
      <div className='min-h-screen bg-white pt-[74px]'>
        <div className='mx-auto max-w-4xl px-6 py-12 text-center'>
          <h1 className='mb-4 text-2xl font-bold text-gray-900'>Không tìm thấy thông tin đặt bàn</h1>
          <button onClick={() => navigate(path.booking)} className='text-amber-600 hover:underline'>
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

  // Xử lý thanh toán MoMo
  const handleMoMoPayment = async () => {
    if (!bookingData.cartId) {
      error('Không tìm thấy thông tin giỏ hàng!')
      return
    }

    if (!bookingData.customerInfo?.email) {
      error('Không tìm thấy email khách hàng!')
      return
    }

    // Ngăn double-click
    if (isMoMoProcessing) return
    setIsMoMoProcessing(true)

    try {
      // Tạo order với typeOfPayment = 'momo'
      const orderResponse = await orderApi.createOrder({
        cartId: bookingData.cartId,
        tableId: bookingData.tableId,
        deliveryOptions: 'dine-in',
        totalPrice: totalAmount,
        typeOfPayment: 'momo',
        bookingTime: bookingData.bookingTime
      })

      const createdOrder = orderResponse.data.metadata
      console.log('Created Order for MoMo:', createdOrder)

      // Cập nhật trạng thái bàn thành 'reserved' (dùng cho dine-in)
      if (bookingData.tableId) {
        try {
          await tableApi.changeStatus(bookingData.tableId, 'reserved')
          console.log('Table status updated to reserved')
        } catch (tableErr) {
          console.error('Error updating table status:', tableErr)
        }
      }

      // Gọi API tạo link thanh toán MoMo
      const response = await paymentApi.createMoMoPayment({
        email: bookingData.customerInfo.email,
        id: createdOrder._id
      })

      console.log('MoMo Payment Response:', response.data)

      // Truy cập payUrl
      const payUrl = response.data?.data?.payUrl

      if (payUrl) {
        // Clear cart trước khi chuyển sang trang thanh toán MoMo
        await clearCart()
        // Redirect đến trang thanh toán MoMo
        window.location.href = payUrl
      } else {
        console.error('PayUrl not found in response:', response.data)
        error('Không thể tạo link thanh toán MoMo. Vui lòng thử lại!')
      }
    } catch (err: unknown) {
      console.error('MoMo Payment error:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: unknown; status?: number } }
        console.error('Error response:', axiosError.response?.data)
      }
      error('Có lỗi xảy ra khi tạo thanh toán MoMo. Vui lòng thử lại!')
    } finally {
      setIsMoMoProcessing(false)
    }
  }

  // Xử lý thanh toán tiền mặt
  const handleCashPayment = async () => {
    if (!bookingData.cartId) {
      error('Không tìm thấy thông tin giỏ hàng!')
      return
    }

    // Ngăn double-click
    if (isCashProcessing) return
    setIsCashProcessing(true)

    try {
      // Tạo order với typeOfPayment = 'cash'
      const orderResponse = await orderApi.createOrder({
        cartId: bookingData.cartId,
        tableId: bookingData.tableId,
        deliveryOptions: 'dine-in',
        totalPrice: totalAmount,
        typeOfPayment: 'cash',
        bookingTime: bookingData.bookingTime
      })

      console.log('Created Order for Cash:', orderResponse.data.metadata)

      // Cập nhật trạng thái bàn thành 'reserved' (dùng cho dine-in)
      if (bookingData.tableId) {
        try {
          await tableApi.changeStatus(bookingData.tableId, 'reserved')
          console.log('Table status updated to reserved')
        } catch (tableErr) {
          console.error('Error updating table status:', tableErr)
        }
      }

      // Clear cart sau khi đặt thành công
      await clearCart()

      success('Đặt bàn thành công! Bạn sẽ thanh toán tiền mặt tại nhà hàng.')

      // Redirect về trang home
      navigate(path.home)
    } catch (err) {
      console.error('Payment error:', err)
      error('Có lỗi xảy ra khi xác nhận đơn hàng. Vui lòng thử lại!')
    } finally {
      setIsCashProcessing(false)
    }
  }

  return (
    <div className='min-h-screen bg-white pt-[74px]'>
      <div className='mx-auto max-w-4xl px-6 py-12'>
        <div className='rounded-2xl border border-gray-200 bg-gray-50 p-8 md:p-12'>
          <h1 className='mb-8 text-center font-serif text-3xl font-bold text-gray-900 md:text-4xl'>
            Xác nhận thanh toán
          </h1>

          <div className='space-y-6 text-gray-600'>
            {/* Customer & Booking Info */}
            <div className='grid grid-cols-1 gap-4 border-b border-gray-200 pb-6 md:grid-cols-2'>
              <div>
                <p className='text-sm text-gray-400'>Khách hàng</p>
                <p className='font-semibold text-gray-900'>{bookingData.customerInfo?.fullName || 'N/A'}</p>
                <p>{bookingData.customerInfo?.phoneNumber || 'N/A'}</p>
                <p>{bookingData.customerInfo?.email || 'N/A'}</p>
              </div>
              <div className='text-left md:text-right'>
                <p className='text-sm text-gray-400'>Thời gian</p>
                <p className='font-semibold text-gray-900'>{bookingData.bookingTime || 'Chưa chọn'}</p>
                <p className='text-amber-600'>Bàn số: {bookingData.tableNumber || 'Chưa chọn'}</p>
              </div>
            </div>

            {/* Cart Items */}
            <div>
              <p className='mb-4 text-sm text-gray-400'>Món ăn đã chọn ({cartItems.length} món)</p>
              {cartItems.length === 0 ? (
                <p className='text-gray-400 italic'>Không có món ăn nào</p>
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
            <div className='border-t border-gray-200 pt-4'>
              <div className='flex justify-between text-gray-500'>
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
            <div className='border-t border-gray-200 pt-6'>
              <div className='flex justify-between text-xl font-bold text-amber-600'>
                <span>Tổng thanh toán</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Notes */}
            {bookingData.customerInfo?.notes && (
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                <p className='text-sm text-gray-400'>Ghi chú</p>
                <p className='text-gray-600'>{bookingData.customerInfo.notes}</p>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className='space-y-3'>
              <p className='text-sm font-medium text-gray-500'>Chọn phương thức thanh toán</p>

              {/* MoMo Button */}
              <button
                onClick={handleMoMoPayment}
                disabled={isMoMoProcessing || isCashProcessing}
                className={`w-full rounded-xl py-4 font-bold shadow-lg transition-all ${
                  isMoMoProcessing || isCashProcessing
                    ? 'cursor-not-allowed bg-neutral-600 text-gray-500'
                    : 'bg-[#A50064] text-gray-900 hover:scale-105 hover:shadow-xl hover:shadow-[#A50064]/30'
                }`}
              >
                {isMoMoProcessing ? (
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
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='h-6 w-6' viewBox='0 0 24 24' fill='currentColor'>
                      <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                    </svg>
                    Thanh toán MoMo
                  </span>
                )}
              </button>

              {/* Cash Payment Button */}
              <button
                onClick={handleCashPayment}
                disabled={isMoMoProcessing || isCashProcessing}
                className={`w-full rounded-xl py-4 font-bold shadow-lg transition-all ${
                  isMoMoProcessing || isCashProcessing
                    ? 'cursor-not-allowed bg-neutral-600 text-gray-500'
                    : 'bg-amber-500 text-neutral-900 hover:scale-105 hover:shadow-xl hover:shadow-savoria-gold/30'
                }`}
              >
                {isCashProcessing ? (
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
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                      />
                    </svg>
                    Thanh toán tiền mặt tại nhà hàng
                  </span>
                )}
              </button>
            </div>

            {/* Back Button */}
            <div className='pt-2'>
              <button
                onClick={() => navigate(path.booking)}
                disabled={isMoMoProcessing || isCashProcessing}
                className='w-full rounded-xl border border-stone-200 py-3 font-medium text-gray-500 transition-all hover:border-stone-300 hover:bg-gray-100 hover:text-gray-600'
              >
                ← Quay lại chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
