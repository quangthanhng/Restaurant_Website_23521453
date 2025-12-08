import { useState, useEffect, useMemo, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import dishApi from '../../apis/dish.api'
import categoryApi from '../../apis/category.api'
import { useCart } from '../../contexts/CartContext'
import { AppContext } from '../../contexts/app.context'
import { useToast } from '../../components/Toast'
import type { Dish } from '../../types/dish.type'
import type { Category } from '../../types/category.type'
import path from '../../constants/path'

export default function Menu() {
  const [selectedCategoryState, setSelectedCategoryState] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [allDishes, setAllDishes] = useState<Dish[]>([])
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true)
  const [addingDishId, setAddingDishId] = useState<string | null>(null)

  const { addToCart } = useCart()
  const { isAuthenticated } = useContext(AppContext)
  const { success, error } = useToast()
  const navigate = useNavigate()

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
    select: (response) => response.data.metadata || []
  })
  const categories: Category[] = useMemo(() => categoriesData || [], [categoriesData])

  // Compute selectedCategory: use state if set, otherwise default to first category
  const selectedCategory = useMemo(() => {
    if (selectedCategoryState !== null) {
      return selectedCategoryState
    }
    return categories.length > 0 ? categories[0]._id : ''
  }, [selectedCategoryState, categories])

  // Fetch first page to get total pages
  const { data: firstPageData, isLoading: isLoadingFirstPage } = useQuery({
    queryKey: ['dishes-first-page'],
    queryFn: () =>
      dishApi.getDishes({
        page: 1,
        limit: 10,
        status: 'active'
      }),
    select: (response) => response.data?.metadata
  })

  // Fetch all dishes from all pages
  useEffect(() => {
    const fetchAllDishes = async () => {
      if (!firstPageData) return

      const totalPages = firstPageData.totalPages || 1
      const firstPageDishes = firstPageData.dishes || []

      // If only one page, just use first page data
      if (totalPages === 1) {
        setAllDishes(firstPageDishes)
        return
      }

      // Fetch remaining pages
      try {
        const remainingPagesPromises = []
        for (let page = 2; page <= totalPages; page++) {
          remainingPagesPromises.push(
            dishApi.getDishes({
              page,
              limit: 10,
              status: 'active'
            })
          )
        }

        const remainingPagesResults = await Promise.all(remainingPagesPromises)
        const remainingDishes = remainingPagesResults.flatMap((result) => result.data?.metadata?.dishes || [])

        // Combine all dishes
        setAllDishes([...firstPageDishes, ...remainingDishes])
      } catch (error) {
        console.error('Error fetching all dishes:', error)
        // Fallback to first page only
        setAllDishes(firstPageDishes)
      }
    }

    fetchAllDishes()
  }, [firstPageData])

  // Filter dishes by selected category and search term
  // Khi có search term, tìm trong tất cả món ăn (bỏ qua filter category)
  // Khi không có search term, filter theo category như bình thường
  const filteredDishes = allDishes.filter((dish) => {
    const matchSearch =
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Nếu có search term, chỉ filter theo search, không filter theo category
    if (searchTerm.trim()) {
      return matchSearch
    }

    // Không có search term thì filter theo category
    const matchCategory = selectedCategory ? dish.categoryId._id === selectedCategory : true
    return matchCategory
  })

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const isLoading = isLoadingFirstPage

  // Get current category name
  const currentCategory = categories.find((c) => c._id === selectedCategory)

  // Handle quick add to cart - Optimistic approach for instant feedback
  const handleQuickAddToCart = async (e: React.MouseEvent, dish: Dish) => {
    e.preventDefault() // Prevent Link navigation
    e.stopPropagation() // Prevent opening modal

    if (!isAuthenticated) {
      error('Vui lòng đăng nhập để thêm món vào giỏ hàng!')
      navigate(path.login)
      return
    }

    // Show success immediately (optimistic UI)
    success(`Đã thêm "${dish.name}" vào giỏ hàng!`)

    // Start loading indicator
    setAddingDishId(dish._id)

    // Run API call in background
    addToCart(dish, 1)
      .catch(() => {
        error('Có lỗi xảy ra khi thêm vào giỏ hàng!')
      })
      .finally(() => {
        setAddingDishId(null)
      })
  }

  return (
    <div className='min-h-screen w-full bg-white pt-[74px]'>
      {/* Hero Section */}
      <section className='relative h-[400px] w-full overflow-hidden'>
        {/* Background Image */}
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1555126634-323283e090fa?w=1920&q=80)'
          }}
        >
          <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70' />
        </div>

        {/* Content */}
        <div className='relative flex h-full flex-col items-center justify-center px-6 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/20 px-6 py-2 backdrop-blur-sm'>
            <svg className='h-5 w-5 text-amber-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
              />
            </svg>
            <span className='text-sm font-medium text-amber-300'>Thực đơn</span>
          </div>
          <h1 className='mb-4 font-serif text-5xl font-bold text-white md:text-6xl lg:text-7xl'>
            Khám Phá
            <span className='block text-amber-400'>Ẩm Thực Việt</span>
          </h1>
          <p className='max-w-2xl text-lg text-white/80'>
            Những món ăn truyền thống được chế biến từ nguyên liệu tươi ngon, mang đến hương vị đậm đà khó quên
          </p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className='mx-auto max-w-7xl px-6 py-12'>
        <div className='flex gap-8'>
          {/* Sidebar - Categories */}
          <aside className='w-64 shrink-0'>
            <div className='sticky top-24'>
              {/* Search Bar */}
              <div className='mb-6'>
                <div className='relative'>
                  <svg
                    className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                  <input
                    type='text'
                    placeholder='Search dishes...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full rounded-lg border border-stone-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
                  />
                </div>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className='mt-2 text-xs text-gray-500 hover:text-amber-600'>
                    Clear search
                  </button>
                )}
              </div>

              {/* Categories List */}
              <div className='rounded-xl border border-gray-200 bg-gray-50 overflow-hidden'>
                {/* Toggle Header */}
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className='flex w-full items-center justify-between p-4 transition-all hover:bg-gray-100/50'
                >
                  <h3 className='text-sm font-semibold uppercase tracking-wider text-amber-600'>Categories</h3>
                  <svg
                    className={`h-5 w-5 text-amber-600 transition-transform duration-300 ${
                      isCategoriesOpen ? 'rotate-180' : ''
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                  </svg>
                </button>

                {/* Collapsible Categories */}
                {isCategoriesOpen && (
                  <nav className='space-y-1 p-4 pt-0 animate-in fade-in slide-in-from-top-2 duration-300'>
                    {categories.map((category) => {
                      const count = allDishes.filter((d) => d.categoryId._id === category._id).length
                      if (count === 0) return null
                      return (
                        <button
                          key={category._id}
                          onClick={() => setSelectedCategoryState(category._id)}
                          className={`group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all ${
                            selectedCategory === category._id
                              ? 'bg-amber-500 text-neutral-900 shadow-md'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <span className='font-medium'>{category.name}</span>
                          <span
                            className={`text-xs ${
                              selectedCategory === category._id
                                ? 'text-neutral-900/70'
                                : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      )
                    })}
                  </nav>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content - Dishes */}
          <main className='flex-1'>
            {/* Category Header */}
            {currentCategory && (
              <div className='mb-8'>
                <h2 className='font-serif text-3xl font-bold text-gray-900'>{currentCategory.name}</h2>
                <p className='mt-2 text-gray-500'>
                  {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
            )}

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
                  <p className='text-gray-500'>Loading delicious dishes...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredDishes.length === 0 && (
              <div className='flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-12'>
                <svg className='mb-4 h-20 w-20 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='1.5'
                    d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z'
                  />
                </svg>
                <h3 className='mb-2 text-xl font-semibold text-gray-600'>No dishes found</h3>
                <p className='text-gray-400'>
                  {searchTerm
                    ? `No results for "${searchTerm}" in this category`
                    : 'No dishes available in this category'}
                </p>
              </div>
            )}

            {/* Dishes Grid */}
            {!isLoading && filteredDishes.length > 0 && (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {filteredDishes.map((dish) => (
                  <Link
                    key={dish._id}
                    to={`/dish/${dish._id}`}
                    className='group relative cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-300 hover:border-amber-500 hover:bg-amber-50/30'
                  >
                    {/* Image */}
                    <div className='relative h-64 w-full overflow-hidden bg-stone-100'>
                      <img
                        src={dish.image || 'https://via.placeholder.com/400x300'}
                        alt={dish.name}
                        className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                      />

                      {/* Badges */}
                      <div className='absolute left-4 top-4 flex gap-2'>
                        {dish.bestSeller && (
                          <span className='rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-gray-900'>
                            Best Seller
                          </span>
                        )}
                        {dish.discount > 0 && (
                          <span className='rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-gray-900'>
                            -{dish.discount}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className='p-6'>
                      {/* Title */}
                      <h3 className='mb-2 font-serif text-xl font-bold text-gray-900 transition-colors group-hover:text-amber-600'>
                        {dish.name}
                      </h3>

                      {/* Description */}
                      <p className='mb-4 line-clamp-2 text-sm text-gray-500'>{dish.description}</p>

                      {/* Price & CTA */}
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-2xl font-bold text-amber-600'>{formatPrice(dish.finalPrice)}</p>
                          {dish.discount > 0 && (
                            <p className='text-sm text-gray-400 line-through'>{formatPrice(dish.price)}</p>
                          )}
                        </div>
                        <button
                          className='flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-neutral-900 transition-all duration-300 hover:scale-110 hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100'
                          onClick={(e) => handleQuickAddToCart(e, dish)}
                          disabled={addingDishId === dish._id}
                        >
                          {addingDishId === dish._id ? (
                            <svg className='h-5 w-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                              <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'
                              />
                              <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                              />
                            </svg>
                          ) : (
                            <svg
                              className='h-5 w-5'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                              strokeWidth='2.5'
                            >
                              <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  )
}
