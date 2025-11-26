import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Dish } from '../../../../types/dish.type'
import dishApi from '../../../../apis/dish.api'

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
  const isEditing = !!product

  const {
    register,
    handleSubmit,
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
      onClose()
    }
  })

  const onSubmit = handleSubmit((data: ProductFormData) => {
    mutation.mutate(data)
  })

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
      <div className='w-full max-w-2xl rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-neutral-800 px-6 py-4'>
          <h2 className='text-xl font-semibold text-savoria-gold'>
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
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
        <form onSubmit={onSubmit} className='p-6'>
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
                <option value='Món chính'>Món chính</option>
                <option value='Món khai vị'>Món khai vị</option>
                <option value='Món tráng miệng'>Món tráng miệng</option>
                <option value='Đồ uống'>Đồ uống</option>
                <option value='Món ăn nhẹ'>Món ăn nhẹ</option>
              </select>
              {errors.category && <p className='mt-1 text-sm text-red-400'>{errors.category.message}</p>}
            </div>

            {/* Image URL */}
            <div className='col-span-2'>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                URL Hình ảnh <span className='text-red-400'>*</span>
              </label>
              <input
                type='text'
                {...register('image', { required: 'Vui lòng nhập URL hình ảnh' })}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.image
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
                placeholder='https://example.com/image.jpg'
              />
              {errors.image && <p className='mt-1 text-sm text-red-400'>{errors.image.message}</p>}
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
