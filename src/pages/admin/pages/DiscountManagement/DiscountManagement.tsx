import { useState } from 'react'
import AdminActionButtons from '../../components/AdminActionButtons/AdminActionButtons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as discountApi from '../../../../apis/discount.api'
import type { Discount } from '../../../../types/discount.type'
import { useToast } from '../../../../components/Toast'
import DeleteConfirmModal from '../../../../components/DeleteConfirmModal/DeleteConfirmModal'

import dayjs from 'dayjs'
import DiscountForm from './DiscountForm'

type ErrorResponse = { response?: { data?: { message?: string } } }

export default function DiscountManagement() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null)

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
      closeDeleteModal()
    },
    onError: (err: unknown) => {
      let message = 'Lỗi khi xóa mã giảm giá'
      if (err && typeof err === 'object' && 'response' in err && (err as ErrorResponse).response?.data?.message) {
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

  const openDeleteModal = (discount: Discount) => {
    setDiscountToDelete(discount)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDiscountToDelete(null)
    setDeleteModalOpen(false)
  }

  const confirmDelete = () => {
    if (discountToDelete) {
      deleteMutation.mutate(discountToDelete._id)
    }
  }

  const handleCloseForm = () => {
    setEditingDiscount(null)
    setIsFormOpen(false)
  }

  return (
    <div>
      <div className='mb-4 flex justify-between items-center'>
        <h2 className='text-xl font-bold text-amber-600'>Quản lý mã giảm giá</h2>
        <button
          className='rounded-lg bg-amber-500 px-4 py-2 text-neutral-900 font-semibold hover:bg-amber-200'
          onClick={() => {
            setEditingDiscount(null)
            setIsFormOpen(true)
          }}
        >
          Thêm mã giảm giá
        </button>
      </div>
      {/* Table for desktop */}
      <div className='hidden sm:block rounded-xl border border-gray-100 bg-white shadow-sm overflow-x-auto'>
        <table className='min-w-full divide-y divide-neutral-800'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-amber-600'>Mã</th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-amber-600'>Mô tả</th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-amber-600'>Phần trăm</th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-amber-600'>Hiệu lực</th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-amber-600'>Trạng thái</th>
              <th className='px-4 py-3 text-left text-xs font-semibold uppercase text-amber-600'>Hành động</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-neutral-800'>
            {isLoading ? (
              <tr>
                <td colSpan={6} className='text-center py-8'>
                  Đang tải...
                </td>
              </tr>
            ) : discounts.length === 0 ? (
              <tr>
                <td colSpan={6} className='text-center py-8 text-gray-500'>
                  Không có mã giảm giá
                </td>
              </tr>
            ) : (
              discounts.map((discount: Discount) => (
                <tr key={discount._id}>
                  <td className='px-4 py-3 font-bold text-gray-900'>{discount.code}</td>
                  <td className='px-4 py-3 text-gray-600'>{discount.description}</td>
                  <td className='px-4 py-3 text-amber-600 font-semibold'>{discount.percentage}%</td>
                  <td className='px-4 py-3 text-gray-500'>
                    {dayjs(discount.validFrom).format('DD/MM/YYYY')} - {dayjs(discount.validTo).format('DD/MM/YYYY')}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 rounded-full text-xs font-bold ${discount.active ? 'bg-green-600/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                    >
                      {discount.active ? 'Kích hoạt' : 'Ẩn'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <AdminActionButtons
                      onEdit={() => handleEdit(discount)}
                      onDelete={() => openDeleteModal(discount)}
                      editLabel='Sửa'
                      deleteLabel='Xóa'
                      showAdd={false}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Card list for mobile */}
      <div className='block sm:hidden space-y-4'>
        {isLoading && <div className='text-center py-8'>Đang tải...</div>}
        {!isLoading && discounts.length === 0 && (
          <div className='text-center py-8 text-gray-500'>Không có mã giảm giá</div>
        )}
        {!isLoading &&
          discounts.map((discount: Discount) => (
            <div key={discount._id} className='rounded-xl border border-gray-100 bg-white shadow p-3'>
              <div className='flex justify-between items-center'>
                <div>
                  <div className='font-bold text-amber-600'>{discount.code}</div>
                  <div className='text-xs text-gray-500'>{discount.description}</div>
                  <div className='text-xs text-gray-500 mt-1'>
                    Hiệu lực: {dayjs(discount.validFrom).format('DD/MM/YYYY')} -{' '}
                    {dayjs(discount.validTo).format('DD/MM/YYYY')}
                  </div>
                  <div className='text-xs text-amber-600 font-semibold'>Giảm {discount.percentage}%</div>
                  <div className='mt-1'>
                    <span
                      className={`inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 rounded-full text-xs font-bold ${discount.active ? 'bg-green-600/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                    >
                      {discount.active ? 'Kích hoạt' : 'Ẩn'}
                    </span>
                  </div>
                </div>
                <div className='flex flex-col gap-2'>
                  <AdminActionButtons
                    onEdit={() => handleEdit(discount)}
                    onDelete={() => openDeleteModal(discount)}
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
      {isFormOpen && <DiscountForm discount={editingDiscount} onClose={handleCloseForm} />}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title='Xác nhận xóa mã giảm giá'
        message='Mã giảm giá này sẽ bị xóa vĩnh viễn'
        itemName={discountToDelete?.code}
        itemDetails={
          discountToDelete
            ? `Giảm ${discountToDelete.percentage}% - Hiệu lực: ${dayjs(discountToDelete.validFrom).format('DD/MM/YYYY')} - ${dayjs(discountToDelete.validTo).format('DD/MM/YYYY')}`
            : undefined
        }
        confirmText='Xóa mã giảm giá'
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
