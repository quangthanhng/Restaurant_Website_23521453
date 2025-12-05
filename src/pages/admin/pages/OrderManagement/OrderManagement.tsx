import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import orderApi from '../../../../apis/order.api'
import type { Order, OrderQueryParams } from '../../../../types/order.type'
import type { User } from '../../../../types/user.type'
import type { Table } from '../../../../types/table.type'
import { useToast } from '../../../../components/Toast'

export default function OrderManagement() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [queryParams, setQueryParams] = useState<OrderQueryParams>({ page: 1, limit: 10, status: '', payed: undefined })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Fetch orders
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-orders', queryParams],
    queryFn: () => orderApi.getOrders(queryParams),
    select: (res) => res.data
  })

  const orders: Order[] = data?.data?.orders || []
  const totalPages = data?.data?.totalPages || 1
  const currentPage = data?.data?.currentPage || 1

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Cập nhật trạng thái thành công!')
    },
    onError: (err: Error) => toast.error('Lỗi cập nhật trạng thái: ' + err.message)
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => orderApi.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Xóa đơn hàng thành công!')
      setSelectedOrder(null)
    },
    onError: (err: Error) => toast.error('Lỗi xóa đơn hàng: ' + err.message)
  })

  // Handle filter
  const handleStatusChange = (status: string) => setQueryParams((prev) => ({ ...prev, status, page: 1 }))
  const handlePayedChange = (payed: string) => setQueryParams((prev) => ({ ...prev, payed: payed === '' ? undefined : payed === 'true', page: 1 }))
  const handlePageChange = (page: number) => setQueryParams((prev) => ({ ...prev, page }))

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      deleteMutation.mutate(id)
    }
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Chờ xử lý' }
      case 'completed':
        return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Hoàn thành' }
      case 'cancelled':
        return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Đã hủy' }
      default:
        return { bg: 'bg-neutral-500/20', text: 'text-neutral-400', label: status }
    }
  }

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
    totalRevenue: orders.filter((o) => o.payed).reduce((sum, o) => sum + o.totalPrice, 0)
  }

  // Generate page numbers
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const cp = currentPage
    const tp = totalPages

    if (tp <= 7) {
      for (let i = 1; i <= tp; i++) pages.push(i)
    } else if (cp <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(tp)
    } else if (cp >= tp - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = tp - 4; i <= tp; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      pages.push(cp - 1, cp, cp + 1)
      pages.push('...')
      pages.push(tp)
    }
    return pages
  }

  return (
    <div>
      {/* Header */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-xl font-bold text-amber-50 sm:text-2xl'>Quản lý đơn hàng</h1>
          <p className='mt-1 text-sm text-neutral-400'>Quản lý tất cả đơn hàng của nhà hàng</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5'>
        <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-savoria-gold/20'>
              <svg className='h-5 w-5 text-savoria-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
              </svg>
            </div>
            <div>
              <p className='text-2xl font-bold text-amber-50'>{stats.total}</p>
              <p className='text-xs text-neutral-400'>Tổng đơn</p>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20'>
              <svg className='h-5 w-5 text-amber-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <p className='text-2xl font-bold text-amber-400'>{stats.pending}</p>
              <p className='text-xs text-neutral-400'>Chờ xử lý</p>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20'>
              <svg className='h-5 w-5 text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <div>
              <p className='text-2xl font-bold text-green-400'>{stats.completed}</p>
              <p className='text-xs text-neutral-400'>Hoàn thành</p>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20'>
              <svg className='h-5 w-5 text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </div>
            <div>
              <p className='text-2xl font-bold text-red-400'>{stats.cancelled}</p>
              <p className='text-xs text-neutral-400'>Đã hủy</p>
            </div>
          </div>
        </div>

        <div className='col-span-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:col-span-1 lg:col-span-1'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-savoria-gold/20'>
              <svg className='h-5 w-5 text-savoria-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <p className='text-lg font-bold text-savoria-gold sm:text-xl'>{formatPrice(stats.totalRevenue)}</p>
              <p className='text-xs text-neutral-400'>Doanh thu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
        <select
          value={queryParams.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-amber-50 focus:border-savoria-gold focus:outline-none focus:ring-1 focus:ring-savoria-gold sm:w-auto'
        >
          <option value=''>Tất cả trạng thái</option>
          <option value='pending'>Chờ xử lý</option>
          <option value='completed'>Hoàn thành</option>
          <option value='cancelled'>Đã hủy</option>
        </select>
        <select
          value={queryParams.payed === undefined ? '' : String(queryParams.payed)}
          onChange={(e) => handlePayedChange(e.target.value)}
          className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-amber-50 focus:border-savoria-gold focus:outline-none focus:ring-1 focus:ring-savoria-gold sm:w-auto'
        >
          <option value=''>Tất cả thanh toán</option>
          <option value='true'>Đã thanh toán</option>
          <option value='false'>Chưa thanh toán</option>
        </select>
      </div>

      {/* Error State */}
      {isError && (
        <div className='mb-6 rounded-lg border border-red-800 bg-red-900/50 p-4 text-red-300'>
          <p className='font-medium'>Có lỗi xảy ra!</p>
          <p className='text-sm'>{(error as Error)?.message || 'Không thể tải danh sách đơn hàng'}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className='flex flex-col items-center justify-center py-12'>
          <svg className='h-8 w-8 animate-spin text-savoria-gold' fill='none' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
          </svg>
          <span className='mt-3 text-neutral-400'>Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Table for desktop/tablet */}
      {!isLoading && (
        <div className='hidden overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-sm sm:block'>
          <table className='min-w-full divide-y divide-neutral-800'>
            <thead className='bg-neutral-900'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>Mã đơn</th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>Khách hàng</th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>Bàn</th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>Tổng tiền</th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>Trạng thái</th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>Thanh toán</th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>Ngày tạo</th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-savoria-gold'>Hành động</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-neutral-800 bg-neutral-950'>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className='px-6 py-10 text-center text-neutral-400'>
                    <svg className='mx-auto h-12 w-12 text-neutral-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                    </svg>
                    <p className='mt-2'>Không có đơn hàng nào</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusBadge = getStatusBadge(order.status)
                  return (
                    <tr key={order._id} className='hover:bg-neutral-900'>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <span className='font-medium text-savoria-gold'>#{order.orderId}</span>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-savoria-gold/20'>
                            <svg className='h-4 w-4 text-savoria-gold' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                            </svg>
                          </div>
                          <span className='text-amber-50'>{(order.userId as User)?.username || 'N/A'}</span>
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        {order.tableId ? (
                          <span className='inline-flex rounded-full bg-savoria-gold/20 px-2.5 py-1 text-xs font-medium text-savoria-gold'>
                            Bàn {(order.tableId as Table).tableNumber}
                          </span>
                        ) : (
                          <span className='text-neutral-500'>—</span>
                        )}
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <span className='font-semibold text-amber-50'>{formatPrice(order.totalPrice)}</span>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                          disabled={updateStatusMutation.isPending}
                          className={`rounded-lg border-0 px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-savoria-gold/50 ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          <option value='pending'>Chờ xử lý</option>
                          <option value='completed'>Hoàn thành</option>
                          <option value='cancelled'>Đã hủy</option>
                        </select>
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        {order.payed ? (
                          <span className='inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400'>
                            <svg className='h-3 w-3' fill='currentColor' viewBox='0 0 20 20'>
                              <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                            </svg>
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className='inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400'>
                            <svg className='h-3 w-3' fill='currentColor' viewBox='0 0 20 20'>
                              <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
                            </svg>
                            Chưa thanh toán
                          </span>
                        )}
                      </td>
                      <td className='whitespace-nowrap px-6 py-4 text-sm text-neutral-400'>
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className='whitespace-nowrap px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className='rounded-lg bg-savoria-gold px-3 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-amber-200'
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            disabled={deleteMutation.isPending}
                            className='rounded-lg border border-red-500 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50'
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Card list for mobile */}
      {!isLoading && (
        <div className='block space-y-4 sm:hidden'>
          {orders.length === 0 ? (
            <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-8 text-center'>
              <svg className='mx-auto h-12 w-12 text-neutral-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
              </svg>
              <p className='mt-2 text-neutral-400'>Không có đơn hàng nào</p>
            </div>
          ) : (
            orders.map((order) => {
              const statusBadge = getStatusBadge(order.status)
              return (
                <div key={order._id} className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
                  {/* Header */}
                  <div className='mb-3 flex items-center justify-between'>
                    <span className='font-bold text-savoria-gold'>#{order.orderId}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className='mb-3 space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-neutral-400'>Khách hàng:</span>
                      <span className='font-medium text-amber-50'>{(order.userId as User)?.username || 'N/A'}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-neutral-400'>Bàn:</span>
                      <span className='font-medium text-amber-50'>
                        {order.tableId ? `Bàn ${(order.tableId as Table).tableNumber}` : '—'}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-neutral-400'>Tổng tiền:</span>
                      <span className='font-bold text-savoria-gold'>{formatPrice(order.totalPrice)}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-neutral-400'>Thanh toán:</span>
                      {order.payed ? (
                        <span className='inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400'>
                          <svg className='h-3 w-3' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                          </svg>
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400'>
                          <svg className='h-3 w-3' fill='currentColor' viewBox='0 0 20 20'>
                            <path fillRule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clipRule='evenodd' />
                          </svg>
                          Chưa TT
                        </span>
                      )}
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-neutral-400'>Ngày tạo:</span>
                      <span className='text-neutral-300'>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div className='mb-3'>
                    <label className='mb-1.5 block text-xs text-neutral-500'>Thay đổi trạng thái</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                      disabled={updateStatusMutation.isPending}
                      className='w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-amber-50 focus:border-savoria-gold focus:outline-none disabled:opacity-50'
                    >
                      <option value='pending'>Chờ xử lý</option>
                      <option value='completed'>Hoàn thành</option>
                      <option value='cancelled'>Đã hủy</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className='flex-1 rounded-lg bg-savoria-gold py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-200'
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleDelete(order._id)}
                      disabled={deleteMutation.isPending}
                      className='flex-1 rounded-lg border border-red-500 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50'
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

      {/* Pagination */}
      {!isLoading && orders.length > 0 && (
        <div className='mt-6 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4 sm:px-6'>
          {/* Info */}
          <div className='mb-4 text-center sm:text-left'>
            <p className='text-sm text-neutral-400'>
              Đang hiển thị <span className='font-semibold text-amber-50'>{orders.length}</span> đơn hàng - Trang{' '}
              <span className='font-semibold text-amber-50'>{currentPage}</span> /{' '}
              <span className='font-semibold text-amber-50'>{totalPages}</span>
            </p>
          </div>

          {/* Pagination controls */}
          <div className='flex flex-wrap items-center justify-center gap-1'>
            {/* First page button */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-all hover:border-savoria-gold hover:bg-neutral-800 hover:text-savoria-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-700 disabled:hover:bg-transparent disabled:hover:text-neutral-400'
              title='Trang đầu tiên'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 19l-7-7 7-7m8 14l-7-7 7-7' />
              </svg>
            </button>

            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-all hover:border-savoria-gold hover:bg-neutral-800 hover:text-savoria-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-700 disabled:hover:bg-transparent disabled:hover:text-neutral-400'
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
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all ${page === currentPage
                      ? 'bg-savoria-gold text-neutral-900 shadow-md shadow-savoria-gold/30'
                      : 'border border-neutral-700 text-neutral-400 hover:border-savoria-gold hover:bg-neutral-800 hover:text-savoria-gold'
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-all hover:border-savoria-gold hover:bg-neutral-800 hover:text-savoria-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-700 disabled:hover:bg-transparent disabled:hover:text-neutral-400'
              title='Trang sau'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
              </svg>
            </button>

            {/* Last page button */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 transition-all hover:border-savoria-gold hover:bg-neutral-800 hover:text-savoria-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-700 disabled:hover:bg-transparent disabled:hover:text-neutral-400'
              title='Trang cuối'
            >
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 5l7 7-7 7M5 5l7 7-7 7' />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4' onClick={() => setSelectedOrder(null)}>
          <div className='w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl' onClick={(e) => e.stopPropagation()}>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-xl font-bold text-amber-50'>Chi tiết đơn hàng</h2>
              <button onClick={() => setSelectedOrder(null)} className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-amber-50'>
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            <div className='space-y-4'>
              <div className='rounded-lg bg-neutral-900 p-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs text-neutral-500'>Mã đơn hàng</p>
                    <p className='font-bold text-savoria-gold'>#{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <p className='text-xs text-neutral-500'>Khách hàng</p>
                    <p className='font-medium text-amber-50'>{(selectedOrder.userId as User)?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className='text-xs text-neutral-500'>Bàn</p>
                    <p className='font-medium text-amber-50'>
                      {selectedOrder.tableId ? `Bàn ${(selectedOrder.tableId as Table).tableNumber}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-neutral-500'>Tổng tiền</p>
                    <p className='font-bold text-savoria-gold'>{formatPrice(selectedOrder.totalPrice)}</p>
                  </div>
                  <div>
                    <p className='text-xs text-neutral-500'>Trạng thái</p>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(selectedOrder.status).bg} ${getStatusBadge(selectedOrder.status).text}`}>
                      {getStatusBadge(selectedOrder.status).label}
                    </span>
                  </div>
                  <div>
                    <p className='text-xs text-neutral-500'>Thanh toán</p>
                    {selectedOrder.payed ? (
                      <span className='inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400'>
                        Đã thanh toán
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400'>
                        Chưa thanh toán
                      </span>
                    )}
                  </div>
                  <div className='col-span-2'>
                    <p className='text-xs text-neutral-500'>Ngày tạo</p>
                    <p className='text-sm text-neutral-300'>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  {selectedOrder.typeOfPayment && (
                    <div className='col-span-2'>
                      <p className='text-xs text-neutral-500'>Phương thức thanh toán</p>
                      <p className='font-medium text-amber-50'>{selectedOrder.typeOfPayment}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className='flex-1 rounded-lg border border-neutral-700 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-amber-50'
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedOrder._id)
                  }}
                  disabled={deleteMutation.isPending}
                  className='flex-1 rounded-lg bg-red-500/20 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50'
                >
                  Xóa đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
