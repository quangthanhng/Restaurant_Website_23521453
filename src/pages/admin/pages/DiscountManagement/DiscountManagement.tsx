import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as discountApi from '../../../../apis/discount.api'
import type { Discount } from '../../../../types/discount.type'
import { useToast } from '../../../../components/Toast'
import AdminActionButtons from '../../../../components/AdminActionButtons'
import dayjs from 'dayjs'
import DiscountForm from './DiscountForm'

type ErrorResponse = { response?: { data?: { message?: string } } }

export default function DiscountManagement() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)

  // Fetch discounts
  const { data, isLoading } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: discountApi.getDiscounts,
    select: (res: { data: { metadata: Discount[] } }) => res.data.metadata
  })
  const discounts = data || []

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: discountApi.deleteDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] })
      toast.success('Xóa mã giảm giá thành công!')
    },
    onError: (err: unknown) => {
      let message = 'Lỗi khi xóa mã giảm giá';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as ErrorResponse).response?.data?.message
      ) {
        message = (err as ErrorResponse).response!.data!.message!
      }
      toast.error(message)
    }
  })

  // Handlers
  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount)
    setIsFormOpen(true)
  }
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn chắc chắn muốn xóa mã giảm giá này?')) {
      deleteMutation.mutate(id)
    }
  }
  const handleCloseForm = () => {
    setEditingDiscount(null)
    setIsFormOpen(false)
  }

  return (
    <div>
      <div className='mb-4 flex justify-between items-center'>
        <h2 className='text-xl font-bold text-savoria-gold'>Quản lý mã giảm giá</h2>
        <button
          className='rounded-lg bg-savoria-gold px-4 py-2 text-neutral-900 font-semibold hover:bg-amber-200'
          onClick={() => { setEditingDiscount(null); setIsFormOpen(true) }}
        >
          Thêm mã giảm giá
        </button>
      </div>
      {/* Table for desktop */}
      <div className='hidden sm:block rounded-xl border border-neutral-800 bg-neutral-950 shadow-sm overflow-x-auto'>
        <table className='min-w-full divide-y divide-neutral-800'>
          <thead className='bg-neutral-900'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-savoria-gold'>Mã</th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-savoria-gold'>Mô tả</th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-savoria-gold'>Phần trăm</th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-savoria-gold'>Hiệu lực</th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-savoria-gold'>Trạng thái</th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-savoria-gold'>Hành động</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-neutral-800'>
            {isLoading ? (
              <tr><td colSpan={6} className='text-center py-8'>Đang tải...</td></tr>
            ) : discounts.length === 0 ? (
              <tr><td colSpan={6} className='text-center py-8 text-neutral-400'>Không có mã giảm giá</td></tr>
            ) : discounts.map((discount: Discount) => (
              <tr key={discount._id}>
                <td className='px-4 py-3 font-bold text-amber-50'>{discount.code}</td>
                <td className='px-4 py-3 text-neutral-300'>{discount.description}</td>
                <td className='px-4 py-3 text-savoria-gold font-semibold'>{discount.percentage}%</td>
                <td className='px-4 py-3 text-neutral-400'>
                  {dayjs(discount.validFrom).format('DD/MM/YYYY')} - {dayjs(discount.validTo).format('DD/MM/YYYY')}
                </td>
                <td className='px-4 py-3'>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${discount.active ? 'bg-green-600/20 text-green-400' : 'bg-neutral-700/40 text-neutral-400'}`}>
                    {discount.active ? 'Kích hoạt' : 'Ẩn'}
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <AdminActionButtons
                    onEdit={() => handleEdit(discount)}
                    onDelete={() => handleDelete(discount._id)}
                    editLabel='Sửa'
                    deleteLabel='Xóa'
                    showAdd={false}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Card list for mobile */}
      <div className='block sm:hidden space-y-4'>
        {isLoading && <div className='text-center py-8'>Đang tải...</div>}
        {!isLoading && discounts.length === 0 && <div className='text-center py-8 text-neutral-400'>Không có mã giảm giá</div>}
        {!isLoading && discounts.map((discount: Discount) => (
          <div key={discount._id} className='rounded-xl border border-neutral-800 bg-neutral-950 shadow p-3'>
            <div className='flex justify-between items-center'>
              <div>
                <div className='font-bold text-savoria-gold'>{discount.code}</div>
                <div className='text-xs text-neutral-400'>{discount.description}</div>
                <div className='text-xs text-neutral-400 mt-1'>Hiệu lực: {dayjs(discount.validFrom).format('DD/MM/YYYY')} - {dayjs(discount.validTo).format('DD/MM/YYYY')}</div>
                <div className='text-xs text-savoria-gold font-semibold'>Giảm {discount.percentage}%</div>
                <div className='mt-1'>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${discount.active ? 'bg-green-600/20 text-green-400' : 'bg-neutral-700/40 text-neutral-400'}`}>
                    {discount.active ? 'Kích hoạt' : 'Ẩn'}
                  </span>
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <AdminActionButtons
                  onEdit={() => handleEdit(discount)}
                  onDelete={() => handleDelete(discount._id)}
                  editLabel='Sửa'
                  deleteLabel='Xóa'
                  showAdd={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Modal form thêm/sửa */}
      {isFormOpen && (
        <DiscountForm discount={editingDiscount} onClose={handleCloseForm} />
      )}
    </div>
  )
}
