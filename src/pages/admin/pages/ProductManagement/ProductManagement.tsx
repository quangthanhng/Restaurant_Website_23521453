import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import ProductForm from './ProductForm'
import dishApi from '../../../../apis/dish.api'
import categoryApi from '../../../../apis/category.api'
import type { Category } from '../../../../types/category.type'
import type { Dish, DishQueryParams } from '../../../../types/dish.type'
import { useToast } from '../../../../components/Toast'
import DeleteConfirmModal from '../../../../components/DeleteConfirmModal/DeleteConfirmModal'

export default function ProductManagement() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Dish | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Dish | null>(null)

  // Lấy query params từ URL
  const getQueryParamsFromURL = (): DishQueryParams => ({
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
    category: searchParams.get('category') || '',
    status: (searchParams.get('status') as 'active' | 'inactive' | '') || '',
    keyword: searchParams.get('keyword') || ''
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
    if (queryParams.keyword) params.set('keyword', queryParams.keyword)

    setSearchParams(params, { replace: true })
  }, [queryParams, setSearchParams])

  // Fetch tất cả categories từ API (giống ProductForm)
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
    select: (response) => response.data.metadata || []
  })
  const categories: Category[] = categoriesData || []

  // Fetch TẤT CẢ dishes khi có search term (để search toàn bộ database)
  const { data: allDishesData, isLoading: isLoadingAllDishes } = useQuery({
    queryKey: ['admin-all-dishes'],
    queryFn: async () => {
      // Fetch trang đầu để lấy totalPages
      const firstPage = await dishApi.getDishes({ page: 1, limit: 100 })
      const totalPages = firstPage.data.metadata?.totalPages || 1

      if (totalPages === 1) {
        return firstPage.data.metadata?.dishes || []
      }

      // Fetch tất cả các trang còn lại
      const allPromises = []
      for (let page = 2; page <= totalPages; page++) {
        allPromises.push(dishApi.getDishes({ page, limit: 100 }))
      }

      const results = await Promise.all(allPromises)
      const allDishes = [
        ...(firstPage.data.metadata?.dishes || []),
        ...results.flatMap((r) => r.data.metadata?.dishes || [])
      ]

      return allDishes
    },
    enabled: !!searchTerm.trim() // Chỉ fetch khi có search term
  })

  // Fetch dishes từ API (có phân trang và filter) - dùng khi KHÔNG có search term
  const {
    data: dishesData,
    isLoading: isLoadingPaginated,
    isError,
    error
  } = useQuery({
    queryKey: ['admin-dishes', queryParams],
    queryFn: () =>
      dishApi.getDishes({
        ...queryParams,
        keyword: undefined // Bỏ keyword vì backend không hỗ trợ
      }),
    select: (response) => response.data,
    enabled: !searchTerm.trim() // Chỉ fetch khi KHÔNG có search term
  })

  // Determine loading state
  const isLoading = searchTerm.trim() ? isLoadingAllDishes : isLoadingPaginated

  // Lấy dishes - nếu có search thì dùng allDishes, không thì dùng paginated
  const dishes = useMemo(() => {
    if (searchTerm.trim() && allDishesData) {
      // Filter theo search term trong toàn bộ dishes
      const searchLower = searchTerm.toLowerCase().trim()
      return allDishesData.filter(
        (dish: Dish) =>
          dish.name.toLowerCase().includes(searchLower) || dish.description?.toLowerCase().includes(searchLower)
      )
    }
    return Array.isArray(dishesData?.metadata?.dishes) ? dishesData.metadata.dishes : []
  }, [searchTerm, allDishesData, dishesData])

  const totalPages = searchTerm.trim() ? 1 : dishesData?.metadata?.totalPages || 1
  const currentPage = searchTerm.trim() ? 1 : dishesData?.metadata?.currentPage || queryParams.page || 1
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
      toast.success('Xóa món ăn thành công!')
      closeDeleteModal()
    },
    onError: (error: Error) => {
      console.error('Delete error:', error)
      toast.error('Lỗi khi xóa món ăn: ' + error.message)
    }
  })

  // Toggle status mutation với Optimistic Update
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => dishApi.changeStatus(id, status),
    // Optimistic update: cập nhật UI ngay lập tức
    onMutate: async ({ id, status }) => {
      // Cancel các queries đang chạy để tránh overwrite
      await queryClient.cancelQueries({ queryKey: ['admin-dishes'] })

      // Lưu lại data cũ để rollback nếu lỗi
      const previousData = queryClient.getQueryData(['admin-dishes', queryParams])

      // Cập nhật cache ngay lập tức - đúng structure với API response
      queryClient.setQueryData(['admin-dishes', queryParams], (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        // API response structure: { data: { metadata: { dishes, totalPages, currentPage } } }
        const oldData = old as { data: { metadata: { dishes: Dish[]; totalPages: number; currentPage: number } } }

        if (!oldData?.data?.metadata?.dishes) return old

        return {
          ...oldData,
          data: {
            ...oldData.data,
            metadata: {
              ...oldData.data.metadata,
              dishes: oldData.data.metadata.dishes.map((dish: Dish) => (dish._id === id ? { ...dish, status } : dish))
            }
          }
        }
      })

      return { previousData }
    },
    // Rollback nếu có lỗi
    onError: (_error, _variables, context) => {
      toast.error('Lỗi khi thay đổi trạng thái!')
      if (context?.previousData) {
        queryClient.setQueryData(['admin-dishes', queryParams], context.previousData)
      }
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.status === 'active' ? 'Đã kích hoạt món ăn!' : 'Đã ẩn món ăn!')
    },
    // Đồng bộ lại với server sau khi thành công (im lặng, không gây re-render)
    onSettled: () => {
      // Chỉ invalidate sau một delay nhỏ để tránh flicker
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-dishes'] })
      }, 500)
    }
  })

  const handleEdit = (product: Dish) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const openDeleteModal = (product: Dish) => {
    setProductToDelete(product)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setProductToDelete(null)
    setDeleteModalOpen(false)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete._id)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  // Filter: chỉ hiển thị món chưa bị xóa và filter theo status nếu có
  const filteredDishes = useMemo(() => {
    if (!Array.isArray(dishes)) return []

    return dishes.filter((dish) => {
      if (dish.deleted) return false

      // Filter theo status nếu có chọn
      if (queryParams.status && dish.status !== queryParams.status) return false

      // Filter theo category nếu có chọn và không đang search
      if (!searchTerm.trim() && queryParams.category) {
        if (dish.categoryId?._id !== queryParams.category) return false
      }

      return true
    })
  }, [dishes, queryParams.status, queryParams.category, searchTerm])

  // Handle filter change
  const handleCategoryChange = (category: string) => {
    // Khi chọn category, xóa keyword search
    setSearchTerm('')
    setQueryParams((prev) => ({ ...prev, category, keyword: '', page: 1 }))
  }

  const handleStatusChange = (status: string) => {
    setQueryParams((prev) => ({ ...prev, status: status as 'active' | 'inactive' | '', page: 1 }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }))
  }

  // Handle limit change

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
          <h1 className='text-2xl font-bold text-gray-900'>Quản lý món ăn</h1>
          <p className='mt-1 text-sm text-gray-500'>Quản lý tất cả món ăn của nhà hàng</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className='flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-200'
        >
          <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
          </svg>
          Thêm món ăn
        </button>
      </div>

      {/* Search & Filter */}
      <div className='mb-6 flex items-center gap-4'>
        <div className='relative flex-1'>
          <svg
            className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400'
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
            placeholder='Tìm kiếm món ăn...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-savoria-gold'
          />
        </div>
        <select
          value={queryParams.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className='rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-savoria-gold'
          disabled={isCategoriesLoading}
        >
          <option value=''>Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={queryParams.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className='rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-savoria-gold'
        >
          <option value=''>Trạng thái</option>
          <option value='active'>Hoạt động</option>
          <option value='inactive'>Không hoạt động</option>
        </select>
      </div>

      {/* Error State */}
      {isError && (
        <div className='mb-6 rounded-lg border border-amber-800 bg-amber-900/50 p-4 text-amber-300'>
          <p className='font-medium'>Có lỗi xảy ra!</p>
          <p className='text-sm'>{(error as Error)?.message || 'Không thể tải danh sách món ăn'}</p>
        </div>
      )}

      {/* Table for desktop/tablet */}
      <div className='overflow-x-auto rounded-xl bg-white hidden sm:block'>
        <table className='min-w-full'>
          <thead className='bg-stone-50 border-b border-stone-200'>
            <tr>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                Món ăn
              </th>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                Danh mục
              </th>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>Giá</th>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                Trạng thái
              </th>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                Nổi bật
              </th>
              <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className='bg-white'>
            {isLoading ? (
              <tr>
                <td colSpan={6} className='px-6 py-10 text-center'>
                  <div className='flex flex-col items-center gap-3'>
                    <svg className='h-8 w-8 animate-spin text-amber-600' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    <span className='text-gray-500'>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : filteredDishes.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-6 py-10 text-center text-gray-500'>
                  <svg
                    className='mx-auto h-12 w-12 text-gray-300'
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
                  <p className='mt-2'>Không tìm thấy món ăn nào</p>
                </td>
              </tr>
            ) : (
              filteredDishes.map((dish) => (
                <tr key={dish._id} className='border-b border-stone-100 hover:bg-blue-50/50 transition-colors'>
                  {/* Product Info */}
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-4'>
                      <img
                        src={dish.image || 'https://via.placeholder.com/100'}
                        alt={dish.name}
                        className='h-12 w-12 shrink-0 rounded-lg object-cover'
                      />
                      <div className='min-w-0 max-w-[200px]'>
                        <p className='font-medium text-gray-900 truncate'>{dish.name}</p>
                        <p className='text-sm text-gray-500 truncate'>{dish.description}</p>
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className='whitespace-nowrap px-6 py-4'>
                    <span className='inline-flex max-w-[150px] truncate rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-600'>
                      {dish.categoryId.name}
                    </span>
                  </td>
                  {/* Price */}
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div>
                      <p className='font-medium text-gray-900'>{formatPrice(dish.finalPrice)}</p>
                      {dish.discount > 0 && (
                        <p className='text-sm text-gray-400 line-through'>{formatPrice(dish.price)}</p>
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
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-savoria-gold focus:ring-offset-2 focus:ring-offset-neutral-950 ${dish.status === 'active' ? 'bg-amber-500' : 'bg-neutral-700'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${dish.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </td>
                  {/* Featured/BestSeller Toggle */}
                  <td className='whitespace-nowrap px-6 py-4'>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${dish.bestSeller ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-50 text-gray-500'}`}
                    >
                      {dish.bestSeller ? 'Best Seller' : 'Thường'}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => handleEdit(dish)}
                        className='rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-amber-200'
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => openDeleteModal(dish)}
                        disabled={deleteMutation.isPending}
                        className='rounded-lg border border-amber-500 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50'
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
      </div>

      {/* Card list for mobile */}
      <div className='block sm:hidden space-y-4'>
        {isLoading && (
          <div className='flex flex-col items-center gap-3 py-8'>
            <svg className='h-8 w-8 animate-spin text-amber-600' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            <span className='text-gray-500'>Đang tải dữ liệu...</span>
          </div>
        )}
        {!isLoading && filteredDishes.length === 0 && (
          <div className='text-center py-8 text-gray-500'>Không tìm thấy món ăn nào</div>
        )}
        {!isLoading &&
          filteredDishes.map((dish) => (
            <div
              key={dish._id}
              className='flex flex-col rounded-xl border border-stone-200 bg-white p-3 gap-2 hover:bg-blue-50/50 transition-colors'
            >
              <div className='flex gap-3 items-center'>
                <img
                  src={dish.image || 'https://via.placeholder.com/100'}
                  alt={dish.name}
                  className='w-16 h-16 object-cover rounded-lg'
                />
                <div className='flex-1 min-w-0'>
                  <div className='font-bold text-amber-600 text-base truncate'>{dish.name}</div>
                  <div className='text-xs text-gray-500 mt-1 truncate'>{dish.description}</div>
                  <div className='mt-1 text-xs text-gray-500'>
                    Danh mục: <span className='font-semibold text-amber-600'>{dish.categoryId.name}</span>
                  </div>
                </div>
              </div>
              <div className='flex flex-wrap items-center gap-2 mt-1'>
                <span className='px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 border border-amber-500'>
                  Giá: {formatPrice(dish.finalPrice)}
                </span>
                {dish.discount > 0 && (
                  <span className='px-2 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-400 line-through'>
                    {formatPrice(dish.price)}
                  </span>
                )}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${dish.status === 'active' ? 'bg-green-600/20 text-green-400 border border-green-600/40' : 'bg-neutral-700/40 text-gray-500 border border-stone-200'}`}
                >
                  {dish.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${dish.bestSeller ? 'bg-amber-500/20 text-amber-400 border border-amber-400' : 'bg-stone-50 text-gray-500 border border-stone-200'}`}
                >
                  {dish.bestSeller ? 'Best Seller' : 'Thường'}
                </span>
              </div>
              <div className='flex gap-2 mt-2'>
                <button
                  className='flex-1 rounded-lg bg-amber-500 px-2 py-1 text-xs font-semibold text-neutral-900 shadow transition-all hover:bg-amber-200'
                  onClick={() => handleEdit(dish)}
                >
                  Sửa
                </button>
                <button
                  className='flex-1 rounded-lg border border-amber-500 px-2 py-1 text-xs font-semibold text-amber-400 shadow transition-all hover:bg-amber-500/20 disabled:opacity-50'
                  onClick={() => openDeleteModal(dish)}
                  disabled={deleteMutation.isPending}
                >
                  Xóa
                </button>
                <button
                  className={`flex-1 rounded-lg px-2 py-1 text-xs font-semibold shadow transition-all ${dish.status === 'active' ? 'bg-green-600/20 text-green-400 border border-green-600/40' : 'bg-neutral-700/40 text-gray-500 border border-stone-200'}`}
                  onClick={() =>
                    toggleStatusMutation.mutate({
                      id: dish._id,
                      status: dish.status === 'active' ? 'inactive' : 'active'
                    })
                  }
                >
                  {dish.status === 'active' ? 'Ẩn' : 'Kích hoạt'}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Pagination */}
      <div className='border border-gray-100 bg-white px-6 py-4'>
        {/* Top row - Info and limit selector */}
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-gray-500'>
            {dishes.length === 0 && pagination.page === 1 ? (
              'Chưa có món ăn nào'
            ) : dishes.length === 0 ? (
              'Không có món ăn ở trang này'
            ) : (
              <>
                Đang hiển thị <span className='font-semibold text-gray-900'>{dishes.length}</span>
                {' Món ăn - Trang '}
                <span className='font-semibold text-gray-900'>{pagination.page}</span>
                {' / '}
                <span className='font-semibold text-gray-900'>{pagination.totalPages}</span>
              </>
            )}
          </p>

          {/* Items per page selector removed as requested */}
        </div>

        {/* Bottom row - Pagination controls */}
        <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
          <div className='flex items-center gap-1'>
            {/* First page button */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page <= 1}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-gray-500 transition-all hover:bg-stone-50 hover:border-amber-500 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-stone-200 disabled:hover:text-gray-500'
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
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-gray-500 transition-all hover:bg-stone-50 hover:border-amber-500 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-stone-200 disabled:hover:text-gray-500'
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
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all ${
                      page === pagination.page
                        ? 'bg-amber-500 text-neutral-900 shadow-md shadow-savoria-gold/30'
                        : 'border border-stone-200 text-gray-500 hover:bg-stone-50 hover:border-amber-500 hover:text-amber-600'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className='flex h-9 w-9 items-center justify-center text-gray-400'>
                    •••
                  </span>
                )
              )}
            </div>

            {/* Next button */}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!hasMorePages}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-gray-500 transition-all hover:bg-stone-50 hover:border-amber-500 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-stone-200 disabled:hover:text-gray-500'
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
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-gray-500 transition-all hover:bg-stone-50 hover:border-amber-500 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-stone-200 disabled:hover:text-gray-500'
              title='Trang cuối'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 5l7 7-7 7M5 5l7 7-7 7' />
              </svg>
            </button>
          </div>

          {/* Page info and jump to page */}
          <div className='flex items-center gap-3 border-l border-stone-200 pl-4'>
            <span className='text-sm text-gray-500'>
              Trang <span className='font-semibold text-gray-900'>{pagination.page}</span>
              {' / '}
              <span className='font-semibold text-gray-900'>{pagination.totalPages}</span>
            </span>

            {/* Jump to page input */}
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-400'>|</span>
              <span className='text-sm text-gray-500'>Đi đến:</span>
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
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
                className='w-16 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 text-center text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {isFormOpen && <ProductForm product={editingProduct} onClose={handleCloseForm} />}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title='Xác nhận xóa món ăn'
        message='Món ăn này sẽ bị xóa vĩnh viễn khỏi hệ thống'
        itemName={productToDelete?.name}
        itemImage={productToDelete?.image}
        itemDetails={
          productToDelete
            ? `Giá: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(productToDelete.price)}`
            : undefined
        }
        confirmText='Xóa món ăn'
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
