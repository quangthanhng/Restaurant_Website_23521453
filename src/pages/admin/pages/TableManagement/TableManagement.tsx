import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import TableForm from './TableForm'
import tableApi from '../../../../apis/table.api'
import type { Table } from '../../../../types/table.type'
import { useToast } from '../../../../components/Toast'
import DeleteConfirmModal from '../../../../components/DeleteConfirmModal/DeleteConfirmModal'

export default function TableManagement() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null)

  // Fetch tables từ API
  const {
    data: tablesData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['admin-tables'],
    queryFn: () => tableApi.getTables(),
    select: (response) => response.data
  })

  // Lấy tables từ response - API trả về { metadata: [...] }
  const tables = Array.isArray(tablesData?.metadata) ? tablesData.metadata : []

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tableApi.deleteTable(id),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['admin-tables'] })
      toast.success('Xóa bàn thành công!')
      closeDeleteModal()
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi xóa bàn: ' + error.message)
    }
  })

  // Change status mutation
  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'available' | 'occupied' | 'reserved' }) =>
      tableApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tables'] })
      toast.success('Đổi trạng thái thành công!')
    },
    onError: (error: Error) => {
      toast.error('Lỗi khi thay đổi trạng thái: ' + error.message)
    }
  })

  const handleEdit = (table: Table) => {
    setEditingTable(table)
    setIsFormOpen(true)
  }

  const openDeleteModal = (table: Table) => {
    setTableToDelete(table)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setTableToDelete(null)
    setDeleteModalOpen(false)
  }

  const confirmDelete = () => {
    if (tableToDelete) {
      deleteMutation.mutate(tableToDelete._id)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTable(null)
  }

  // Filter tables
  const filteredTables = tables.filter((table) => {
    const matchSearch =
      table.tableNumber.toString().includes(searchTerm) ||
      (table.position && table.position.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchStatus = !statusFilter || table.status === statusFilter
    return matchSearch && matchStatus
  })

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          label: 'Trống'
        }
      case 'occupied':
        return {
          bg: 'bg-amber-500/20',
          text: 'text-amber-400',
          label: 'Đang sử dụng'
        }
      case 'reserved':
        return {
          bg: 'bg-amber-400/20',
          text: 'text-amber-400',
          label: 'Đã đặt trước'
        }
      default:
        return {
          bg: 'bg-neutral-500/20',
          text: 'text-gray-500',
          label: status
        }
    }
  }

  // Statistics
  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length
  }

  return (
    <div>
      {/* Header */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold text-gray-900 sm:text-2xl'>Quản lý bàn</h1>
          <p className='mt-1 text-sm text-gray-500'>Quản lý tất cả bàn của nhà hàng</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className='flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-200 sm:w-auto'
        >
          <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
          </svg>
          Thêm bàn
        </button>
      </div>

      {/* Statistics Cards */}
      <div className='mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4'>
        <div className='rounded-xl border border-gray-100 bg-white p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20'>
              <svg className='h-5 w-5 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 6h16M4 10h16M4 14h16M4 18h16'
                />
              </svg>
            </div>
            <div>
              <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
              <p className='text-xs text-gray-500'>Tổng số bàn</p>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-gray-100 bg-white p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20'>
              <svg className='h-5 w-5 text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <div>
              <p className='text-2xl font-bold text-green-400'>{stats.available}</p>
              <p className='text-xs text-gray-500'>Bàn trống</p>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-gray-100 bg-white p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20'>
              <svg className='h-5 w-5 text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div>
              <p className='text-2xl font-bold text-amber-400'>{stats.occupied}</p>
              <p className='text-xs text-gray-500'>Đang sử dụng</p>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-gray-100 bg-white p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/20'>
              <svg className='h-5 w-5 text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div>
              <p className='text-2xl font-bold text-amber-400'>{stats.reserved}</p>
              <p className='text-xs text-gray-500'>Đã đặt trước</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
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
            placeholder='Tìm theo số bàn hoặc vị trí...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-savoria-gold'
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className='w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-savoria-gold sm:w-auto'
        >
          <option value=''>Tất cả trạng thái</option>
          <option value='available'>Trống</option>
          <option value='occupied'>Đang sử dụng</option>
          <option value='reserved'>Đã đặt trước</option>
        </select>
      </div>

      {/* Error State */}
      {isError && (
        <div className='mb-6 rounded-lg border border-amber-800 bg-amber-900/50 p-4 text-amber-300'>
          <p className='font-medium'>Có lỗi xảy ra!</p>
          <p className='text-sm'>{(error as Error)?.message || 'Không thể tải danh sách bàn'}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className='flex flex-col items-center justify-center py-12'>
          <svg className='h-8 w-8 animate-spin text-amber-600' fill='none' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
          <span className='mt-3 text-gray-500'>Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Tables Grid */}
      {!isLoading && (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredTables.length === 0 ? (
            <div className='col-span-full rounded-xl border border-gray-100 bg-white p-8 text-center'>
              <svg className='mx-auto h-12 w-12 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z'
                />
              </svg>
              <p className='mt-2 text-gray-500'>Không tìm thấy bàn nào</p>
            </div>
          ) : (
            filteredTables.map((table) => {
              const statusBadge = getStatusBadge(table.status)
              return (
                <div
                  key={table._id}
                  className='group rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-stone-200'
                >
                  {/* Table Header */}
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20'>
                        <span className='text-lg font-bold text-amber-600'>{table.tableNumber}</span>
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900'>Bàn {table.tableNumber}</h3>
                        <p className='text-xs text-gray-500'>{table.position || 'Chưa xác định vị trí'}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Table Info */}
                  <div className='mb-4 space-y-2'>
                    <div className='flex items-center gap-2 text-sm'>
                      <svg className='h-4 w-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                        />
                      </svg>
                      <span className='text-gray-500'>Sức chứa:</span>
                      <span className='font-medium text-gray-900'>{table.maximumCapacity} người</span>
                    </div>
                    {table.reserved && (
                      <div className='flex items-center gap-2 text-sm'>
                        <svg className='h-4 w-4 text-gray-9000' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        <span className='text-amber-400'>Có đặt trước</span>
                      </div>
                    )}
                  </div>

                  {/* Status Selector */}
                  <div className='mb-4'>
                    <label className='mb-1.5 block text-xs text-gray-400'>Thay đổi trạng thái</label>
                    <select
                      value={table.status}
                      onChange={(e) =>
                        changeStatusMutation.mutate({
                          id: table._id,
                          status: e.target.value as 'available' | 'occupied' | 'reserved'
                        })
                      }
                      disabled={changeStatusMutation.isPending}
                      className='w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none disabled:opacity-50'
                    >
                      <option value='available'>Trống</option>
                      <option value='occupied'>Đang sử dụng</option>
                      <option value='reserved'>Đã đặt trước</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleEdit(table)}
                      className='flex-1 rounded-lg bg-amber-500 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-200'
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => openDeleteModal(table)}
                      disabled={deleteMutation.isPending}
                      className='flex-1 rounded-lg border border-amber-500 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50'
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Table Form Modal */}
      {isFormOpen && <TableForm table={editingTable} onClose={handleCloseForm} />}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title='Xác nhận xóa bàn'
        message='Bàn này sẽ bị xóa vĩnh viễn khỏi hệ thống'
        itemName={tableToDelete ? `Bàn ${tableToDelete.tableNumber}` : undefined}
        itemDetails={
          tableToDelete
            ? `Sức chứa: ${tableToDelete.maximumCapacity} người - ${tableToDelete.position || 'Chưa xác định vị trí'}`
            : undefined
        }
        confirmText='Xóa bàn'
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
