import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import dishApi from '../../apis/dish.api'
import type { Dish } from '../../types/dish.type'
import path from '../../constants/path'
import ButtonPrimary from '../../components/ButtonPrimary'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../components/Toast'

export default function DishDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const toast = useToast()
  const [quantity, setQuantity] = useState(1)
  const [relatedDishes, setRelatedDishes] = useState<Dish[]>([])

  // Scroll to top when page loads or dish changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const { data, isLoading, error } = useQuery({
    queryKey: ['dish-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No dish ID')
      const response = await dishApi.getDishDetail(id)
      return response.data
    },
    enabled: !!id
  })

  const dish = data?.metadata as unknown as Dish

  // Fetch related dishes from same category
  useEffect(() => {
    if (dish?.categoryId?._id) {
      dishApi.getDishes({ category: dish.categoryId._id, limit: 4, status: 'active' }).then((res) => {
        const dishes = res.data?.metadata?.dishes || []
        setRelatedDishes(dishes.filter((d: Dish) => d._id !== dish._id).slice(0, 3))
      })
    }
  }, [dish])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  const handleAddToCart = () => {
    if (dish) {
      // addToCart expects Dish object and quantity
      addToCart(dish, quantity)
      toast.success(`Đã thêm ${quantity} ${dish.name} vào giỏ hàng!`)
    }
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center pt-[74px]'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent'></div>
      </div>
    )
  }

  if (error || !dish) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center pt-[74px]'>
        <div className='text-6xl'>🍜</div>
        <h2 className='mt-4 text-2xl font-bold text-stone-800'>Không tìm thấy món ăn</h2>
        <p className='mt-2 text-stone-500'>Món ăn này có thể không còn tồn tại hoặc đã bị xóa.</p>
        <Link to={path.menu} className='mt-6 text-amber-600 hover:underline'>
          ← Quay lại menu
        </Link>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-stone-50 pt-[74px]'>
      {/* Breadcrumb */}
      <div className='bg-white border-b border-stone-200'>
        <div className='mx-auto max-w-7xl px-6 py-4'>
          <nav className='flex items-center gap-2 text-sm text-stone-500'>
            <Link to={path.home} className='hover:text-amber-600'>
              Trang chủ
            </Link>
            <span>/</span>
            <Link to={path.menu} className='hover:text-amber-600'>
              Menu
            </Link>
            <span>/</span>
            <span className='text-stone-800 font-medium'>{dish.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-6 py-12'>
        <div className='grid gap-12 lg:grid-cols-2'>
          {/* Image Section */}
          <div className='relative'>
            <div className='aspect-square overflow-hidden rounded-3xl bg-white shadow-lg'>
              <img src={dish.image} alt={dish.name} className='h-full w-full object-cover' />
            </div>
            {/* Badges */}
            <div className='absolute top-4 left-4 flex flex-col gap-2'>
              {dish.bestSeller && (
                <span className='inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-sm font-semibold text-white shadow-lg'>
                  🔥 Best Seller
                </span>
              )}
              {dish.discount > 0 && (
                <span className='inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white shadow-lg'>
                  -{dish.discount}%
                </span>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className='flex flex-col'>
            {/* Category */}
            <span className='mb-2 text-sm font-medium text-amber-600'>{dish.categoryId?.name || 'Món ăn'}</span>

            {/* Name */}
            <h1 className='mb-4 text-3xl font-bold text-stone-800 lg:text-4xl'>{dish.name}</h1>

            {/* Rating */}
            <div className='mb-6 flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(dish.rating || 5) ? 'fill-amber-400' : 'fill-gray-200'}`}
                    viewBox='0 0 20 20'
                  >
                    <path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z' />
                  </svg>
                ))}
              </div>
              <span className='text-sm text-stone-500'>({dish.rating || 5}/5)</span>
            </div>

            {/* Price */}
            <div className='mb-6 flex items-baseline gap-3'>
              <span className='text-3xl font-bold text-amber-600'>{formatPrice(dish.finalPrice || dish.price)}</span>
              {dish.discount > 0 && (
                <span className='text-xl text-stone-400 line-through'>{formatPrice(dish.price)}</span>
              )}
            </div>

            {/* Description */}
            <p className='mb-8 text-lg leading-relaxed text-stone-600'>
              {dish.description || 'Món ăn ngon, được chế biến từ nguyên liệu tươi ngon nhất.'}
            </p>

            {/* Prepare Time & Ingredients */}
            <div className='mb-8 grid grid-cols-2 gap-4'>
              {dish.prepareTime && (
                <div className='rounded-xl bg-white p-4 shadow-sm'>
                  <div className='text-2xl'>⏱️</div>
                  <div className='mt-2 text-sm text-stone-500'>Thời gian chuẩn bị</div>
                  <div className='font-semibold text-stone-800'>{dish.prepareTime} phút</div>
                </div>
              )}
              {dish.ingredients && dish.ingredients.length > 0 && (
                <div className='rounded-xl bg-white p-4 shadow-sm'>
                  <div className='text-2xl'>🥘</div>
                  <div className='mt-2 text-sm text-stone-500'>Nguyên liệu</div>
                  <div className='font-semibold text-stone-800'>
                    {Array.isArray(dish.ingredients) ? dish.ingredients.join(', ') : dish.ingredients}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className='mb-8 flex items-center gap-4'>
              <span className='text-stone-600'>Số lượng:</span>
              <div className='flex items-center rounded-xl border border-stone-200 bg-white'>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className='px-4 py-3 text-xl text-stone-600 hover:text-amber-600 transition-colors'
                >
                  −
                </button>
                <span className='px-6 py-3 text-lg font-semibold'>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className='px-4 py-3 text-xl text-stone-600 hover:text-amber-600 transition-colors'
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4'>
              <button
                onClick={handleAddToCart}
                className='flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-amber-600 hover:shadow-xl'
              >
                <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
                Thêm vào giỏ
              </button>
              <ButtonPrimary to={path.booking} className='px-8 py-4 text-lg'>
                Đặt bàn ngay
              </ButtonPrimary>
            </div>
          </div>
        </div>

        {/* Related Dishes */}
        {relatedDishes.length > 0 && (
          <div className='mt-20'>
            <h2 className='mb-8 text-2xl font-bold text-stone-800'>Món ăn tương tự</h2>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {relatedDishes.map((relatedDish) => (
                <Link
                  key={relatedDish._id}
                  to={`/dish/${relatedDish._id}`}
                  className='group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl'
                >
                  <div className='aspect-video overflow-hidden'>
                    <img
                      src={relatedDish.image}
                      alt={relatedDish.name}
                      className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
                    />
                  </div>
                  <div className='p-4'>
                    <h3 className='font-semibold text-stone-800 group-hover:text-amber-600'>{relatedDish.name}</h3>
                    <p className='mt-1 text-amber-600 font-bold'>
                      {formatPrice(relatedDish.finalPrice || relatedDish.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
