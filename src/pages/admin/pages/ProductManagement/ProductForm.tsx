import { useMemo, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Dish } from '../../../../types/dish.type'
import dishApi from '../../../../apis/dish.api'
import { useToast } from '../../../../components/Toast'

interface ProductFormData {
  name: string
  price: number
  discount?: number
  category: string
  image: string
  description: string
  status: 'active' | 'inactive'
  bestSeller: boolean
  ingredients?: string
  prepareTime?: string
}

interface ProductFormProps {
  product: Dish | null
  onClose: () => void
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const isEditing = !!product
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State cho image preview
  const [imagePreview, setImagePreview] = useState<string>(product?.image || '')
  const [isUploading, setIsUploading] = useState(false)

  // Fetch tất cả dishes để lấy danh sách categories
  const { data: allDishesData } = useQuery({
    queryKey: ['admin-dishes-all'],
    queryFn: () => dishApi.getDishes({ limit: 100 }),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000
  })

  // Lấy danh sách categories unique từ tất cả dishes
  const categories = useMemo(() => {
    const allDishes = allDishesData?.data?.dishes || []
    const uniqueCategories = [...new Set(allDishes.map((dish: Dish) => dish.category))]
    return uniqueCategories.filter(Boolean).sort()
  }, [allDishesData])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProductFormData>({
    defaultValues: product
      ? {
        name: product.name,
        price: product.price,
        discount: product.discount || 0,
        category: product.category,
        image: product.image,
        description: product.description,
        status: product.status,
        bestSeller: product.bestSeller,
        ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : (product.ingredients || ''),
        prepareTime: String(product.prepareTime || '')
      }
      : {
        name: '',
        price: 0,
        discount: 0,
        category: '',
        image: '',
        description: '',
        status: 'active',
        bestSeller: false,
        ingredients: '',
        prepareTime: ''
      }
  })

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (isEditing && product) {
        return dishApi.updateDish(product._id, data)
      }
      return dishApi.createDish(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dishes'] })
      toast.success(isEditing ? 'Cập nhật món ăn thành công!' : 'Thêm món ăn thành công!')
      onClose()
    },
    onError: (error: any) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: unknown } } }
        const message = axiosError.response?.data?.message || 'Có lỗi xảy ra'
        toast.error('Lỗi: ' + message)
      } else if (error instanceof Error) {
        toast.error('Lỗi: ' + error.message)
      } else {
        toast.error('Có lỗi xảy ra khi xử lý yêu cầu')
      }
    }
  })

  const onSubmit = handleSubmit((data: ProductFormData) => {
    mutation.mutate(data)
  })

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
      <div className='w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-neutral-800 px-6 py-4 flex-shrink-0'>
          <h2 className='text-xl font-semibold text-savoria-gold'>
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm món ăn mới'}
          </h2>
          <button
            onClick={onClose}
            className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-amber-50'
          >
            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className='p-6 overflow-y-auto flex-1'>
          <div className='grid grid-cols-2 gap-6'>
            {/* Name */}
            <div className='col-span-2'>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Tên sản phẩm <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                {...register('name', { required: 'Vui lòng nhập tên sản phẩm' })}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
                placeholder='Nhập tên sản phẩm'
              />
              {errors.name && <p className='mt-1 text-sm text-red-400'>{errors.name.message}</p>}
            </div>

            {/* Price */}
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Giá (VNĐ) <span className='text-red-400'>*</span>
              </label>
              <input
                type='number'
                {...register('price', {
                  required: 'Vui lòng nhập giá',
                  min: { value: 0, message: 'Giá phải lớn hơn 0' },
                  valueAsNumber: true
                })}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.price
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
                placeholder='0'
              />
              {errors.price && <p className='mt-1 text-sm text-red-400'>{errors.price.message}</p>}
            </div>

            {/* Discount */}
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Giảm giá (%)
              </label>
              <input
                type='number'
                {...register('discount', {
                  min: { value: 0, message: 'Giảm giá phải >= 0' },
                  max: { value: 100, message: 'Giảm giá phải <= 100' },
                  valueAsNumber: true
                })}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.discount
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
                placeholder='0'
              />
              {errors.discount && <p className='mt-1 text-sm text-red-400'>{errors.discount.message}</p>}
            </div>            {/* Category */}
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Danh mục <span className='text-red-400'>*</span>
              </label>
              <select
                {...register('category', { required: 'Vui lòng chọn danh mục' })}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 focus:outline-none focus:ring-2 ${errors.category
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
              >
                <option value=''>Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className='mt-1 text-sm text-red-400'>{errors.category.message}</p>}
            </div>

            {/* Image Upload */}
            <div className='col-span-2'>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Hình ảnh <span className='text-red-400'>*</span>
              </label>

              <div className='flex gap-4'>
                {/* Thumbnail Preview */}
                <div className='flex-shrink-0'>
                  {imagePreview ? (
                    <div className='relative group'>
                      <img
                        src={imagePreview}
                        alt='Preview'
                        className='h-28 w-28 rounded-lg border border-neutral-700 object-cover'
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/112?text=Lỗi+ảnh'
                        }}
                      />
                      <button
                        type='button'
                        onClick={() => {
                          setImagePreview('')
                          setValue('image', '')
                        }}
                        className='absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600'
                      >
                        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className='flex h-28 w-28 items-center justify-center rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-800'>
                      <svg className='h-8 w-8 text-neutral-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className='flex flex-1 flex-col gap-2'>
                  {/* File Input */}
                  <input
                    type='file'
                    ref={fileInputRef}
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Kiểm tra kích thước file (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          alert('Kích thước ảnh không được vượt quá 5MB')
                          return
                        }

                        setIsUploading(true)
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          const base64String = reader.result as string
                          setImagePreview(base64String)
                          setValue('image', base64String)
                          setIsUploading(false)
                        }
                        reader.onerror = () => {
                          alert('Không thể đọc file ảnh')
                          setIsUploading(false)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className='hidden'
                  />

                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className='flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-amber-50 disabled:opacity-50'
                  >
                    {isUploading ? (
                      <>
                        <svg className='h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'></path>
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' />
                        </svg>
                        Chọn ảnh từ thiết bị
                      </>
                    )}
                  </button>

                  <p className='text-xs text-neutral-500'>PNG, JPG, WEBP. Tối đa 5MB</p>

                  {/* Hoặc nhập URL */}
                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-neutral-700'></div>
                    </div>
                    <div className='relative flex justify-center'>
                      <span className='bg-neutral-900 px-2 text-xs text-neutral-500'>hoặc nhập URL</span>
                    </div>
                  </div>

                  <input
                    type='text'
                    {...register('image', { required: 'Vui lòng chọn ảnh hoặc nhập URL' })}
                    onChange={(e) => {
                      const url = e.target.value
                      setImagePreview(url)
                    }}
                    className={`w-full rounded-lg border px-4 py-2 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.image
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                      }`}
                    placeholder='https://example.com/image.jpg'
                  />
                </div>
              </div>

              {errors.image && <p className='mt-2 text-sm text-red-400'>{errors.image.message}</p>}
            </div>

            {/* Description */}
            <div className='col-span-2'>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>Mô tả</label>
              <textarea
                {...register('description')}
                rows={3}
                className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-amber-50 placeholder:text-neutral-500 focus:border-savoria-gold focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
                placeholder='Nhập mô tả sản phẩm'
              />
            </div>

            {/* Toggles */}
            <div className='col-span-2 flex items-center gap-8'>
              {/* Status */}
              <div className='flex items-center gap-3'>
                <label className='text-sm text-neutral-300'>Trạng thái:</label>
                <select
                  {...register('status')}
                  className='rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-amber-50 focus:border-savoria-gold focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
                >
                  <option value='active'>Hoạt động</option>
                  <option value='inactive'>Tạm ẩn</option>
                </select>
              </div>

              {/* Best Seller */}
              <label className='flex cursor-pointer items-center gap-3'>
                <input
                  type='checkbox'
                  {...register('bestSeller')}
                  className='h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-savoria-gold focus:ring-savoria-gold'
                />
                <span className='text-sm text-neutral-300'>Bán chạy</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className='mt-6 flex items-center justify-end gap-3 border-t border-neutral-800 pt-6'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-amber-50'
            >
              Hủy
            </button>
            <button
              type='submit'
              disabled={mutation.isPending}
              className='rounded-lg bg-savoria-gold px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-200 disabled:opacity-50'
            >
              {mutation.isPending ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
