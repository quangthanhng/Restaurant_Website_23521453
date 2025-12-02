import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../components/Toast'
import path from '../../constants/path'

export default function Cart() {
    const { cartItems, isLoading, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalItems } = useCart()
    const { success, error } = useToast()

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

    // Handle clear cart
    const handleClearCart = async () => {
        if (cartItems.length === 0) return

        const confirmClear = window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')
        if (!confirmClear) return

        try {
            await clearCart()
            success('Đã xóa toàn bộ giỏ hàng!')
        } catch {
            error('Có lỗi xảy ra khi xóa giỏ hàng!')
        }
    }

    return (
        <div className='min-h-screen w-full bg-neutral-950 pt-[74px]'>
            {/* Hero Section */}
            <section className='relative h-[300px] w-full overflow-hidden bg-linear-to-b from-neutral-900 to-neutral-950'>
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
                <div className='pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-savoria-gold/10 blur-[120px]' />
                <div className='pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-savoria-gold/10 blur-[120px]' />

                {/* Content */}
                <div className='relative flex h-full flex-col items-center justify-center px-6 text-center'>
                    <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-savoria-gold/30 bg-savoria-gold/10 px-6 py-2 backdrop-blur-sm'>
                        <svg className='h-5 w-5 text-savoria-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                        <span className='text-sm font-medium text-savoria-gold'>Giỏ hàng</span>
                    </div>
                    <h1 className='mb-4 font-serif text-5xl font-bold text-white md:text-6xl'>
                        Giỏ Hàng
                        <span className='block text-savoria-gold'>Của Bạn</span>
                    </h1>
                    <p className='max-w-2xl text-lg text-neutral-300'>
                        Xem lại các món ăn bạn đã chọn trước khi đặt hàng
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className='mx-auto max-w-6xl px-6 py-12'>
                {/* Loading State */}
                {isLoading && (
                    <div className='flex min-h-[400px] items-center justify-center'>
                        <div className='flex flex-col items-center gap-4'>
                            <svg className='h-12 w-12 animate-spin text-savoria-gold' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                            </svg>
                            <p className='text-neutral-400'>Đang tải giỏ hàng...</p>
                        </div>
                    </div>
                )}

                {/* Empty Cart */}
                {!isLoading && cartItems.length === 0 && (
                    <div className='flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12'>
                        <svg className='mb-6 h-24 w-24 text-neutral-600' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='1.5'>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                        <h3 className='mb-2 text-2xl font-semibold text-neutral-300'>Giỏ hàng trống</h3>
                        <p className='mb-8 text-center text-neutral-500'>
                            Bạn chưa thêm món ăn nào vào giỏ hàng.<br />
                            Hãy khám phá thực đơn của chúng tôi!
                        </p>
                        <Link
                            to={path.menu}
                            className='flex items-center gap-2 rounded-xl bg-savoria-gold px-8 py-4 font-semibold text-neutral-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-savoria-gold/30'
                        >
                            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
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
                                <h2 className='font-serif text-2xl font-bold text-white'>
                                    Các món đã chọn ({getTotalItems()})
                                </h2>
                                <button
                                    onClick={handleClearCart}
                                    disabled={isLoading}
                                    className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                    </svg>
                                    Xóa tất cả
                                </button>
                            </div>

                            {/* Items */}
                            <div className='space-y-4'>
                                {cartItems.map((item) => (
                                    <div
                                        key={item.dish._id}
                                        className='group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 transition-all hover:border-neutral-700'
                                    >
                                        <div className='flex flex-col sm:flex-row'>
                                            {/* Image */}
                                            <div className='relative h-48 w-full shrink-0 overflow-hidden bg-neutral-800 sm:h-auto sm:w-40'>
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
                                                        <h3 className='font-serif text-lg font-bold text-white transition-colors group-hover:text-savoria-gold'>
                                                            {item.dish.name}
                                                        </h3>
                                                        <p className='mt-1 text-lg font-semibold text-savoria-gold'>
                                                            {formatPrice(item.dish.finalPrice)}
                                                        </p>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => handleRemoveItem(item.dish._id, item.dish.name)}
                                                        disabled={isLoading}
                                                        className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50'
                                                    >
                                                        <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Quantity & Subtotal */}
                                                <div className='mt-4 flex items-center justify-between'>
                                                    {/* Quantity Controls */}
                                                    <div className='flex items-center rounded-lg border border-neutral-700 bg-neutral-800'>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.dish._id, item.quantity - 1)}
                                                            disabled={isLoading || item.quantity <= 1}
                                                            className='flex h-9 w-9 items-center justify-center text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
                                                        >
                                                            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' d='M20 12H4' />
                                                            </svg>
                                                        </button>
                                                        <span className='w-10 text-center font-semibold text-white'>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.dish._id, item.quantity + 1)}
                                                            disabled={isLoading}
                                                            className='flex h-9 w-9 items-center justify-center text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
                                                        >
                                                            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
                                                                <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* Subtotal */}
                                                    <p className='text-lg font-bold text-white'>
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
                                    className='inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-savoria-gold'
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
                            <div className='sticky top-24 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6'>
                                <h3 className='mb-6 font-serif text-xl font-bold text-white'>
                                    Tóm tắt đơn hàng
                                </h3>

                                {/* Summary Items */}
                                <div className='space-y-4'>
                                    <div className='flex justify-between text-neutral-300'>
                                        <span>Tạm tính ({getTotalItems()} món)</span>
                                        <span>{formatPrice(getTotalPrice())}</span>
                                    </div>
                                    <div className='flex justify-between text-neutral-300'>
                                        <span>Phí giao hàng</span>
                                        <span className='text-savoria-gold'>Miễn phí</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className='my-6 border-t border-neutral-800' />

                                {/* Total */}
                                <div className='mb-6 flex justify-between'>
                                    <span className='text-lg font-semibold text-white'>Tổng cộng</span>
                                    <span className='text-2xl font-bold text-savoria-gold'>
                                        {formatPrice(getTotalPrice())}
                                    </span>
                                </div>

                                {/* Checkout Button */}
                                <Link
                                    to={path.payment}
                                    className='flex w-full items-center justify-center gap-2 rounded-xl bg-savoria-gold px-8 py-4 font-semibold text-neutral-900 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-savoria-gold/30'
                                >
                                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                                    </svg>
                                    Tiến hành thanh toán
                                </Link>

                                {/* Secure Payment Note */}
                                <p className='mt-4 flex items-center justify-center gap-2 text-center text-xs text-neutral-500'>
                                    <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
                                        <path strokeLinecap='round' strokeLinejoin='round' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                                    </svg>
                                    Thanh toán an toàn & bảo mật
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
