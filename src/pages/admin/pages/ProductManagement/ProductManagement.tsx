import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import ProductForm from './ProductForm'
import dishApi from '../../../../apis/dish.api'
import type { Dish, DishQueryParams } from '../../../../types/dish.type'

export default function ProductManagement() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Dish | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Lấy query params từ URL
  const getQueryParamsFromURL = (): DishQueryParams => ({
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
    category: searchParams.get('category') || '',
    status: (searchParams.get('status') as 'active' | 'inactive' | '') || ''
  })

  // Query params state - sync với URL
  const [queryParams, setQueryParams] = useState<DishQueryParams>(getQueryParamsFromURL)

  // Sync URL khi queryParams thay đổi
  useEffect(() => {
    const params = new URLSearchParams()
    if (queryParams.page && queryParams.page > 1) params.set('page', String(queryParams.page))
    if (queryParams.limit && queryParams.limit !== 10) params.set('limit', String(queryParams.limit))
    if (queryParams.category) params.set('category', queryParams.category)
    if (queryParams.status) params.set('status', queryParams.status)

    setSearchParams(params, { replace: true })
  }, [queryParams, setSearchParams])

  // Fetch tất cả dishes để lấy danh sách categories
  const { data: allDishesData } = useQuery({
    queryKey: ['admin-dishes-all'],
    queryFn: () => dishApi.getDishes({ limit: 100 }), // Lấy nhiều để có đủ categories
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000 // Cache 5 phút
  })

  // Lấy danh sách categories unique từ tất cả dishes
  const categories = useMemo(() => {
    const allDishes = allDishesData?.data?.dishes || []
    const uniqueCategories = [...new Set(allDishes.map((dish: Dish) => dish.category))]
    return uniqueCategories.filter(Boolean).sort()
  }, [allDishesData])

  // Fetch dishes từ API (có phân trang và filter)
  const {
    data: dishesData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['admin-dishes', queryParams],
    queryFn: () => dishApi.getDishes(queryParams),
    select: (response) => response.data
  })

  // Lấy dishes từ response - API trả về { data: { dishes: [...], totalPages, currentPage } }
  const dishes = Array.isArray(dishesData?.data?.dishes) ? dishesData.data.dishes : []
  const totalPages = dishesData?.data?.totalPages || 1
  const currentPage = dishesData?.data?.currentPage || queryParams.page || 1
  const currentLimit = queryParams.limit || 10

  // Kiểm tra xem có còn trang tiếp theo không
  const hasMorePages = currentPage < totalPages

  // Pagination info
  const pagination = {
    page: currentPage,
    limit: currentLimit,
    totalPages: totalPages
  }

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dishApi.deleteDish(id),
    onSuccess: async (response) => {
      console.log('Delete success:', response)
      // Force refetch immediately after delete
      await queryClient.refetchQueries({ queryKey: ['admin-dishes'] })
      alert('Xóa sản phẩm thành công!')
    },
    onError: (error: Error) => {
      console.error('Delete error:', error)
      alert('Lỗi khi xóa sản phẩm: ' + error.message)
    }
  })

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      dishApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dishes'] })
    }
  })

  const handleEdit = (product: Dish) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  // Filter theo search term (client-side) - đảm bảo dishes là mảng
  const filteredDishes = Array.isArray(dishes)
    ? dishes.filter((dish) => dish.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  // Handle filter change
  const handleCategoryChange = (category: string) => {
    setQueryParams((prev) => ({ ...prev, category, page: 1 }))
  }

  const handleStatusChange = (status: string) => {
    setQueryParams((prev) => ({ ...prev, status: status as 'active' | 'inactive' | '', page: 1 }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }))
  }

  // Handle limit change
  const handleLimitChange = (limit: number) => {
    setQueryParams((prev) => ({ ...prev, limit, page: 1 }))
  }

  // Generate page numbers - sử dụng totalPages từ API
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const cp = pagination.page // current page
    const tp = pagination.totalPages // total pages

    if (tp <= 7) {
      // Nếu tổng số trang <= 7, hiển thị tất cả
      for (let i = 1; i <= tp; i++) {
        pages.push(i)
      }
    } else if (cp <= 4) {
      // Đang ở đầu: hiển thị 1 2 3 4 5 ... totalPages
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(tp)
    } else if (cp >= tp - 3) {
      // Đang ở cuối: 1 ... (tp-4) (tp-3) (tp-2) (tp-1) tp
      pages.push(1)
      pages.push('...')
      for (let i = tp - 4; i <= tp; i++) {
        pages.push(i)
      }
    } else {
      // Đang ở giữa: 1 ... (cp-1) cp (cp+1) ... tp
      pages.push(1)
      pages.push('...')
      pages.push(cp - 1, cp, cp + 1)
      pages.push('...')
      pages.push(tp)
    }

    return pages
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-amber-50'>Quản lý món ăn</h1>
          <p className='mt-1 text-sm text-neutral-400'>Quản lý tất cả món ăn của nhà hàng</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className='flex items-center gap-2 rounded-lg bg-savoria-gold px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-200'
        >
          <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
          </svg>
          Thêm sản phẩm
        </button>
      </div>

      {/* Search & Filter */}
      <div className='mb-6 flex items-center gap-4'>
        <div className='relative flex-1'>
          <svg
            className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500'
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
            placeholder='Tìm kiếm sản phẩm...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full rounded-lg border border-neutral-700 bg-neutral-800 py-2.5 pl-10 pr-4 text-sm text-amber-50 placeholder:text-neutral-500 focus:border-savoria-gold focus:outline-none focus:ring-1 focus:ring-savoria-gold'
          />
        </div>
        <select
          value={queryParams.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className='rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-amber-50 focus:border-savoria-gold focus:outline-none focus:ring-1 focus:ring-savoria-gold'
        >
          <option value=''>Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={queryParams.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className='rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-amber-50 focus:border-savoria-gold focus:outline-none focus:ring-1 focus:ring-savoria-gold'
        >
          <option value=''>Trạng thái</option>
          <option value='active'>Hoạt động</option>
          <option value='inactive'>Không hoạt động</option>
        </select>
      </div>

      {/* Error State */}
      {isError && (
        <div className='mb-6 rounded-lg border border-red-800 bg-red-900/50 p-4 text-red-300'>
          <p className='font-medium'>Có lỗi xảy ra!</p>
          <p className='text-sm'>{(error as Error)?.message || 'Không thể tải danh sách sản phẩm'}</p>
        </div>
      )}

      {/* Table */}
      <div className='overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-sm'>
        <table className='min-w-full divide-y divide-neutral-800'>
          <thead className='bg-neutral-900'>
            <tr>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>
                Sản phẩm
              </th>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>
                Danh mục
              </th>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>
                Giá
              </th>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>
                Trạng thái
              </th>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>
                Nổi bật
              </th>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-neutral-800 bg-neutral-950'>
            {isLoading ? (
              <tr>
                <td colSpan={6} className='px-6 py-10 text-center'>
                  <div className='flex flex-col items-center gap-3'>
                    <svg
                      className='h-8 w-8 animate-spin text-savoria-gold'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
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
                    <span className='text-neutral-400'>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : filteredDishes.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-6 py-10 text-center text-neutral-400'>
                  <svg
                    className='mx-auto h-12 w-12 text-neutral-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z'
                    />
                  </svg>
                  <p className='mt-2'>Không tìm thấy sản phẩm nào</p>
                </td>
              </tr>
            ) : (
              filteredDishes.map((dish) => (
                <tr key={dish._id} className='hover:bg-neutral-900'>
                  {/* Product Info */}
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-4'>
                      <img
                        src={dish.image || 'https://via.placeholder.com/100'}
                        alt={dish.name}
                        className='h-12 w-12 shrink-0 rounded-lg object-cover'
                      />
                      <div className='min-w-0 max-w-[200px]'>
                        <p className='font-medium text-amber-50 truncate'>{dish.name}</p>
                        <p className='text-sm text-neutral-400 truncate'>{dish.description}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className='whitespace-nowrap px-6 py-4'>
                    <span className='inline-flex max-w-[150px] truncate rounded-full bg-savoria-gold/20 px-3 py-1 text-xs font-medium text-savoria-gold'>
                      {dish.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div>
                      <p className='font-medium text-amber-50'>{formatPrice(dish.finalPrice)}</p>
                      {dish.discount > 0 && (
                        <p className='text-sm text-neutral-500 line-through'>{formatPrice(dish.price)}</p>
                      )}
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className='whitespace-nowrap px-6 py-4'>
                    <button
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          id: dish._id,
                          status: dish.status === 'active' ? 'inactive' : 'active'
                        })
                      }
                      disabled={toggleStatusMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dish.status === 'active' ? 'bg-savoria-gold' : 'bg-neutral-700'
                        } ${toggleStatusMutation.isPending ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-neutral-950 transition-transform ${dish.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </td>

                  {/* Featured/BestSeller Toggle */}
                  <td className='whitespace-nowrap px-6 py-4'>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${dish.bestSeller ? 'bg-amber-600/20 text-amber-400' : 'bg-neutral-800 text-neutral-400'
                        }`}
                    >
                      {dish.bestSeller ? 'Best Seller' : 'Thường'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => handleEdit(dish)}
                        className='rounded-lg bg-savoria-gold px-3 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-amber-200'
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(dish._id)}
                        disabled={deleteMutation.isPending}
                        className='rounded-lg border border-red-500 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50'
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className='border-t border-neutral-800 bg-neutral-950 px-6 py-4'>
          {/* Top row - Info and limit selector */}
          <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm text-neutral-400'>
              {dishes.length === 0 && pagination.page === 1 ? (
                'Chưa có sản phẩm nào'
              ) : dishes.length === 0 ? (
                'Không có sản phẩm ở trang này'
              ) : (
                <>
                  Đang hiển thị{' '}
                  <span className='font-semibold text-amber-50'>{dishes.length}</span>
                  {' sản phẩm - Trang '}
                  <span className='font-semibold text-amber-50'>{pagination.page}</span>
                  {' / '}
                  <span className='font-semibold text-amber-50'>{pagination.totalPages}</span>
                </>
              )}
            </p>

            {/* Items per page selector */}
            <div className='flex items-center gap-2'>
              <span className='text-sm text-neutral-400'>Số lượng:</span>
              <select
                value={queryParams.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className='rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm font-medium text-amber-50 focus:border-savoria-gold focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className='text-sm text-neutral-400'>/ trang</span>
            </div>
          </div>

          {/* Bottom row - Pagination controls */}
          <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
            <div className='flex items-center gap-1'>
              {/* First page button */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page <= 1}
                className='flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-all hover:bg-neutral-800 hover:border-savoria-gold hover:text-savoria-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-neutral-700 disabled:hover:text-neutral-400'
                title='Trang đầu tiên'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 19l-7-7 7-7m8 14l-7-7 7-7' />
                </svg>
              </button>

              {/* Previous button */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className='flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-all hover:bg-neutral-800 hover:border-savoria-gold hover:text-savoria-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-neutral-700 disabled:hover:text-neutral-400'
                title='Trang trước'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
                </svg>
              </button>

              {/* Page numbers */}
              <div className='flex items-center gap-1 px-1'>
                {getPageNumbers().map((page, index) =>
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all ${page === pagination.page
                        ? 'bg-savoria-gold text-neutral-900 shadow-md shadow-savoria-gold/30'
                        : 'border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:border-savoria-gold hover:text-savoria-gold'
                        }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className='flex h-9 w-9 items-center justify-center text-neutral-500'>
                      •••
                    </span>
                  )
                )}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!hasMorePages}
                className='flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-all hover:bg-neutral-800 hover:border-savoria-gold hover:text-savoria-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-neutral-700 disabled:hover:text-neutral-400'
                title='Trang sau'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                </svg>
              </button>

              {/* Last page button */}
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.page >= pagination.totalPages}
                className='flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-all hover:bg-neutral-800 hover:border-savoria-gold hover:text-savoria-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-neutral-700 disabled:hover:text-neutral-400'
                title='Trang cuối'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 5l7 7-7 7M5 5l7 7-7 7' />
                </svg>
              </button>
            </div>

            {/* Page info and jump to page */}
            <div className='flex items-center gap-3 border-l border-neutral-700 pl-4'>
              <span className='text-sm text-neutral-400'>
                Trang <span className='font-semibold text-amber-50'>{pagination.page}</span>
                {' / '}
                <span className='font-semibold text-amber-50'>{pagination.totalPages}</span>
              </span>

              {/* Jump to page input */}
              <div className='flex items-center gap-2'>
                <span className='text-sm text-neutral-500'>|</span>
                <span className='text-sm text-neutral-400'>Đi đến:</span>
                <input
                  type='number'
                  min={1}
                  max={pagination.totalPages}
                  placeholder='...'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseInt((e.target as HTMLInputElement).value)
                      if (value >= 1 && value <= pagination.totalPages) {
                        handlePageChange(value)
                          ; (e.target as HTMLInputElement).value = ''
                      }
                    }
                  }}
                  className='w-16 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-center text-sm text-amber-50 placeholder:text-neutral-500 focus:border-savoria-gold focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {isFormOpen && <ProductForm product={editingProduct} onClose={handleCloseForm} />}
    </div>
  )
}
