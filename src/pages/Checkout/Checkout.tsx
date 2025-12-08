import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../components/Toast'
import { AppContext } from '../../contexts/app.context'
import orderApi from '../../apis/order.api'
import paymentApi from '../../apis/payment.api'
import path from '../../constants/path'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, cartItems, getTotalPrice, clearCart, isLoading: isLoadingCart } = useCart()
  const { isAuthenticated, profile } = useContext(AppContext)
  const { success, error } = useToast()

  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'cod'>('cod')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      error('Vui lòng đăng nhập để thanh toán!')
      navigate(path.login)
      return
    }
  }, [isAuthenticated, navigate, error])

  // Pre-fill user info
  useEffect(() => {
    if (profile) {
      setFullName(profile.username || '')
      setEmail(profile.email || '')
    }
  }, [profile])

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Calculate totals
  const subtotal = getTotalPrice()
  const shippingFee = 0 // Free shipping
  const totalPrice = subtotal + shippingFee

  // Validate form
  const isFormValid = () => {
    return fullName.trim() && email.trim() && phone.trim() && address.trim() && cartItems.length > 0
  }

  // Handle submit order
  const handleSubmitOrder = async () => {
    if (!isFormValid()) {
      error('Vui lòng điền đầy đủ thông tin!')
      return
    }

    if (!cart?._id) {
      error('Không tìm thấy giỏ hàng!')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Tạo order trên backend
      // Tên và SĐT sẽ được lấy từ userId (user đang đăng nhập)
      const orderData = {
        cartId: cart._id,
        deleveryAddress: address, // Chỉ lưu địa chỉ, không ghép tên/SĐT
        deliveryOptions: 'delivery' as const,
        totalPrice: totalPrice,
        // Backend chỉ chấp nhận: 'cash', 'card', 'online', 'momo', 'zalopay'
        typeOfPayment: (paymentMethod === 'cod' ? 'cash' : paymentMethod) as 'cash' | 'momo'
      }

      console.log('Creating order with data:', orderData)
      const orderResponse = await orderApi.createOrder(orderData)
      const createdOrder = orderResponse.data.metadata
      console.log('Order created:', createdOrder)

      success('Đơn hàng đã được tạo thành công!')

      // 2. Xử lý thanh toán theo phương thức
      if (paymentMethod === 'momo') {
        // Thanh toán MoMo
        try {
          console.log('Creating MoMo payment for order:', createdOrder._id)
          const momoResponse = await paymentApi.createMoMoPayment({
            email: email,
            id: createdOrder._id
          })

          console.log('MoMo response:', momoResponse)
          const payUrl = momoResponse.data?.data?.payUrl

          if (payUrl) {
            // Clear cart trước khi redirect
            await clearCart()
            // Redirect tới MoMo
            window.location.href = payUrl
          } else {
            error('Không thể tạo link thanh toán MoMo!')
          }
        } catch (momoError) {
          console.error('MoMo payment error:', momoError)
          error('Có lỗi khi tạo thanh toán MoMo!')
        }
      } else {
        // Thanh toán khi nhận hàng (COD)
        await clearCart()
        success('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.')
        navigate(path.home)
      }
    } catch (err) {
      console.error('Order error:', err)
      error('Có lỗi xảy ra khi đặt hàng!')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If cart is empty, show message
  if (!isLoadingCart && cartItems.length === 0) {
    return (
      <div className='min-h-screen w-full bg-white pt-[74px]'>
        <div className='mx-auto max-w-4xl px-6 py-24 text-center'>
          <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100'>
            <svg className='h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
          </div>
          <h1 className='mb-4 text-2xl font-bold text-gray-900'>Giỏ hàng trống</h1>
          <p className='mb-8 text-gray-500'>Vui lòng thêm món vào giỏ hàng trước khi thanh toán.</p>
          <button
            onClick={() => navigate(path.menu)}
            className='rounded-full bg-amber-500 px-8 py-3 font-medium text-neutral-900 transition-all hover:bg-amber-500/90'
          >
            Xem thực đơn
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-white pt-[74px]'>
      {/* Hero Section */}
      <section className='relative h-[200px] w-full overflow-hidden bg-linear-to-b from-gray-50 to-white'>
        <div className='absolute inset-0 opacity-[0.03]'>
          <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
            <defs>
              <pattern id='checkout-grid' width='60' height='60' patternUnits='userSpaceOnUse'>
                <path d='M 60 0 L 0 0 0 60' fill='none' stroke='white' strokeWidth='1' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#checkout-grid)' />
          </svg>
        </div>

        <div className='pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]' />

        <div className='relative flex h-full flex-col items-center justify-center px-6 text-center'>
          <h1 className='mb-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl'>
            Thanh Toán <span className='text-amber-600'>Đơn Hàng</span>
          </h1>
          <p className='text-gray-500'>Hoàn tất đơn hàng của bạn</p>
        </div>
      </section>

      {/* Main Content */}
      <section className='mx-auto max-w-6xl px-6 py-12'>
        <div className='grid gap-8 lg:grid-cols-3'>
          {/* Left: Order Items + Form */}
          <div className='space-y-8 lg:col-span-2'>
            {/* Order Items */}
            <div className='rounded-2xl border border-gray-200 bg-gray-50 p-6'>
              <h2 className='mb-6 font-serif text-2xl font-bold text-gray-900'>Đơn hàng của bạn</h2>

              <div className='space-y-4'>
                {cartItems.map((item) => (
                  <div
                    key={item.dish._id}
                    className='flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4'
                  >
                    <img
                      src={item.dish.image || '/placeholder-food.jpg'}
                      alt={item.dish.name}
                      className='h-16 w-16 rounded-lg object-cover'
                    />
                    <div className='flex-1'>
                      <h3 className='font-medium text-gray-900'>{item.dish.name}</h3>
                      <p className='text-sm text-gray-500'>
                        {formatPrice(item.dish.finalPrice || item.dish.price)} x {item.quantity}
                      </p>
                    </div>
                    <p className='font-semibold text-amber-600'>
                      {formatPrice((item.dish.finalPrice || item.dish.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info Form */}
            <div className='rounded-2xl border border-gray-200 bg-gray-50 p-6'>
              <h2 className='mb-6 font-serif text-2xl font-bold text-gray-900'>Thông tin giao hàng</h2>

              <div className='space-y-4'>
                {/* Full Name */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-600'>
                    Họ và tên <span className='text-amber-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder='Nhập họ và tên'
                    className='w-full rounded-xl border border-stone-200 bg-gray-100 px-4 py-3 text-gray-900 placeholder-neutral-500 focus:border-amber-500 focus:outline-none'
                  />
                </div>

                {/* Email */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-600'>
                    Email <span className='text-amber-500'>*</span>
                  </label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='example@email.com'
                    className='w-full rounded-xl border border-stone-200 bg-gray-100 px-4 py-3 text-gray-900 placeholder-neutral-500 focus:border-amber-500 focus:outline-none'
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-600'>
                    Số điện thoại <span className='text-amber-500'>*</span>
                  </label>
                  <input
                    type='tel'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='0123456789'
                    className='w-full rounded-xl border border-stone-200 bg-gray-100 px-4 py-3 text-gray-900 placeholder-neutral-500 focus:border-amber-500 focus:outline-none'
                  />
                </div>

                {/* Address */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-600'>
                    Địa chỉ giao hàng <span className='text-amber-500'>*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder='Nhập địa chỉ giao hàng đầy đủ'
                    rows={3}
                    className='w-full rounded-xl border border-stone-200 bg-gray-100 px-4 py-3 text-gray-900 placeholder-neutral-500 focus:border-amber-500 focus:outline-none'
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-600'>Ghi chú</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder='Ghi chú cho đơn hàng (không bắt buộc)'
                    rows={2}
                    className='w-full rounded-xl border border-stone-200 bg-gray-100 px-4 py-3 text-gray-900 placeholder-neutral-500 focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className='rounded-2xl border border-gray-200 bg-gray-50 p-6'>
              <h2 className='mb-6 font-serif text-2xl font-bold text-gray-900'>Phương thức thanh toán</h2>

              <div className='space-y-3'>
                {/* MoMo */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-stone-200 bg-gray-100 hover:border-stone-300'
                  }`}
                >
                  <input
                    type='radio'
                    name='paymentMethod'
                    value='momo'
                    checked={paymentMethod === 'momo'}
                    onChange={() => setPaymentMethod('momo')}
                    className='h-5 w-5 accent-pink-500'
                  />
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500'>
                      <span className='text-lg font-bold text-gray-900'>M</span>
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>Thanh toán qua MoMo</p>
                      <p className='text-sm text-gray-500'>Thanh toán nhanh chóng qua ví MoMo</p>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-stone-200 bg-gray-100 hover:border-stone-300'
                  }`}
                >
                  <input
                    type='radio'
                    name='paymentMethod'
                    value='cod'
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className='h-5 w-5 accent-savoria-gold'
                  />
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500'>
                      <svg className='h-6 w-6 text-neutral-900' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>Thanh toán khi nhận hàng (COD)</p>
                      <p className='text-sm text-gray-500'>Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className='lg:col-span-1'>
            <div className='sticky top-[90px] rounded-2xl border border-gray-200 bg-gray-50 p-6'>
              <h2 className='mb-6 font-serif text-xl font-bold text-gray-900'>Tóm tắt đơn hàng</h2>

              <div className='space-y-4'>
                {/* Subtotal */}
                <div className='flex justify-between text-gray-500'>
                  <span>Tạm tính ({cartItems.length} món)</span>
                  <span className='text-gray-900'>{formatPrice(subtotal)}</span>
                </div>

                {/* Shipping */}
                <div className='flex justify-between text-gray-500'>
                  <span>Phí giao hàng</span>
                  <span className='text-green-500'>Miễn phí</span>
                </div>

                {/* Divider */}
                <div className='border-t border-stone-200' />

                {/* Total */}
                <div className='flex justify-between'>
                  <span className='text-lg font-semibold text-gray-900'>Tổng cộng</span>
                  <span className='text-2xl font-bold text-amber-600'>{formatPrice(totalPrice)}</span>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={!isFormValid() || isSubmitting}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 font-semibold transition-all ${
                    isFormValid() && !isSubmitting
                      ? paymentMethod === 'momo'
                        ? 'bg-pink-500 text-gray-900 hover:bg-pink-600'
                        : 'bg-amber-500 text-neutral-900 hover:bg-amber-500/90'
                      : 'cursor-not-allowed bg-neutral-700 text-gray-500'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className='h-5 w-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        />
                      </svg>
                      <span>Đang xử lý...</span>
                    </>
                  ) : paymentMethod === 'momo' ? (
                    <>
                      <span>Thanh toán với MoMo</span>
                      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M14 5l7 7m0 0l-7 7m7-7H3'
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Đặt hàng</span>
                      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                      </svg>
                    </>
                  )}
                </button>

                {/* Security Note */}
                <p className='mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-400'>
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                  Thanh toán an toàn & bảo mật
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Cart */}
        <div className='mt-8'>
          <button
            onClick={() => navigate(path.cart)}
            className='flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900'
          >
            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            <span>Quay lại giỏ hàng</span>
          </button>
        </div>
      </section>
    </div>
  )
}
