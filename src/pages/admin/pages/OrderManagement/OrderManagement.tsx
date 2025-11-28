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
    },
    onError: (err: Error) => toast.error('Lỗi xóa đơn hàng: ' + err.message)
  })

  // Handle filter
  const handleStatusChange = (status: string) => setQueryParams((prev) => ({ ...prev, status, page: 1 }))
  const handlePayedChange = (payed: string) => setQueryParams((prev) => ({ ...prev, payed: payed === '' ? undefined : payed === 'true', page: 1 }))
  const handlePageChange = (page: number) => setQueryParams((prev) => ({ ...prev, page }))

  return (
    <div>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-amber-50'>Quản lý đơn hàng</h1>
      </div>
      {/* Filter */}
      <div className='mb-4 flex gap-4'>
        <select value={queryParams.status} onChange={e => handleStatusChange(e.target.value)} className='rounded-lg border px-4 py-2'>
          <option value=''>Tất cả trạng thái</option>
          <option value='pending'>Chờ xử lý</option>
          <option value='completed'>Hoàn thành</option>
          <option value='cancelled'>Đã hủy</option>
        </select>
        <select value={queryParams.payed === undefined ? '' : String(queryParams.payed)} onChange={e => handlePayedChange(e.target.value)} className='rounded-lg border px-4 py-2'>
          <option value=''>Tất cả thanh toán</option>
          <option value='true'>Đã thanh toán</option>
          <option value='false'>Chưa thanh toán</option>
        </select>
      </div>
      {/* Table */}
      <div className='overflow-x-auto rounded-xl border bg-neutral-950 shadow-sm'>
        <table className='min-w-full divide-y'>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Bàn</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8}>Đang tải...</td></tr>
            ) : isError ? (
              <tr><td colSpan={8}>Lỗi: {(error as Error)?.message}</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8}>Không có đơn hàng</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order._id}>
                  <td>{order.orderId}</td>
                  <td>{(order.userId as User)?.username || (order.userId as User)?._id}</td>
                  <td>{order.tableId ? `Bàn ${((order.tableId as Table).tableNumber)}` : '-'}</td>
                  <td>{order.totalPrice.toLocaleString('vi-VN')}₫</td>
                  <td>
                    <select value={order.status} onChange={e => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}>
                      <option value='pending'>Chờ xử lý</option>
                      <option value='completed'>Hoàn thành</option>
                      <option value='cancelled'>Đã hủy</option>
                    </select>
                  </td>
                  <td>
                    {order.payed ? <span className='text-green-500'>Đã thanh toán</span> : <span className='text-red-500'>Chưa thanh toán</span>}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                  <td>
                    <button onClick={() => deleteMutation.mutate(order._id)} className='text-red-500'>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className='mt-4 flex justify-center gap-2'>
        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>Đầu</button>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
        <span>Trang {currentPage} / {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau</button>
        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>Cuối</button>
      </div>
    </div>
  )
}
