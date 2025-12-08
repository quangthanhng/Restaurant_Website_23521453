import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import orderApi from '../../../../apis/order.api'
import type { Order, OrderQueryParams } from '../../../../types/order.type'
import type { User } from '../../../../types/user.type'
import type { Table } from '../../../../types/table.type'
import { useToast } from '../../../../components/Toast'
import socketService, { type OrderNotification } from '../../../../services/socket.service'
import DeleteConfirmModal from '../../../../components/DeleteConfirmModal/DeleteConfirmModal'

// Interface for new order notification popup
interface NewOrderPopup {
  show: boolean
  order: Order | null
}

export default function OrderManagement() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [queryParams, setQueryParams] = useState<OrderQueryParams>({
    page: 1,
    limit: 10,
    status: '',
    payed: undefined,
    deliveryOptions: '',
    typeOfPayment: ''
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newOrderPopup, setNewOrderPopup] = useState<NewOrderPopup>({ show: false, order: null })

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

  // Fetch orders - sử dụng getAllOrders cho admin (không gửi filter params vì backend không hỗ trợ đầy đủ)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => orderApi.getAllOrders(),
    select: (res) => res.data
  })

  // Xử lý cả hai dạng response: array hoặc object có orders
  const ordersData = data?.metadata
  const rawOrders: Order[] = useMemo(() => {
    return Array.isArray(ordersData) ? ordersData : ordersData?.orders || []
  }, [ordersData])

  // Client-side filtering - lọc theo tất cả các điều kiện (AND)
  const orders: Order[] = useMemo(() => {
    // Debug log
    console.log('=== FILTER DEBUG ===')
    console.log('Filter params:', JSON.stringify(queryParams))
    console.log('Raw orders count:', rawOrders.length)

    // Nếu không có filter nào được chọn, trả về tất cả orders
    const hasStatusFilter = queryParams.status && queryParams.status !== ''
    const hasPayedFilter = queryParams.payed !== undefined
    const hasDeliveryFilter = queryParams.deliveryOptions && queryParams.deliveryOptions !== ''
    const hasPaymentFilter = queryParams.typeOfPayment && queryParams.typeOfPayment !== ''

    console.log('Has filters:', { hasStatusFilter, hasPayedFilter, hasDeliveryFilter, hasPaymentFilter })

    if (!hasStatusFilter && !hasPayedFilter && !hasDeliveryFilter && !hasPaymentFilter) {
      console.log('No filters active, returning all orders')
      return rawOrders
    }

    const filtered = rawOrders.filter((order) => {
      // Filter theo status (Trạng thái)
      if (hasStatusFilter) {
        if (order.status !== queryParams.status) {
          return false
        }
      }

      // Filter theo payed (Đã thanh toán / Chưa thanh toán)
      if (hasPayedFilter) {
        const orderIsPaid = order.payed || order.status === 'confirmed' || order.status === 'completed'
        if (queryParams.payed !== orderIsPaid) {
          return false
        }
      }

      // Filter theo deliveryOptions (Hình thức: dine-in, delivery, pickup)
      if (hasDeliveryFilter) {
        if (order.deliveryOptions !== queryParams.deliveryOptions) {
          return false
        }
      }

      // Filter theo typeOfPayment (PTTT: cod, momo, card, cash)
      if (hasPaymentFilter) {
        const orderPaymentType = order.typeOfPayment?.toLowerCase() || ''
        const filterPaymentType = queryParams.typeOfPayment?.toLowerCase() || ''

        // Handle COD which can be 'cod' or 'cash'
        if (filterPaymentType === 'cod') {
          if (orderPaymentType !== 'cod' && orderPaymentType !== 'cash') {
            console.log(`❌ Order ${order._id} excluded: typeOfPayment=${orderPaymentType} !== cod/cash`)
            return false
          }
        } else if (orderPaymentType !== filterPaymentType) {
          console.log(`❌ Order ${order._id} excluded: typeOfPayment=${orderPaymentType} !== ${filterPaymentType}`)
          return false
        }
      }

      return true
    })

    console.log('Filtered orders count:', filtered.length)
    console.log('=== END FILTER DEBUG ===')
    return filtered
  }, [rawOrders, queryParams])

  // Pagination info (client-side pagination not implemented yet, showing all filtered results)
  const totalPages = 1
  const currentPage = 1

  // Update status mutation with optimistic update for instant UI response
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderApi.updateOrderStatus(id, status),
    // Optimistic update - update cache immediately before API call
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-orders'] })

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(['admin-orders'])

      // Optimistically update the cache
      queryClient.setQueryData(['admin-orders'], (old: { data?: { metadata?: Order[] | { orders?: Order[] } } }) => {
        if (!old?.data?.metadata) return old

        const ordersArray = Array.isArray(old.data.metadata) ? old.data.metadata : old.data.metadata.orders || []

        const updatedOrders = ordersArray.map((order: Order) => (order._id === id ? { ...order, status } : order))

        // Return in the same structure as original
        if (Array.isArray(old.data.metadata)) {
          return { ...old, data: { ...old.data, metadata: updatedOrders } }
        }
        return { ...old, data: { ...old.data, metadata: { ...old.data.metadata, orders: updatedOrders } } }
      })

      // Return context with the previous value for rollback
      return { previousOrders }
    },
    // If error, rollback to previous value
    onError: (err: Error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['admin-orders'], context.previousOrders)
      }
      toast.error('Lỗi cập nhật trạng thái: ' + err.message)
    },
    // Always refetch after error or success to ensure data consistency
    onSettled: () => {
      // Delay the refetch slightly to avoid visual glitch
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      }, 1000)
    }
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

  // Socket connection and listeners - chỉ chạy 1 lần khi mount
  useEffect(() => {
    // Connect to socket server
    socketService.connect()
    socketService.joinAdminRoom()

    // Handler for payment success
    // Backend gửi: { type, message, data: { orderId, email, order, message }, timestamp }
    const handlePaymentSuccess = (notification: OrderNotification) => {
      console.log('💰 Payment success notification:', notification)
      // Lấy order từ notification.data.order (cấu trúc backend)
      const orderData = ((notification.data as { order?: unknown })?.order || notification.data) as Order
      // Show popup
      setNewOrderPopup({ show: true, order: orderData })
      // Play notification sound for 5 seconds
      socketService.playNotificationSound(5000)
      // Refresh orders list
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    }

    // Handler for new order
    const handleNewOrder = (notification: OrderNotification) => {
      console.log('📦 New order notification:', notification)
      // Lấy order từ notification.data (có thể là order trực tiếp hoặc trong .order)
      const orderData = ((notification.data as { order?: unknown })?.order || notification.data) as Order
      // Show popup
      setNewOrderPopup({ show: true, order: orderData })
      // Play notification sound for 5 seconds
      socketService.playNotificationSound(5000)
      // Refresh orders list
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    }

    // Register listeners
    socketService.on('payment:success', handlePaymentSuccess)
    socketService.on('order:new', handleNewOrder)

    // Cleanup on unmount
    return () => {
      socketService.off('payment:success', handlePaymentSuccess)
      socketService.off('order:new', handleNewOrder)
      socketService.leaveAdminRoom()
    }
  }, [queryClient])

  // Handle confirm order from popup
  const handleConfirmFromPopup = useCallback(() => {
    // Ngăn double-click
    if (updateStatusMutation.isPending) return
    if (newOrderPopup.order) {
      // Confirm = cập nhật status thành confirmed
      updateStatusMutation.mutate(
        { id: newOrderPopup.order._id, status: 'confirmed' },
        {
          onSuccess: () => {
            socketService.stopNotificationSound()
            setNewOrderPopup({ show: false, order: null })
            toast.success('Đã xác nhận đơn hàng!')
          }
        }
      )
    }
  }, [newOrderPopup.order, updateStatusMutation, toast])

  // Handle reject order from popup
  const handleRejectFromPopup = useCallback(() => {
    // Ngăn double-click
    if (updateStatusMutation.isPending) return
    if (newOrderPopup.order) {
      // Reject = cancel order
      updateStatusMutation.mutate(
        { id: newOrderPopup.order._id, status: 'cancelled' },
        {
          onSuccess: () => {
            socketService.stopNotificationSound()
            setNewOrderPopup({ show: false, order: null })
            toast.info('Đã từ chối đơn hàng')
          }
        }
      )
    }
  }, [newOrderPopup.order, updateStatusMutation, toast])

  // Close popup with X button - also confirms the order
  const handleClosePopup = useCallback(() => {
    // Ngăn double-click
    if (updateStatusMutation.isPending) return
    if (newOrderPopup.order) {
      // Bấm X cũng xác nhận đơn hàng (status = confirmed)
      updateStatusMutation.mutate(
        { id: newOrderPopup.order._id, status: 'confirmed' },
        {
          onSuccess: () => {
            socketService.stopNotificationSound()
            setNewOrderPopup({ show: false, order: null })
            toast.success('Đã xác nhận đơn hàng!')
          },
          onError: () => {
            socketService.stopNotificationSound()
            setNewOrderPopup({ show: false, order: null })
          }
        }
      )
    } else {
      socketService.stopNotificationSound()
      setNewOrderPopup({ show: false, order: null })
    }
  }, [newOrderPopup.order, updateStatusMutation, toast])

  // Handle filter
  const handleStatusChange = (status: string) => setQueryParams((prev) => ({ ...prev, status, page: 1 }))
  const handlePayedChange = (payed: string) =>
    setQueryParams((prev) => ({ ...prev, payed: payed === '' ? undefined : payed === 'true', page: 1 }))
  const handleDeliveryOptionsChange = (deliveryOptions: string) =>
    setQueryParams((prev) => ({ ...prev, deliveryOptions, page: 1 }))
  const handlePaymentTypeChange = (typeOfPayment: string) =>
    setQueryParams((prev) => ({ ...prev, typeOfPayment, page: 1 }))
  const handlePageChange = (page: number) => setQueryParams((prev) => ({ ...prev, page }))

  const openDeleteModal = (order: Order) => {
    setOrderToDelete(order)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setOrderToDelete(null)
    setDeleteModalOpen(false)
  }

  const confirmDelete = () => {
    if (orderToDelete) {
      deleteMutation.mutate(orderToDelete._id)
      closeDeleteModal()
    }
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Format datetime as "HH:mm:ss, dd/MM/yyyy"
  // Parse directly from ISO string to avoid timezone issues
  const formatDateTime = (dateString: string | Date) => {
    if (!dateString) return 'N/A'

    const str = typeof dateString === 'string' ? dateString : dateString.toISOString()

    // Handle ISO format: "2025-12-09T00:00:00" or "2025-12-09T00:00:00.000Z"
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/)
    if (match) {
      const [, year, month, day, hours, minutes, seconds] = match
      return `${hours}:${minutes}:${seconds}, ${day}/${month}/${year}`
    }

    // Fallback to Date parsing for other formats
    const date = new Date(str)
    if (isNaN(date.getTime())) return 'N/A'
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${hours}:${minutes}:${seconds}, ${day}/${month}/${year}`
  }

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-amber-400/20', text: 'text-amber-400', label: 'Chờ xử lý' }
      case 'confirmed':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Đã xác nhận' }
      case 'completed':
        return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Hoàn thành' }
      case 'cancelled':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Đã hủy' }
      default:
        return { bg: 'bg-neutral-500/20', text: 'text-gray-500', label: status }
    }
  }

  // Get delivery options badge
  const getDeliveryOptionsBadge = (deliveryOptions?: string) => {
    switch (deliveryOptions) {
      case 'dine-in':
        return {
          bg: 'bg-gradient-to-r from-purple-100 to-violet-100 border border-purple-200',
          text: 'text-purple-700',
          label: 'Tại quán'
        }
      case 'delivery':
        return {
          bg: 'bg-gradient-to-r from-blue-100 to-sky-100 border border-blue-200',
          text: 'text-blue-700',
          label: 'Giao hàng'
        }
      case 'pickup':
        return {
          bg: 'bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200',
          text: 'text-orange-700',
          label: 'Tự lấy'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-100 to-slate-100 border border-gray-200',
          text: 'text-gray-600',
          label: 'Không xác định'
        }
    }
  }

  // Get payment type badge
  const getPaymentTypeBadge = (typeOfPayment?: string) => {
    switch (typeOfPayment) {
      case 'cod':
      case 'cash':
        return {
          bg: 'bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200',
          text: 'text-emerald-700',
          label: 'COD'
        }
      case 'momo':
        return {
          bg: 'bg-gradient-to-r from-pink-100 to-rose-100 border border-pink-200',
          text: 'text-pink-700',
          label: 'MoMo'
        }
      case 'card':
        return {
          bg: 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200',
          text: 'text-blue-700',
          label: 'Thẻ'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-100 to-slate-100 border border-gray-200',
          text: 'text-gray-600',
          label: 'Chưa chọn'
        }
    }
  }

  // Helper: Kiểm tra đã thanh toán - confirmed hoặc completed = đã thanh toán
  const isPaid = (order: Order) => {
    return order.payed || order.status === 'confirmed' || order.status === 'completed'
  }

  // Statistics - sử dụng rawOrders để thống kê tổng quan (không bị ảnh hưởng bởi filter)
  const stats = {
    total: rawOrders.length,
    pending: rawOrders.filter((o) => o.status === 'pending').length,
    completed: rawOrders.filter((o) => o.status === 'completed').length,
    cancelled: rawOrders.filter((o) => o.status === 'cancelled').length,
    totalRevenue: rawOrders.filter((o) => isPaid(o)).reduce((sum, o) => sum + o.totalPrice, 0),
    // Thống kê theo hình thức
    dineIn: rawOrders.filter((o) => o.deliveryOptions === 'dine-in').length,
    delivery: rawOrders.filter((o) => o.deliveryOptions === 'delivery').length,
    pickup: rawOrders.filter((o) => o.deliveryOptions === 'pickup').length,
    // Thống kê thanh toán - confirmed/completed = đã thanh toán
    payed: rawOrders.filter((o) => isPaid(o)).length,
    unpayed: rawOrders.filter((o) => !isPaid(o)).length,
    cod: rawOrders.filter((o) => o.typeOfPayment === 'cod' || o.typeOfPayment === 'cash').length,
    momo: rawOrders.filter((o) => o.typeOfPayment === 'momo').length
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
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6'>
      {/* Header */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent sm:text-3xl'>
            Quản lý đơn hàng
          </h1>
          <p className='mt-1 text-sm text-gray-500'>Theo dõi và quản lý đơn hàng của nhà hàng</p>
        </div>
        <div className='flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2'>
          <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse'></div>
          <span className='text-sm font-medium text-green-700'>Đang hoạt động</span>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className='mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5'>
        {/* Tổng đơn */}
        <div className='group rounded-2xl bg-white p-5 shadow-sm border border-gray-100/50 hover:shadow-md hover:border-amber-200 transition-all duration-300'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25'>
              <svg className='h-6 w-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
            </div>
            <div>
              <p className='text-3xl font-bold text-gray-900'>{stats.total}</p>
              <p className='text-sm text-gray-500'>Tổng đơn</p>
            </div>
          </div>
        </div>

        {/* Chờ xử lý */}
        <div className='group rounded-2xl bg-white p-5 shadow-sm border border-gray-100/50 hover:shadow-md hover:border-yellow-200 transition-all duration-300'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/25'>
              <svg className='h-6 w-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div>
              <p className='text-3xl font-bold text-yellow-600'>{stats.pending}</p>
              <p className='text-sm text-gray-500'>Chờ xử lý</p>
            </div>
          </div>
        </div>
        {/* Hoàn thành */}
        <div className='group rounded-2xl bg-white p-5 shadow-sm border border-gray-100/50 hover:shadow-md hover:border-green-200 transition-all duration-300'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/25'>
              <svg className='h-6 w-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <div>
              <p className='text-3xl font-bold text-green-600'>{stats.completed}</p>
              <p className='text-sm text-gray-500'>Hoàn thành</p>
            </div>
          </div>
        </div>

        {/* Đã hủy */}
        <div className='group rounded-2xl bg-white p-5 shadow-sm border border-gray-100/50 hover:shadow-md hover:border-red-200 transition-all duration-300'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-500/25'>
              <svg className='h-6 w-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </div>
            <div>
              <p className='text-3xl font-bold text-red-500'>{stats.cancelled}</p>
              <p className='text-sm text-gray-500'>Đã hủy</p>
            </div>
          </div>
        </div>

        {/* Doanh thu */}
        <div className='col-span-2 lg:col-span-1 group rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 shadow-lg hover:shadow-xl transition-all duration-300'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm'>
              <svg className='h-6 w-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div>
              <p className='text-2xl font-bold text-white'>{formatPrice(stats.totalRevenue)}</p>
              <p className='text-sm text-white/80'>Doanh thu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Statistics - Quick Overview */}
      <div className='mb-6 rounded-2xl bg-white shadow-sm border border-gray-100/50 p-5'>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
          {/* Đã thanh toán */}
          <div className='group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 border border-green-100 hover:border-green-300 hover:shadow-md hover:shadow-green-100 transition-all duration-300 cursor-default'>
            <div className='absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-200/30 to-transparent rounded-bl-full'></div>
            <div className='relative'>
              <p className='text-2xl font-bold text-green-600 mb-0.5'>{stats.payed}</p>
              <p className='text-xs font-semibold uppercase tracking-wide text-green-500/80'>Đã thanh toán</p>
            </div>
          </div>

          {/* Chưa thanh toán */}
          <div className='group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 border border-amber-100 hover:border-amber-300 hover:shadow-md hover:shadow-amber-100 transition-all duration-300 cursor-default'>
            <div className='absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-200/30 to-transparent rounded-bl-full'></div>
            <div className='relative'>
              <p className='text-2xl font-bold text-amber-600 mb-0.5'>{stats.unpayed}</p>
              <p className='text-xs font-semibold uppercase tracking-wide text-amber-500/80'>Chưa thanh toán</p>
            </div>
          </div>

          {/* Ăn tại nhà hàng */}
          <div className='group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 p-4 border border-purple-100 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100 transition-all duration-300 cursor-default'>
            <div className='absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-200/30 to-transparent rounded-bl-full'></div>
            <div className='relative'>
              <p className='text-2xl font-bold text-purple-600 mb-0.5'>{stats.dineIn}</p>
              <p className='text-xs font-semibold uppercase tracking-wide text-purple-500/80'>Tại quán</p>
            </div>
          </div>

          {/* Giao hàng */}
          <div className='group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 p-4 border border-blue-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100 transition-all duration-300 cursor-default'>
            <div className='absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-200/30 to-transparent rounded-bl-full'></div>
            <div className='relative'>
              <p className='text-2xl font-bold text-blue-600 mb-0.5'>{stats.delivery}</p>
              <p className='text-xs font-semibold uppercase tracking-wide text-blue-500/80'>Giao hàng</p>
            </div>
          </div>

          {/* COD */}
          <div className='group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 border border-emerald-100 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100 transition-all duration-300 cursor-default'>
            <div className='absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-200/30 to-transparent rounded-bl-full'></div>
            <div className='relative'>
              <p className='text-2xl font-bold text-emerald-600 mb-0.5'>{stats.cod}</p>
              <p className='text-xs font-semibold uppercase tracking-wide text-emerald-500/80'>Tiền mặt</p>
            </div>
          </div>

          {/* MoMo */}
          <div className='group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 p-4 border border-pink-100 hover:border-pink-300 hover:shadow-md hover:shadow-pink-100 transition-all duration-300 cursor-default'>
            <div className='absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-pink-200/30 to-transparent rounded-bl-full'></div>
            <div className='relative'>
              <p className='text-2xl font-bold text-pink-600 mb-0.5'>{stats.momo}</p>
              <p className='text-xs font-semibold uppercase tracking-wide text-pink-500/80'>MoMo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className='mb-6 rounded-2xl bg-white shadow-sm border border-gray-100/50 p-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-2 text-gray-500'>
            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
              />
            </svg>
            <span className='text-sm font-medium hidden sm:inline'>Bộ lọc:</span>
          </div>

          <select
            value={queryParams.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className='flex-1 sm:flex-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all hover:border-gray-300 cursor-pointer min-w-[150px]'
          >
            <option value=''>Tất cả trạng thái</option>
            <option value='pending'>Chờ xử lý</option>
            <option value='confirmed'>Đã xác nhận</option>
            <option value='completed'>Hoàn thành</option>
            <option value='cancelled'>Đã hủy</option>
          </select>

          <select
            value={queryParams.payed === undefined ? '' : String(queryParams.payed)}
            onChange={(e) => handlePayedChange(e.target.value)}
            className='flex-1 sm:flex-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all hover:border-gray-300 cursor-pointer min-w-[150px]'
          >
            <option value=''>Thanh toán</option>
            <option value='true'>Đã thanh toán</option>
            <option value='false'>Chưa thanh toán</option>
          </select>

          <select
            value={queryParams.deliveryOptions || ''}
            onChange={(e) => handleDeliveryOptionsChange(e.target.value)}
            className='flex-1 sm:flex-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all hover:border-gray-300 cursor-pointer min-w-[150px]'
          >
            <option value=''>Hình thức</option>
            <option value='dine-in'>Tại quán</option>
            <option value='delivery'>Giao hàng</option>
            <option value='pickup'>Tự đến lấy</option>
          </select>

          <select
            value={queryParams.typeOfPayment || ''}
            onChange={(e) => handlePaymentTypeChange(e.target.value)}
            className='flex-1 sm:flex-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all hover:border-gray-300 cursor-pointer min-w-[140px]'
          >
            <option value=''>Phương thức TT</option>
            <option value='cod'>Tiền mặt (COD)</option>
            <option value='momo'>MoMo</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className='mb-6 rounded-lg border border-amber-800 bg-amber-900/50 p-4 text-amber-300'>
          <p className='font-medium'>Có lỗi xảy ra!</p>
          <p className='text-sm'>{(error as Error)?.message || 'Không thể tải danh sách đơn hàng'}</p>
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

      {/* Table for desktop/tablet */}
      {!isLoading && (
        <div className='hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm sm:block'>
          <table className='w-full table-fixed'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='w-[80px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                  Mã đơn
                </th>
                <th className='w-[180px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                  Khách hàng
                </th>
                <th className='w-[90px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-amber-600'>
                  Loại đơn
                </th>
                <th className='w-[140px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-amber-600'>
                  Bàn/Địa chỉ
                </th>
                <th className='w-[100px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                  Tổng tiền
                </th>
                <th className='w-[120px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                  Trạng thái
                </th>
                <th className='w-[115px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-amber-600'>
                  Thanh toán
                </th>
                <th className='w-[70px] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-amber-600'>
                  PTTT
                </th>
                <th className='w-[150px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                  Ngày tạo
                </th>
                <th className='w-[130px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-amber-600'>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 bg-white'>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className='px-6 py-10 text-center text-gray-500'>
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
                        d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                      />
                    </svg>
                    <p className='mt-2'>Không có đơn hàng nào</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusBadge = getStatusBadge(order.status)
                  const deliveryBadge = getDeliveryOptionsBadge(order.deliveryOptions)
                  const paymentBadge = getPaymentTypeBadge(order.typeOfPayment)
                  // Rút gọn _id để hiển thị dễ đọc hơn
                  const shortId = order._id.slice(-6).toUpperCase()
                  return (
                    <tr key={order._id} className='hover:bg-gray-50'>
                      {/* Mã đơn */}
                      <td className='px-3 py-3 align-middle'>
                        <span className='font-medium text-amber-600'>#{shortId}</span>
                      </td>
                      {/* Khách hàng */}
                      <td className='px-3 py-3 align-middle'>
                        <div className='flex items-center gap-2'>
                          <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20'>
                            <svg
                              className='h-3.5 w-3.5 text-amber-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                              />
                            </svg>
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='truncate text-sm text-gray-900'>
                              {(order.userId as User)?.username || 'N/A'}
                            </p>
                            <p className='truncate text-xs text-gray-500'>
                              📞 {(order.userId as User)?.phoneNumber || 'Không có SĐT'}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Loại đơn */}
                      <td className='px-3 py-3 align-middle text-center'>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${deliveryBadge.bg} ${deliveryBadge.text}`}
                        >
                          {deliveryBadge.label}
                        </span>
                      </td>
                      {/* Bàn/Địa chỉ */}
                      <td className='px-3 py-3 align-middle text-center'>
                        {order.deliveryOptions === 'dine-in' && order.tableId ? (
                          <span className='inline-flex items-center rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-600'>
                            Bàn {(order.tableId as Table).tableNumber}
                          </span>
                        ) : order.deliveryOptions === 'delivery' && order.deleveryAddress ? (
                          <div className='flex items-center justify-center gap-1'>
                            <span className='text-amber-500'>📍</span>
                            <span className='truncate text-xs text-gray-600 max-w-[80px]' title={order.deleveryAddress}>
                              {order.deleveryAddress}
                            </span>
                          </div>
                        ) : (
                          <span className='text-gray-400 text-xs'>—</span>
                        )}
                      </td>
                      {/* Tổng tiền */}
                      <td className='px-3 py-3 align-middle'>
                        <span className='text-sm font-semibold text-gray-900'>{formatPrice(order.totalPrice)}</span>
                      </td>
                      {/* Trạng thái */}
                      <td className='px-3 py-3 align-middle'>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                          disabled={updateStatusMutation.isPending}
                          className={`w-full rounded-lg border-0 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-savoria-gold/50 ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          <option value='pending'>Chờ xử lý</option>
                          <option value='confirmed'>Đã xác nhận</option>
                          <option value='completed'>Hoàn thành</option>
                          <option value='cancelled'>Đã hủy</option>
                        </select>
                      </td>
                      {/* Thanh toán */}
                      <td className='px-3 py-3 align-middle text-center'>
                        {isPaid(order) ? (
                          <span className='inline-flex items-center rounded-full bg-linear-to-r from-green-100 to-emerald-100 border border-green-200 px-2 py-1 text-xs font-semibold text-green-700'>
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className='inline-flex items-center rounded-full bg-linear-to-r from-amber-100 to-orange-100 border border-amber-200 px-2 py-1 text-xs font-semibold text-amber-700'>
                            Chưa TT
                          </span>
                        )}
                      </td>
                      {/* PTTT */}
                      <td className='px-3 py-3 align-middle text-center'>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${paymentBadge.bg} ${paymentBadge.text}`}
                        >
                          {paymentBadge.label}
                        </span>
                      </td>
                      {/* Ngày tạo */}
                      <td className='px-3 py-3 align-middle text-xs text-gray-500'>
                        {formatDateTime(order.createdAt)}
                      </td>
                      {/* Hành động */}
                      <td className='px-3 py-3 align-middle'>
                        <div className='flex items-center gap-1'>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className='rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-medium text-neutral-900 transition-colors hover:bg-amber-200'
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => openDeleteModal(order)}
                            disabled={deleteMutation.isPending}
                            className='rounded-lg border border-amber-500 px-2.5 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50'
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
            <div className='rounded-xl border border-gray-200 bg-white p-8 text-center'>
              <svg className='mx-auto h-12 w-12 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
              <p className='mt-2 text-gray-500'>Không có đơn hàng nào</p>
            </div>
          ) : (
            orders.map((order) => {
              const statusBadge = getStatusBadge(order.status)
              const deliveryBadge = getDeliveryOptionsBadge(order.deliveryOptions)
              const paymentBadge = getPaymentTypeBadge(order.typeOfPayment)
              const shortId = order._id.slice(-6).toUpperCase()
              return (
                <div key={order._id} className='rounded-xl border border-gray-200 bg-white p-4'>
                  {/* Header */}
                  <div className='mb-3 flex items-center justify-between'>
                    <span className='font-bold text-amber-600'>#{shortId}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className='mb-3 space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>Khách hàng:</span>
                      <span className='font-medium text-gray-900'>{(order.userId as User)?.username || 'N/A'}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>📞 SĐT:</span>
                      <span className='text-gray-600'>{(order.userId as User)?.phoneNumber || 'Không có SĐT'}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>Loại đơn:</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${deliveryBadge.bg} ${deliveryBadge.text}`}
                      >
                        {deliveryBadge.label}
                      </span>
                    </div>
                    {order.deliveryOptions === 'dine-in' && order.tableId && (
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-gray-500'>Bàn:</span>
                        <span className='font-medium text-gray-900'>Bàn {(order.tableId as Table).tableNumber}</span>
                      </div>
                    )}
                    {order.deliveryOptions === 'dine-in' && order.bookingTime && (
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-gray-500'>Giờ đặt:</span>
                        <span className='text-gray-600'>{formatDateTime(order.bookingTime)}</span>
                      </div>
                    )}
                    {order.deliveryOptions === 'delivery' && order.deleveryAddress && (
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-gray-500'>Địa chỉ:</span>
                        <span className='max-w-[150px] truncate text-gray-600'>{order.deleveryAddress}</span>
                      </div>
                    )}
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>Tổng tiền:</span>
                      <span className='font-bold text-amber-600'>{formatPrice(order.totalPrice)}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>Thanh toán:</span>
                      {isPaid(order) ? (
                        <span className='inline-flex items-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-700'>
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className='inline-flex items-center rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700'>
                          Chưa TT
                        </span>
                      )}
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>PTTT:</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${paymentBadge.bg} ${paymentBadge.text}`}
                      >
                        {paymentBadge.label}
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>Ngày tạo:</span>
                      <span className='text-gray-600'>{formatDateTime(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div className='mb-3'>
                    <label className='mb-1.5 block text-xs text-gray-400'>Thay đổi trạng thái</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                      disabled={updateStatusMutation.isPending}
                      className='w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none disabled:opacity-50'
                    >
                      <option value='pending'>Chờ xử lý</option>
                      <option value='confirmed'>Đã xác nhận</option>
                      <option value='completed'>Hoàn thành</option>
                      <option value='cancelled'>Đã hủy</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className='flex-1 rounded-lg bg-amber-500 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-200'
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => openDeleteModal(order)}
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

      {/* Pagination */}
      {!isLoading && orders.length > 0 && (
        <div className='mt-6 rounded-xl border border-gray-200 bg-white px-4 py-4 sm:px-6'>
          {/* Info */}
          <div className='mb-4 text-center sm:text-left'>
            <p className='text-sm text-gray-500'>
              Đang hiển thị <span className='font-semibold text-gray-900'>{orders.length}</span> đơn hàng - Trang{' '}
              <span className='font-semibold text-gray-900'>{currentPage}</span> /{' '}
              <span className='font-semibold text-gray-900'>{totalPages}</span>
            </p>
          </div>

          {/* Pagination controls */}
          <div className='flex flex-wrap items-center justify-center gap-1'>
            {/* First page button */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-gray-500 transition-all hover:border-amber-500 hover:bg-stone-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-200 disabled:hover:bg-transparent disabled:hover:text-gray-500'
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
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-gray-500 transition-all hover:border-amber-500 hover:bg-stone-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-200 disabled:hover:bg-transparent disabled:hover:text-gray-500'
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
                      page === currentPage
                        ? 'bg-amber-500 text-neutral-900 shadow-md shadow-savoria-gold/30'
                        : 'border border-stone-200 text-gray-500 hover:border-amber-500 hover:bg-stone-50 hover:text-amber-600'
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-gray-500 transition-all hover:border-amber-500 hover:bg-stone-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-200 disabled:hover:bg-transparent disabled:hover:text-gray-500'
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
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-gray-500 transition-all hover:border-amber-500 hover:bg-stone-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-stone-200 disabled:hover:bg-transparent disabled:hover:text-gray-500'
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
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className='max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-900'>Chi tiết đơn hàng</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-stone-50 hover:text-gray-900'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            <div className='space-y-4'>
              <div className='rounded-lg bg-gray-50 p-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs text-gray-400'>Mã đơn hàng</p>
                    <p className='font-bold text-amber-600'>#{selectedOrder._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400'>Khách hàng</p>
                    <p className='font-medium text-gray-900'>{(selectedOrder.userId as User)?.username || 'N/A'}</p>
                    <p className='text-xs text-gray-500'>
                      📞 {(selectedOrder.userId as User)?.phoneNumber || 'Không có SĐT'}
                    </p>
                  </div>

                  {/* Loại đơn hàng */}
                  <div className='col-span-2'>
                    <p className='text-xs text-gray-400'>Loại đơn hàng</p>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getDeliveryOptionsBadge(selectedOrder.deliveryOptions).bg} ${getDeliveryOptionsBadge(selectedOrder.deliveryOptions).text}`}
                    >
                      {getDeliveryOptionsBadge(selectedOrder.deliveryOptions).label}
                    </span>
                  </div>

                  {/* Thông tin bàn (nếu ăn tại nhà hàng) */}
                  {selectedOrder.deliveryOptions === 'dine-in' && selectedOrder.tableId && (
                    <>
                      <div>
                        <p className='text-xs text-gray-400'>Bàn</p>
                        <p className='font-medium text-gray-900'>Bàn {(selectedOrder.tableId as Table).tableNumber}</p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-400'>Sức chứa</p>
                        <p className='font-medium text-gray-900'>
                          {(selectedOrder.tableId as Table).maximumCapacity || 'N/A'} người
                        </p>
                      </div>
                    </>
                  )}

                  {/* Thời gian đặt bàn */}
                  {selectedOrder.deliveryOptions === 'dine-in' && selectedOrder.bookingTime && (
                    <div className='col-span-2'>
                      <p className='text-xs text-gray-400'>🕐 Thời gian đặt bàn</p>
                      <p className='font-medium text-gray-900'>{formatDateTime(selectedOrder.bookingTime)}</p>
                    </div>
                  )}

                  {/* Thời gian check-in/check-out */}
                  {selectedOrder.checkInTime && (
                    <div>
                      <p className='text-xs text-gray-400'>⏰ Giờ vào</p>
                      <p className='font-medium text-green-400'>{formatDateTime(selectedOrder.checkInTime)}</p>
                    </div>
                  )}
                  {selectedOrder.checkOutTime && (
                    <div>
                      <p className='text-xs text-gray-400'>⏰ Giờ ra</p>
                      <p className='font-medium text-amber-400'>{formatDateTime(selectedOrder.checkOutTime)}</p>
                    </div>
                  )}

                  {/* Địa chỉ giao hàng (nếu là delivery) */}
                  {selectedOrder.deliveryOptions === 'delivery' && selectedOrder.deleveryAddress && (
                    <div className='col-span-2'>
                      <p className='text-xs text-gray-400'>📍 Địa chỉ giao hàng</p>
                      <p className='font-medium text-gray-900'>{selectedOrder.deleveryAddress}</p>
                    </div>
                  )}

                  <div>
                    <p className='text-xs text-gray-400'>Tổng tiền</p>
                    <p className='font-bold text-amber-600'>{formatPrice(selectedOrder.totalPrice)}</p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400'>Trạng thái</p>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(selectedOrder.status).bg} ${getStatusBadge(selectedOrder.status).text}`}
                    >
                      {getStatusBadge(selectedOrder.status).label}
                    </span>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400'>Thanh toán</p>
                    {isPaid(selectedOrder) ? (
                      <span className='inline-flex items-center rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700'>
                        Đã thanh toán
                      </span>
                    ) : (
                      <span className='inline-flex items-center rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700'>
                        Chưa thanh toán
                      </span>
                    )}
                  </div>
                  <div>
                    <p className='text-xs text-gray-400'>Phương thức thanh toán</p>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getPaymentTypeBadge(selectedOrder.typeOfPayment).bg} ${getPaymentTypeBadge(selectedOrder.typeOfPayment).text}`}
                    >
                      {getPaymentTypeBadge(selectedOrder.typeOfPayment).label}
                    </span>
                  </div>
                  <div className='col-span-2'>
                    <p className='text-xs text-gray-400'>Ngày tạo đơn</p>
                    <p className='text-sm text-gray-600'>{formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                  <div className='col-span-2'>
                    <p className='text-xs text-gray-400'>Cập nhật lần cuối</p>
                    <p className='text-sm text-gray-600'>{formatDateTime(selectedOrder.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className='flex-1 rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-stone-50 hover:text-gray-900'
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    openDeleteModal(selectedOrder)
                  }}
                  disabled={deleteMutation.isPending}
                  className='flex-1 rounded-lg bg-amber-500/20 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/30 disabled:opacity-50'
                >
                  Xóa đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Notification Popup */}
      {newOrderPopup.show && newOrderPopup.order && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm'>
          <div className='relative w-full max-w-md animate-bounce-in rounded-2xl bg-white p-6 shadow-2xl'>
            {/* Close button */}
            <button
              onClick={handleClosePopup}
              className='absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
            >
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>

            {/* Header with bell icon */}
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-amber-500'>
                <svg className='h-6 w-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                  />
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-bold text-amber-600'>Đơn hàng mới!</h3>
                <p className='text-sm text-gray-500'>Vừa nhận được đơn đặt bàn</p>
              </div>
            </div>

            {/* Order ID */}
            <div className='mb-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2'>
              <span className='text-sm text-gray-500'>Mã đơn hàng</span>
              <span className='font-mono font-bold text-gray-900'>
                #{newOrderPopup.order._id.slice(-6).toUpperCase()}
              </span>
              <span className='rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600'>
                Chờ xử lý
              </span>
            </div>

            {/* Customer Info */}
            <div className='mb-4 space-y-2'>
              <h4 className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
                Thông tin khách hàng
              </h4>
              <div className='rounded-lg border border-gray-100 bg-gray-50 p-3'>
                <p className='font-medium text-gray-900'>{newOrderPopup.order.userId?.username || 'Khách hàng'}</p>
                <p className='text-sm text-gray-500'>{newOrderPopup.order.userId?.phoneNumber || 'Không có SĐT'}</p>
                <p className='text-sm text-gray-500'>{newOrderPopup.order.userId?.email || ''}</p>
              </div>
            </div>

            {/* Order Details */}
            <div className='mb-4 grid grid-cols-2 gap-3'>
              <div className='rounded-lg border border-gray-100 bg-gray-50 p-3'>
                <p className='flex items-center gap-1 text-xs text-gray-400'>
                  <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  Thời gian đặt bàn
                </p>
                <p className='mt-1 text-sm font-medium text-gray-900'>
                  {formatDateTime(newOrderPopup.order.bookingTime || newOrderPopup.order.createdAt)}
                </p>
              </div>
              <div className='rounded-lg border border-gray-100 bg-gray-50 p-3'>
                <p className='text-xs text-gray-400'>
                  {newOrderPopup.order.deliveryOptions === 'delivery' ? '📍 Địa chỉ giao hàng' : 'Số bàn'}
                </p>
                <p className='mt-1 text-sm font-medium text-gray-900'>
                  {newOrderPopup.order.deliveryOptions === 'delivery'
                    ? newOrderPopup.order.deleveryAddress || 'Chưa có địa chỉ'
                    : newOrderPopup.order.tableId
                      ? `Tầng ${newOrderPopup.order.tableId.position} - Bàn ${newOrderPopup.order.tableId.tableNumber}`
                      : 'Chưa chọn bàn'}
                </p>
              </div>
              <div className='rounded-lg border border-gray-100 bg-gray-50 p-3'>
                <p className='flex items-center gap-1 text-xs text-gray-400'>
                  <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                  Phương thức thanh toán
                </p>
                <p className='mt-1 text-sm font-medium text-gray-900'>
                  {newOrderPopup.order.typeOfPayment === 'momo'
                    ? 'MoMo'
                    : newOrderPopup.order.typeOfPayment === 'cash' || newOrderPopup.order.typeOfPayment === 'cod'
                      ? 'Tiền mặt'
                      : newOrderPopup.order.typeOfPayment === 'card'
                        ? 'Thẻ'
                        : newOrderPopup.order.typeOfPayment || 'vnpay'}
                </p>
              </div>
            </div>

            {/* Order Items Preview */}
            {newOrderPopup.order.cartId?.items && newOrderPopup.order.cartId.items.length > 0 && (
              <div className='mb-4'>
                <h4 className='mb-2 text-sm font-medium text-gray-700'>Chi tiết đơn hàng</h4>
                <div className='max-h-32 space-y-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3'>
                  {newOrderPopup.order.cartId.items.map((item, idx) => (
                    <div key={idx} className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        {item.dishId?.image && (
                          <img
                            src={item.dishId.image}
                            alt={item.dishId?.name}
                            className='h-8 w-8 rounded object-cover'
                          />
                        )}
                        <span className='text-sm text-gray-700'>
                          {item.dishId?.name || 'Món ăn'}
                          <span className='ml-1 text-gray-400'>x{item.quantity}</span>
                        </span>
                      </div>
                      <span className='text-sm font-medium text-gray-900'>
                        {new Intl.NumberFormat('vi-VN').format((item.dishId?.price || 0) * (item.quantity || 1))} đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className='mb-6 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3'>
              <span className='font-medium text-gray-700'>Tổng cộng:</span>
              <span className='text-xl font-bold text-amber-600'>
                {new Intl.NumberFormat('vi-VN').format(newOrderPopup.order.totalPrice)} đ
              </span>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3'>
              <button
                onClick={handleConfirmFromPopup}
                className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white transition-all hover:bg-green-600 active:scale-95'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                </svg>
                Xác nhận đơn
              </button>
              <button
                onClick={handleRejectFromPopup}
                className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-95'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
                Từ chối
              </button>
            </div>

            {/* Timestamp */}
            <p className='mt-4 text-center text-xs text-gray-400'>
              Đặt lúc: {formatDateTime(newOrderPopup.order.createdAt)}
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title='Xác nhận xóa đơn hàng'
        message='Đơn hàng này sẽ bị xóa vĩnh viễn khỏi hệ thống'
        itemName={orderToDelete ? `Đơn hàng #${orderToDelete._id.slice(-6).toUpperCase()}` : undefined}
        itemDetails={
          orderToDelete
            ? `Tổng tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderToDelete.totalPrice)}`
            : undefined
        }
        confirmText='Xóa đơn hàng'
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
