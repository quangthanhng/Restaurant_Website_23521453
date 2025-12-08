import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { AppContext } from '../../contexts/app.context'
import { useToast } from '../../components/Toast'
import type { Dish } from '../../types/dish.type'
import path from '../../constants/path'

interface DishDetailModalProps {
  dish: Dish | null
  onClose: () => void
}

export default function DishDetailModal({ dish, onClose }: DishDetailModalProps) {
  const { addToCart, isLoading: isCartLoading } = useCart()
  const { isAuthenticated } = useContext(AppContext)
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  if (!dish) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const handleDecreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1))
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 1) {
      setQuantity(value)
    } else if (e.target.value === '') {
      setQuantity(1)
    }
  }

  const handleAddToCart = async () => {
    // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
    if (!isAuthenticated) {
      error('Vui lòng đăng nhập để thêm món vào giỏ hàng!')
      onClose()
      navigate(path.login)
      return
    }

    try {
      setIsAdding(true)
      await addToCart(dish, quantity)
      success(`Đã thêm ${quantity} "${dish.name}" vào giỏ hàng!`)
      setQuantity(1) // Reset quantity
      onClose()
    } catch {
      error('Có lỗi xảy ra khi thêm vào giỏ hàng!')
    } finally {
      setIsAdding(false)
    }
  }

  // Tính tổng tiền theo số lượng
  const totalPrice = dish.finalPrice * quantity

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-900 backdrop-blur-sm transition-all hover:bg-amber-500 hover:text-neutral-900'
        >
          <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        {/* Image */}
        <div className='relative h-96 w-full overflow-hidden bg-gray-100'>
          <img
            src={dish.image || 'https://via.placeholder.com/800x600'}
            alt={dish.name}
            className='h-full w-full object-cover'
          />
          <div className='absolute inset-0 bg-linear-to-t from-gray-50 via-transparent to-transparent' />

          {/* Badges */}
          <div className='absolute bottom-6 left-6 flex gap-2'>
            {dish.bestSeller && (
              <span className='rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-gray-900 shadow-lg'>
                ⭐ Best Seller
              </span>
            )}
            {dish.discount > 0 && (
              <span className='rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-gray-900 shadow-lg'>
                🔥 {dish.discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className='p-8'>
          {/* Category */}
          <span className='mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1.5 text-sm font-medium text-amber-600'>
            <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
            </svg>
            {dish.categoryId.name}
          </span>

          {/* Title */}
          <h2 className='mb-4 font-serif text-4xl font-bold text-gray-900'>
            {dish.name}
          </h2>

          {/* Description */}
          <p className='mb-6 text-lg leading-relaxed text-gray-600'>
            {dish.description}
          </p>

          {/* Price & Quantity Section */}
          <div className='mb-8 rounded-xl border border-gray-200 bg-white/50 p-6'>
            {/* Price per item */}
            <div className='mb-6'>
              <p className='mb-1 text-sm text-gray-500'>Đơn giá</p>
              <div className='flex items-baseline gap-3'>
                <p className='text-2xl font-bold text-amber-600'>
                  {formatPrice(dish.finalPrice)}
                </p>
                {dish.discount > 0 && (
                  <p className='text-lg text-gray-400 line-through'>
                    {formatPrice(dish.price)}
                  </p>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className='mb-6'>
              <p className='mb-3 text-sm text-gray-500'>Số lượng</p>
              <div className='flex items-center gap-4'>
                <div className='flex items-center rounded-xl border border-stone-200 bg-gray-100'>
                  <button
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1}
                    className='flex h-12 w-12 items-center justify-center rounded-l-xl text-gray-600 transition-all hover:bg-neutral-700 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-600'
                  >
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M20 12H4' />
                    </svg>
                  </button>
                  <input
                    type='number'
                    min='1'
                    value={quantity}
                    onChange={handleQuantityChange}
                    className='h-12 w-16 border-x border-stone-200 bg-transparent text-center text-lg font-semibold text-gray-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                  />
                  <button
                    onClick={handleIncreaseQuantity}
                    className='flex h-12 w-12 items-center justify-center rounded-r-xl text-gray-600 transition-all hover:bg-neutral-700 hover:text-gray-900'
                  >
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
                    </svg>
                  </button>
                </div>
                <span className='text-sm text-gray-500'>
                  {quantity > 1 && `(${quantity} phần)`}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className='mb-6 border-t border-gray-200' />

            {/* Total & Add to Cart */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='mb-1 text-sm text-gray-500'>Tổng cộng</p>
                <p className='text-3xl font-bold text-amber-600'>
                  {formatPrice(totalPrice)}
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isCartLoading}
                className='flex items-center justify-center gap-3 rounded-xl bg-amber-500 px-8 py-4 font-semibold text-neutral-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-savoria-gold/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100'
              >
                {isAdding ? (
                  <>
                    <svg className='h-5 w-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                    </svg>
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
                    </svg>
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>
            </div>

            {/* Login hint */}
            {!isAuthenticated && (
              <p className='mt-4 text-center text-sm text-gray-400'>
                <svg className='mr-1 inline-block h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                Bạn cần <span className='text-amber-600 cursor-pointer hover:underline' onClick={() => { onClose(); navigate(path.login) }}>đăng nhập</span> để thêm món vào giỏ hàng
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
