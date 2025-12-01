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
  const { addToCart } = useCart()
  const { isAuthenticated } = useContext(AppContext)
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)

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

  const handleAddToCart = () => {
    // Kiểm tra đăng nhập trước khi thêm vào giỏ hàng
    if (!isAuthenticated) {
      error('Vui lòng đăng nhập để thêm món vào giỏ hàng!')
      onClose()
      navigate(path.login)
      return
    }

    addToCart(dish, quantity)
    success(`Đã thêm ${quantity} "${dish.name}" vào giỏ hàng!`)
    setQuantity(1) // Reset quantity
    onClose()
  }

  // Tính tổng tiền theo số lượng
  const totalPrice = dish.finalPrice * quantity

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950/80 text-white backdrop-blur-sm transition-all hover:bg-savoria-gold hover:text-neutral-900'
        >
          <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        {/* Image */}
        <div className='relative h-96 w-full overflow-hidden bg-neutral-800'>
          <img
            src={dish.image || 'https://via.placeholder.com/800x600'}
            alt={dish.name}
            className='h-full w-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent' />

          {/* Badges */}
          <div className='absolute bottom-6 left-6 flex gap-2'>
            {dish.bestSeller && (
              <span className='rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-lg'>
                ⭐ Best Seller
              </span>
            )}
            {dish.discount > 0 && (
              <span className='rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg'>
                🔥 {dish.discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className='p-8'>
          {/* Category */}
          <span className='mb-3 inline-flex items-center gap-2 rounded-full bg-savoria-gold/20 px-4 py-1.5 text-sm font-medium text-savoria-gold'>
            <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
            </svg>
            {dish.categoryId.name}
          </span>

          {/* Title */}
          <h2 className='mb-4 font-serif text-4xl font-bold text-white'>
            {dish.name}
          </h2>

          {/* Description */}
          <p className='mb-6 text-lg leading-relaxed text-neutral-300'>
            {dish.description}
          </p>

          {/* Price & Quantity Section */}
          <div className='mb-8 rounded-xl border border-neutral-800 bg-neutral-950/50 p-6'>
            {/* Price per item */}
            <div className='mb-6'>
              <p className='mb-1 text-sm text-neutral-400'>Đơn giá</p>
              <div className='flex items-baseline gap-3'>
                <p className='text-2xl font-bold text-savoria-gold'>
                  {formatPrice(dish.finalPrice)}
                </p>
                {dish.discount > 0 && (
                  <p className='text-lg text-neutral-500 line-through'>
                    {formatPrice(dish.price)}
                  </p>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className='mb-6'>
              <p className='mb-3 text-sm text-neutral-400'>Số lượng</p>
              <div className='flex items-center gap-4'>
                <div className='flex items-center rounded-xl border border-neutral-700 bg-neutral-800'>
                  <button
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1}
                    className='flex h-12 w-12 items-center justify-center rounded-l-xl text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-neutral-300'
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
                    className='h-12 w-16 border-x border-neutral-700 bg-transparent text-center text-lg font-semibold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                  />
                  <button
                    onClick={handleIncreaseQuantity}
                    className='flex h-12 w-12 items-center justify-center rounded-r-xl text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white'
                  >
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
                      <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
                    </svg>
                  </button>
                </div>
                <span className='text-sm text-neutral-400'>
                  {quantity > 1 && `(${quantity} phần)`}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className='mb-6 border-t border-neutral-800' />

            {/* Total & Add to Cart */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='mb-1 text-sm text-neutral-400'>Tổng cộng</p>
                <p className='text-3xl font-bold text-savoria-gold'>
                  {formatPrice(totalPrice)}
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                className='flex items-center justify-center gap-3 rounded-xl bg-savoria-gold px-8 py-4 font-semibold text-neutral-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-savoria-gold/30'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
                Thêm vào giỏ hàng
              </button>
            </div>

            {/* Login hint */}
            {!isAuthenticated && (
              <p className='mt-4 text-center text-sm text-neutral-500'>
                <svg className='mr-1 inline-block h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                Bạn cần <span className='text-savoria-gold cursor-pointer hover:underline' onClick={() => { onClose(); navigate(path.login) }}>đăng nhập</span> để thêm món vào giỏ hàng
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
