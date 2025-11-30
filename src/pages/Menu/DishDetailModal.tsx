import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../components/Toast'
import type { Dish } from '../../types/dish.type'

interface DishDetailModalProps {
    dish: Dish | null
    onClose: () => void
}

export default function DishDetailModal({ dish, onClose }: DishDetailModalProps) {
    const { addToCart } = useCart()
    const { success } = useToast()

    if (!dish) return null

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    const handleAddToCart = () => {
        addToCart(dish)
        success(`Đã thêm "${dish.name}" vào giỏ hàng!`)
        onClose()
    }

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

                    {/* Price Section */}
                    <div className='mb-8 flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-950/50 p-6'>
                        <div className='flex-1'>
                            <p className='mb-1 text-sm text-neutral-400'>Price</p>
                            <div className='flex items-baseline gap-3'>
                                <p className='text-3xl font-bold text-savoria-gold'>
                                    {formatPrice(dish.finalPrice)}
                                </p>
                                {dish.discount > 0 && (
                                    <p className='text-lg text-neutral-500 line-through'>
                                        {formatPrice(dish.price)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className='flex items-center gap-3 rounded-xl bg-savoria-gold px-8 py-4 font-semibold text-neutral-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-savoria-gold/30'
                        >
                            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2.5'>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
                            </svg>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
