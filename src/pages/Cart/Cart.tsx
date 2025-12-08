import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../components/Toast'
import path from '../../constants/path'

export default function Cart() {
  const { cartItems, isLoading, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalItems } = useCart()
  const { success, error } = useToast()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Handle quantity change
  const handleQuantityChange = async (dishId: string, newQuantity: number) => {
    try {
      await updateQuantity(dishId, newQuantity)
    } catch {
      error('Có lỗi xảy ra khi cập nhật số lượng!')
    }
  }

  // Handle remove item
  const handleRemoveItem = async (dishId: string, dishName: string) => {
    try {
      await removeFromCart(dishId)
      success(`Đã xóa "${dishName}" khỏi giỏ hàng!`)
    } catch {
      error('Có lỗi xảy ra khi xóa món!')
    }
  }

  // Handle clear cart - show confirm modal
  const handleClearCart = () => {
    if (cartItems.length === 0) return
    setShowClearConfirm(true)
  }

  // Confirm clear cart
  const confirmClearCart = async () => {
    setIsClearing(true)
    try {
      await clearCart()
      success('Đã xóa toàn bộ giỏ hàng!')
      setShowClearConfirm(false)
    } catch {
      error('Có lỗi xảy ra khi xóa giỏ hàng!')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className='min-h-screen w-full bg-white pt-[74px]'>
      {/* Hero Section */}
      <section className='relative h-[300px] w-full overflow-hidden bg-linear-to-b from-gray-50 to-white'>
        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-[0.03]'>
          <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
            <defs>
              <pattern id='cart-grid' width='60' height='60' patternUnits='userSpaceOnUse'>
                <path d='M 60 0 L 0 0 0 60' fill='none' stroke='white' strokeWidth='1' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#cart-grid)' />
          </svg>
        </div>

        {/* Gradient Orbs */}
        <div className='pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]' />
        <div className='pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]' />

        {/* Content */}
        <div className='relative flex h-full flex-col items-center justify-center px-6 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-6 py-2 backdrop-blur-sm'>
            <svg
              className='h-5 w-5 text-amber-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              strokeWidth='2'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
            <span className='text-sm font-medium text-amber-600'>Giỏ hàng</span>
          </div>
          <h1 className='mb-4 font-serif text-5xl font-bold text-gray-900 md:text-6xl'>
            Giỏ Hàng
            <span className='block text-amber-600'>Của Bạn</span>
          </h1>
          <p className='max-w-2xl text-lg text-gray-600'>Xem lại các món ăn bạn đã chọn trước khi đặt hàng</p>
        </div>
      </section>

      {/* Main Content */}
      <section className='mx-auto max-w-6xl px-6 py-12'>
        {/* Loading State */}
        {isLoading && (
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='flex flex-col items-center gap-4'>
              <svg className='h-12 w-12 animate-spin text-amber-600' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                />
              </svg>
              <p className='text-gray-500'>Đang tải giỏ hàng...</p>
            </div>
          </div>
        )}

        {/* Empty Cart */}
        {!isLoading && cartItems.length === 0 && (
          <div className='flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-12'>
            <svg
              className='mb-6 h-24 w-24 text-gray-300'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
              />
            </svg>
            <h3 className='mb-2 text-2xl font-semibold text-gray-600'>Giỏ hàng trống</h3>
            <p className='mb-8 text-center text-gray-400'>
              Bạn chưa thêm món ăn nào vào giỏ hàng.
              <br />
              Hãy khám phá thực đơn của chúng tôi!
            </p>
            <Link
              to={path.menu}
              className='flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-4 font-semibold text-neutral-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-savoria-gold/30'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                />
              </svg>
              Xem thực đơn
            </Link>
          </div>
        )}

        {/* Cart Items */}
        {!isLoading && cartItems.length > 0 && (
          <div className='grid gap-8 lg:grid-cols-3'>
            {/* Items List */}
            <div className='lg:col-span-2'>
              {/* Header */}
              <div className='mb-6 flex items-center justify-between'>
                <h2 className='font-serif text-2xl font-bold text-gray-900'>Các món đã chọn ({getTotalItems()})</h2>
                <button
                  onClick={handleClearCart}
                  disabled={isLoading}
                  className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-amber-400 transition-all hover:bg-amber-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                  Xóa tất cả
                </button>
              </div>

              {/* Items */}
              <div className='space-y-4'>
                {cartItems.map((item) => (
                  <div
                    key={item.dish._id}
                    className='group overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all hover:border-stone-200'
                  >
                    <div className='flex flex-col sm:flex-row'>
                      {/* Image */}
                      <div className='relative h-48 w-full shrink-0 overflow-hidden bg-gray-100 sm:h-auto sm:w-40'>
                        <img
                          src={item.dish.image || 'https://via.placeholder.com/160x160'}
                          alt={item.dish.name}
                          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
                        />
                      </div>

                      {/* Content */}
                      <div className='flex flex-1 flex-col p-5'>
                        <div className='flex items-start justify-between gap-4'>
                          <div>
                            <h3 className='font-serif text-lg font-bold text-gray-900 transition-colors group-hover:text-amber-600'>
                              {item.dish.name}
                            </h3>
                            <p className='mt-1 text-lg font-semibold text-amber-600'>
                              {formatPrice(item.dish.finalPrice)}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.dish._id, item.dish.name)}
                            disabled={isLoading}
                            className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-amber-500/10 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            <svg
                              className='h-5 w-5'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                              strokeWidth='2'
                            >
                              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                            </svg>
                          </button>
                        </div>

                        {/* Quantity & Subtotal */}
                        <div className='mt-4 flex items-center justify-between'>
                          {/* Quantity Controls */}
                          <div className='flex items-center rounded-lg border border-stone-200 bg-gray-100'>
                            <button
                              onClick={() => handleQuantityChange(item.dish._id, item.quantity - 1)}
                              disabled={isLoading || item.quantity <= 1}
                              className='flex h-9 w-9 items-center justify-center text-gray-600 transition-all hover:bg-neutral-700 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              <svg
                                className='h-4 w-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                strokeWidth='2.5'
                              >
                                <path strokeLinecap='round' strokeLinejoin='round' d='M20 12H4' />
                              </svg>
                            </button>
                            <span className='w-10 text-center font-semibold text-gray-900'>{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.dish._id, item.quantity + 1)}
                              disabled={isLoading}
                              className='flex h-9 w-9 items-center justify-center text-gray-600 transition-all hover:bg-neutral-700 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              <svg
                                className='h-4 w-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                strokeWidth='2.5'
                              >
                                <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
                              </svg>
                            </button>
                          </div>

                          {/* Subtotal */}
                          <p className='text-lg font-bold text-gray-900'>
                            {formatPrice(item.dish.finalPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className='mt-6'>
                <Link
                  to={path.menu}
                  className='inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-amber-600'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                  </svg>
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className='lg:col-span-1'>
              <div className='sticky top-24 rounded-xl border border-gray-200 bg-gray-50 p-6'>
                <h3 className='mb-6 font-serif text-xl font-bold text-gray-900'>Tóm tắt đơn hàng</h3>

                {/* Summary Items */}
                <div className='space-y-4'>
                  <div className='flex justify-between text-gray-600'>
                    <span>Tạm tính ({getTotalItems()} món)</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className='flex justify-between text-gray-600'>
                    <span>Phí giao hàng</span>
                    <span className='text-amber-600'>Miễn phí</span>
                  </div>
                </div>

                {/* Divider */}
                <div className='my-6 border-t border-gray-200' />

                {/* Total */}
                <div className='mb-6 flex justify-between'>
                  <span className='text-lg font-semibold text-gray-900'>Tổng cộng</span>
                  <span className='text-2xl font-bold text-amber-600'>{formatPrice(getTotalPrice())}</span>
                </div>

                {/* Checkout Button */}
                <Link
                  to={path.checkout}
                  className='flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 font-semibold text-neutral-900 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-savoria-gold/30'
                >
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                  Tiến hành thanh toán
                </Link>

                {/* Secure Payment Note */}
                <p className='mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-400'>
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                  Thanh toán an toàn & bảo mật
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Clear Cart Confirm Modal */}
      {showClearConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            onClick={() => !isClearing && setShowClearConfirm(false)}
          />

          {/* Modal */}
          <div className='relative z-10 w-full max-w-md transform animate-[fadeIn_0.2s_ease-out] rounded-2xl bg-white p-6 shadow-2xl'>
            {/* Icon */}
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
              <svg
                className='h-8 w-8 text-red-500'
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
            </div>

            {/* Content */}
            <h3 className='mb-2 text-center text-xl font-bold text-gray-900'>Xóa toàn bộ giỏ hàng?</h3>
            <p className='mb-6 text-center text-gray-500'>
              Bạn có chắc chắn muốn xóa tất cả{' '}
              <span className='font-semibold text-amber-600'>{getTotalItems()} món</span> khỏi giỏ hàng? Hành động này
              không thể hoàn tác.
            </p>

            {/* Buttons */}
            <div className='flex gap-3'>
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={isClearing}
                className='flex-1 rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Hủy
              </button>
              <button
                onClick={confirmClearCart}
                disabled={isClearing}
                className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-semibold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isClearing ? (
                  <>
                    <svg className='h-5 w-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                    Xóa tất cả
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
