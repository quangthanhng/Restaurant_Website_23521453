import { useState, useRef } from 'react'
import axios, { type AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Dish } from '../../../../types/dish.type'
import dishApi from '../../../../apis/dish.api'
import { useToast } from '../../../../components/Toast'
import categoryApi from '../../../../apis/category.api'
import type { Category } from '../../../../types/category.type'

interface ProductFormData {
  name: string
  description: string
  price: number
  discount: number
  image: string
  category: string // id của danh mục
  status: 'active' | 'inactive'
  rating?: number
  bestSeller: boolean
  prepareTime?: string
  ingredients?: string
}

interface ProductFormProps {
  product: Dish | null
  onClose: () => void
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const isEditing = !!product
  const [imagePreview, setImagePreview] = useState<string>(product?.image || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch danh mục
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
    select: (response) => response.data.metadata || []
  })
  const categories: Category[] = categoriesData || []

  // Helper để lấy category từ product (id string)
  const getCategory = () => {
    if (!product) return ''
    if (product.categoryId && typeof product.categoryId === 'object') {
      return product.categoryId._id
    }
    if (product.categoryId && typeof product.categoryId === 'string') {
      return product.categoryId
    }
    return ''
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProductFormData>({
    defaultValues: product
      ? {
        name: product.name,
        description: product.description,
        price: product.price,
        discount: product.discount || 0,
        image: product.image,
        category: getCategory(),
        status: product.status,
        rating: product.rating,
        bestSeller: product.bestSeller,
        prepareTime: product.prepareTime !== undefined && product.prepareTime !== null ? String(product.prepareTime) : '',
        ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : ''
      }
      : {
        name: '',
        description: '',
        price: 0,
        discount: 0,
        image: '',
        category: '',
        status: 'active',
        rating: 4.5,
        bestSeller: false,
        prepareTime: '',
        ingredients: ''
      }
  })

  // Tự động tính finalPrice khi price hoặc discount thay đổi
  const price = watch('price')
  const discount = watch('discount')

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      let imageValue = data.image
      if (selectedFile) {
        imageValue = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = () => reject('Không thể đọc file ảnh')
          reader.readAsDataURL(selectedFile)
        })
      }
      // Tìm object category từ mảng categories dựa vào id đã chọn
      const selectedCategory = categories.find(cat => cat._id === data.category)
      const submitData = {
        ...data,
        image: imageValue,
        categoryId: selectedCategory ? { _id: selectedCategory._id, name: selectedCategory.name } : undefined,
        prepareTime: data.prepareTime !== undefined && data.prepareTime !== null ? String(data.prepareTime) : '',
        ingredients: data.ingredients !== undefined && data.ingredients !== null ? String(data.ingredients) : ''
      }
      if (isEditing && product) {
        return dishApi.updateDish(product._id, submitData)
      }
      return dishApi.createDish(submitData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dishes'], exact: false })
      toast.success(isEditing ? 'Cập nhật món ăn thành công!' : 'Thêm món ăn thành công!')
      onClose()
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const axiosErr = error as AxiosError<{ message?: string }>
        const message = axiosErr.response?.data?.message ?? 'Có lỗi xảy ra'
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
        <div className='flex items-center justify-between border-b border-neutral-800 px-6 py-4 shrink-0'>
          <h2 className='text-xl font-semibold text-savoria-gold'>
            {isEditing ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
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
                Tên Món Ăn <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                {...register('name', { required: 'Vui lòng nhập tên món ăn' })}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
                placeholder='Nhập tên món ăn'
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
              <label className='mb-2 block text-sm font-medium text-neutral-300'>Giảm giá (%)</label>
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
            </div>
            {/* Final Price Preview */}
            <div className='col-span-2 rounded-lg border border-neutral-700 bg-neutral-800/50 p-4'>
              <p className='text-sm text-neutral-400'>
                Giá sau giảm:{' '}
                <span className='text-lg font-semibold text-savoria-gold'>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    (price || 0) - ((price || 0) * (discount || 0)) / 100
                  )}
                </span>
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Đánh giá (1-5)
              </label>
              <input
                type='number'
                step='0.1'
                min={1}
                max={5}
                {...register('rating', {
                  min: { value: 1, message: 'Đánh giá tối thiểu là 1' },
                  max: { value: 5, message: 'Đánh giá tối đa là 5' },
                  valueAsNumber: true
                })}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.rating
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
                placeholder='4.5'
              />
              {errors.rating && <p className='mt-1 text-sm text-red-400'>{errors.rating.message}</p>}
            </div>

            {/* Ingredients */}
            <div className='col-span-2'>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Nguyên liệu (phân tách bằng dấu phẩy)
              </label>
              <input
                type='text'
                {...register('ingredients')}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.ingredients
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
                placeholder='Bánh phở, Thịt bò, Hành, Nước dùng'
              />
            </div>

            {/* Prepare Time */}
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Thời gian chuẩn bị (phút)
              </label>
              <input
                type='number'
                min={1}
                {...register('prepareTime', { valueAsNumber: true })}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.prepareTime
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
                placeholder='12'
              />
            </div>

            {/* Category */}
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
                disabled={isCategoriesLoading}
              >
                <option value=''>{isCategoriesLoading ? 'Đang tải...' : 'Chọn danh mục'}</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
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
              {/* Toggle upload mode */}
              <div className='mb-3 flex gap-2'>
                <button
                  type='button'
                  onClick={() => setUploadMode('file')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${uploadMode === 'file'
                    ? 'bg-savoria-gold text-neutral-900'
                    : 'border border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                    }`}
                >
                  📁 Upload từ máy
                </button>
                <button
                  type='button'
                  onClick={() => setUploadMode('url')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${uploadMode === 'url'
                    ? 'bg-savoria-gold text-neutral-900'
                    : 'border border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                    }`}
                >
                  🔗 Nhập URL
                </button>
              </div>
              <div className='flex gap-4'>
                {/* Thumbnail Preview */}
                <div className='shrink-0'>
                  {imagePreview ? (
                    <div className='relative group'>
                      <img
                        src={imagePreview}
                        alt='Preview'
                        className='h-28 w-28 rounded-lg border border-neutral-700 object-cover'
                        onError={(e) => {
                          ; (e.target as HTMLImageElement).src = 'https://via.placeholder.com/112?text=Lỗi+ảnh'
                        }}
                      />
                      <button
                        type='button'
                        onClick={() => {
                          setImagePreview('')
                          setValue('image', '')
                          setSelectedFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
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
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Upload Controls */}
                <div className='flex flex-1 flex-col gap-2'>
                  {uploadMode === 'file' ? (
                    <>
                      <p className='text-xs text-neutral-500 mb-1'>
                        Chọn ảnh từ máy tính (PNG, JPG, JPEG, GIF, WEBP - Tối đa 10MB)
                      </p>
                      <input
                        type='file'
                        ref={fileInputRef}
                        accept='image/png,image/jpeg,image/jpg,image/gif,image/webp'
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error('Kích thước ảnh phải nhỏ hơn 10MB')
                              return
                            }
                            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
                            if (!allowedTypes.includes(file.type)) {
                              toast.error('Chỉ chấp nhận file ảnh (PNG, JPG, JPEG, GIF, WEBP)')
                              return
                            }
                            setSelectedFile(file)
                            const previewUrl = URL.createObjectURL(file)
                            setImagePreview(previewUrl)
                            setValue('image', file.name)
                            toast.success('Đã chọn ảnh: ' + file.name)
                          }
                        }}
                        className='hidden'
                      />
                      <button
                        type='button'
                        onClick={() => fileInputRef.current?.click()}
                        className='w-full rounded-lg border-2 border-dashed px-4 py-4 text-sm transition-colors border-neutral-600 bg-neutral-800 text-neutral-300 hover:border-savoria-gold hover:bg-neutral-700'
                      >
                        {selectedFile ? (
                          <span className='flex items-center justify-center gap-2 text-green-400'>
                            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                            </svg>
                            Đã chọn: {selectedFile.name}
                          </span>
                        ) : (
                          <span className='flex items-center justify-center gap-2'>
                            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
                              />
                            </svg>
                            Chọn ảnh từ máy tính
                          </span>
                        )}
                      </button>
                      <input type='hidden' {...register('image', { required: 'Vui lòng chọn ảnh' })} />
                    </>
                  ) : (
                    <>
                      <p className='text-xs text-neutral-500 mb-1'>Nhập URL ảnh (Cloudinary, Imgur, ...)</p>
                      <input
                        type='text'
                        value={imagePreview}
                        onChange={(e) => {
                          const url = e.target.value
                          setImagePreview(url)
                          setValue('image', url)
                        }}
                        className={`w-full rounded-lg border px-4 py-2 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.image
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                          }`}
                        placeholder='https://example.com/image.jpg'
                      />
                      <input type='hidden' {...register('image', { required: 'Vui lòng nhập URL ảnh' })} />
                    </>
                  )}
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
                placeholder='Nhập mô tả món ăn'
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
