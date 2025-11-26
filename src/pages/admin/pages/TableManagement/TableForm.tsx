import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Table, TableFormData } from '../../../../types/table.type'
import tableApi from '../../../../apis/table.api'
import { useToast } from '../../../../components/Toast'

interface TableFormProps {
  table: Table | null
  onClose: () => void
}

export default function TableForm({ table, onClose }: TableFormProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const isEditing = !!table

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TableFormData>({
    defaultValues: table
      ? {
        tableNumber: table.tableNumber,
        maximumCapacity: table.maximumCapacity,
        status: table.status,
        position: table.position || ''
      }
      : {
        tableNumber: 1,
        maximumCapacity: 4,
        status: 'available',
        position: ''
      }
  })

  const mutation = useMutation({
    mutationFn: async (data: TableFormData) => {
      // Đảm bảo dữ liệu đúng kiểu theo API yêu cầu
      // API yêu cầu tất cả 4 trường: tableNumber, maximumCapacity, status, position
      const formattedData = {
        tableNumber: Number(data.tableNumber),
        maximumCapacity: Number(data.maximumCapacity),
        status: data.status,
        position: data.position?.trim() || 'Chưa xác định' // position là bắt buộc
      }

      console.log('Sending data:', JSON.stringify(formattedData)) // Debug log

      if (isEditing && table) {
        return tableApi.updateTable(table._id, formattedData)
      }
      return tableApi.createTable(formattedData)
    },
    onSuccess: (response) => {
      console.log('Success response:', response) // Debug log
      queryClient.invalidateQueries({ queryKey: ['admin-tables'] })
      toast.success(isEditing ? 'Cập nhật bàn thành công!' : 'Thêm bàn thành công!')
      onClose()
    },
    onError: (error: unknown) => {
      console.error('Error details:', error) // Debug log
      // Xử lý lỗi từ axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: unknown } } }
        console.error('Server response:', axiosError.response?.data) // Log chi tiết response
        const message = axiosError.response?.data?.message || 'Có lỗi xảy ra'
        toast.error('Lỗi: ' + message)
      } else if (error instanceof Error) {
        toast.error('Lỗi: ' + error.message)
      } else {
        toast.error('Có lỗi xảy ra khi xử lý yêu cầu')
      }
    }
  })

  const onSubmit = handleSubmit((data: TableFormData) => {
    mutation.mutate(data)
  })

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
      <div className='w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-neutral-800 px-6 py-4'>
          <h2 className='text-xl font-semibold text-savoria-gold'>
            {isEditing ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}
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
          <div className='space-y-5'>
            {/* Table Number */}
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Số bàn <span className='text-red-400'>*</span>
              </label>
              <input
                type='number'
                {...register('tableNumber', {
                  required: 'Vui lòng nhập số bàn',
                  min: { value: 1, message: 'Số bàn phải lớn hơn 0' },
                  valueAsNumber: true
                })}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.tableNumber
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
                placeholder='Nhập số bàn'
              />
              {errors.tableNumber && <p className='mt-1 text-sm text-red-400'>{errors.tableNumber.message}</p>}
            </div>

            {/* Maximum Capacity */}
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>
                Sức chứa tối đa <span className='text-red-400'>*</span>
              </label>
              <input
                type='number'
                {...register('maximumCapacity', {
                  required: 'Vui lòng nhập sức chứa',
                  min: { value: 1, message: 'Sức chứa phải lớn hơn 0' },
                  valueAsNumber: true
                })}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-neutral-800 text-amber-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 ${errors.maximumCapacity
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-neutral-700 focus:border-savoria-gold focus:ring-savoria-gold/20'
                  }`}
                placeholder='Nhập sức chứa tối đa'
              />
              {errors.maximumCapacity && (
                <p className='mt-1 text-sm text-red-400'>{errors.maximumCapacity.message}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>Vị trí</label>
              <input
                type='text'
                {...register('position')}
                className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-amber-50 placeholder:text-neutral-500 focus:border-savoria-gold focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
                placeholder='VD: Tầng 1, Góc cửa sổ...'
              />
            </div>

            {/* Status */}
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-300'>Trạng thái</label>
              <select
                {...register('status')}
                className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-amber-50 focus:border-savoria-gold focus:outline-none focus:ring-2 focus:ring-savoria-gold/20'
              >
                <option value='available'>Trống</option>
                <option value='occupied'>Đang sử dụng</option>
                <option value='reserved'>Đã đặt trước</option>
              </select>
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
