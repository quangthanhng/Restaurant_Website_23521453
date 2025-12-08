import { useState, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { AppContext } from '../../contexts/app.context'
import orderApi from '../../apis/order.api'
import path from '../../constants/path'

interface OrderItem {
  dishId: {
    _id: string
    name: string
    image: string
    price: number
  }
  quantity: number
  price: number
}

interface Order {
  _id: string
  orderId?: string
  tableId?: {
    tableNumber: number
    position: string
  }
  cartId?: {
    _id: string
    items: OrderItem[]
  }
  deleveryAddress?: string
  deliveryOptions: 'dine-in' | 'delivery' | 'pickup'
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payed: boolean // Backend dùng payed, không phải paymentStatus
  typeOfPayment?: string
  createdAt: string
  note?: string
}

export default function OrderHistory() {
  const { isAuthenticated } = useContext(AppContext)
  const navigate = useNavigate()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders-history'],
    queryFn: async () => {
      const response = await orderApi.getOrders({})
      return response.data
    },
    enabled: isAuthenticated
  })

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate(path.login)
    return null
  }

  const orders: Order[] = (ordersData?.metadata as unknown as Order[]) || []
  const totalPages = Math.ceil(orders.length / ordersPerPage)
  const paginatedOrders = orders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xác nhận' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã xác nhận' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    )
  }

  // Get payment status badge - Xác định dựa trên typeOfPayment và status
  const getPaymentBadge = (order: Order) => {
    // Nếu có typeOfPayment (đã chọn phương thức) VÀ status là completed => đã thanh toán
    // Hoặc nếu có trường payed = true
    const isPayed =
      order.payed === true || (order.typeOfPayment && order.status !== 'pending' && order.status !== 'cancelled')

    if (isPayed) {
      return (
        <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700'>
          Đã thanh toán
        </span>
      )
    }
    return (
      <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700'>
        Chưa thanh toán
      </span>
    )
  }

  // Get delivery type label
  const getDeliveryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'dine-in': 'Tại bàn',
      delivery: 'Giao hàng',
      pickup: 'Tự lấy'
    }
    return labels[type] || type
  }

  // Get payment type label
  const getPaymentTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      cash: 'Tiền mặt',
      momo: 'MoMo',
      card: 'Thẻ tín dụng'
    }
    return labels[type || ''] || 'Chưa xác định'
  }

  return (
    <div className='min-h-screen bg-white pt-[74px]'>
      {/* Hero Section */}
      <section className='relative h-[200px] w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white'>
        <div className='relative flex h-full flex-col items-center justify-center px-6 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-6 py-2'>
            <svg className='h-5 w-5 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
              />
            </svg>
            <span className='text-sm font-medium text-amber-600'>Lịch sử</span>
          </div>
          <h1 className='mb-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl'>
            Lịch Sử <span className='text-amber-600'>Đơn Hàng</span>
          </h1>
          <p className='text-gray-500'>Theo dõi và quản lý tất cả đơn hàng của bạn</p>
        </div>
      </section>

      {/* Main Content */}
      <section className='mx-auto max-w-7xl px-6 py-8'>
        {/* Back to Profile Link */}
        <Link
          to={path.profile}
          className='mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors'
        >
          <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 19l-7-7 7-7' />
          </svg>
          Quay lại trang cá nhân
        </Link>

        {/* Loading State */}
        {isLoading && (
          <div className='flex min-h-[400px] items-center justify-center'>
            <div className='flex flex-col items-center gap-4'>
              <svg className='h-12 w-12 animate-spin text-amber-500' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
              </svg>
              <p className='text-gray-500'>Đang tải đơn hàng...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <div className='flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-12'>
            <svg className='mb-6 h-20 w-20 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.5'
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              />
            </svg>
            <h3 className='mb-2 text-xl font-semibold text-gray-700'>Chưa có đơn hàng nào</h3>
            <p className='mb-6 text-center text-gray-500'>Bạn chưa có đơn hàng nào. Hãy đặt món ngay!</p>
            <Link
              to={path.menu}
              className='rounded-lg bg-amber-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-600'
            >
              Khám phá thực đơn
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div className='space-y-4'>
            {paginatedOrders.map((order) => (
              <div
                key={order._id}
                className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md'
              >
                {/* Order Header */}
                <div className='flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4'>
                  <div>
                    <div className='flex items-center gap-3'>
                      <h3 className='font-semibold text-gray-900'>#{order._id.slice(-6).toUpperCase()}</h3>
                      {getStatusBadge(order.status)}
                      {getPaymentBadge(order)}
                    </div>
                    <p className='mt-1 text-sm text-gray-500'>{formatDate(order.createdAt)}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-bold text-amber-600'>{formatCurrency(order.totalPrice)}</p>
                    <p className='text-sm text-gray-500'>{getDeliveryTypeLabel(order.deliveryOptions)}</p>
                  </div>
                </div>

                {/* Order Info */}
                <div className='mt-4 grid gap-4 md:grid-cols-2'>
                  {/* Left Column - Delivery Info */}
                  <div className='space-y-2'>
                    <h4 className='text-sm font-medium text-gray-700'>Thông tin giao hàng</h4>
                    {order.deliveryOptions === 'dine-in' && order.tableId ? (
                      <div className='text-sm text-gray-600'>
                        <p>
                          Bàn số: <span className='font-medium'>{order.tableId.tableNumber}</span>
                        </p>
                        <p>
                          Tầng: <span className='font-medium'>{order.tableId.position}</span>
                        </p>
                      </div>
                    ) : order.deleveryAddress ? (
                      <p className='text-sm text-gray-600'>{order.deleveryAddress}</p>
                    ) : (
                      <p className='text-sm text-gray-400'>Không có thông tin</p>
                    )}
                    {order.note && (
                      <div className='mt-2'>
                        <p className='text-xs text-gray-400'>Ghi chú:</p>
                        <p className='text-sm text-gray-600'>{order.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Items Preview */}
                  <div>
                    <h4 className='mb-2 text-sm font-medium text-gray-700'>
                      Các món ({order.cartId?.items?.length || 0})
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {order.cartId?.items?.slice(0, 4).map((item, idx) => (
                        <div key={idx} className='flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2'>
                          {item.dishId?.image && (
                            <img
                              src={item.dishId.image}
                              alt={item.dishId?.name}
                              className='h-8 w-8 rounded-md object-cover'
                            />
                          )}
                          <div className='text-sm'>
                            <p className='font-medium text-gray-700'>{item.dishId?.name}</p>
                            <p className='text-xs text-gray-500'>x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {(order.cartId?.items?.length || 0) > 4 && (
                        <div className='flex items-center justify-center rounded-lg bg-gray-100 px-3 py-2'>
                          <span className='text-sm text-gray-500'>+{(order.cartId?.items?.length || 0) - 4} món</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* View Details Button */}
                <div className='mt-4 flex justify-end'>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className='text-sm font-medium text-amber-600 hover:text-red-700 transition-colors'
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='mt-8 flex items-center justify-center gap-2'>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className='rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Trước
                </button>
                <div className='flex gap-1'>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className='rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='flex items-center justify-between border-b border-gray-100 pb-4'>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>Chi tiết đơn hàng</h2>
                <p className='text-sm text-gray-500'>#{selectedOrder._id.slice(-6).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className='rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            {/* Order Status */}
            <div className='mt-4 flex flex-wrap gap-2'>
              {getStatusBadge(selectedOrder.status)}
              {getPaymentBadge(selectedOrder)}
              <span className='inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700'>
                {getDeliveryTypeLabel(selectedOrder.deliveryOptions)}
              </span>
            </div>

            {/* Order Info */}
            <div className='mt-4 grid gap-4 rounded-xl bg-gray-50 p-4 text-sm'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-gray-400'>Ngày đặt</p>
                  <p className='font-medium text-gray-700'>{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className='text-gray-400'>Phương thức thanh toán</p>
                  <p className='font-medium text-gray-700'>{getPaymentTypeLabel(selectedOrder.typeOfPayment)}</p>
                </div>
              </div>
              {selectedOrder.deliveryOptions === 'dine-in' && selectedOrder.tableId && (
                <div>
                  <p className='text-gray-400'>Vị trí</p>
                  <p className='font-medium text-gray-700'>
                    Bàn {selectedOrder.tableId.tableNumber} - Tầng {selectedOrder.tableId.position}
                  </p>
                </div>
              )}
              {selectedOrder.deliveryOptions !== 'dine-in' && selectedOrder.deleveryAddress && (
                <div>
                  <p className='text-gray-400'>Địa chỉ giao hàng</p>
                  <p className='font-medium text-gray-700'>{selectedOrder.deleveryAddress}</p>
                </div>
              )}
              {selectedOrder.note && (
                <div>
                  <p className='text-gray-400'>Ghi chú</p>
                  <p className='font-medium text-gray-700'>{selectedOrder.note}</p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className='mt-6'>
              <h3 className='mb-3 font-semibold text-gray-900'>Danh sách món ăn</h3>
              <div className='space-y-3'>
                {selectedOrder.cartId?.items?.map((item: OrderItem, idx: number) => (
                  <div key={idx} className='flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4'>
                    {item.dishId?.image ? (
                      <img
                        src={item.dishId.image}
                        alt={item.dishId?.name}
                        className='h-16 w-16 rounded-lg object-cover'
                      />
                    ) : (
                      <div className='flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200'>
                        <svg className='h-8 w-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                          />
                        </svg>
                      </div>
                    )}
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900'>{item.dishId?.name || 'Món ăn'}</p>
                      <p className='text-sm text-gray-500'>Số lượng: {item.quantity}</p>
                    </div>
                    <p className='font-semibold text-amber-600'>
                      {formatCurrency(item.price || (item.dishId?.price || 0) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className='mt-6 flex items-center justify-between border-t border-gray-100 pt-4'>
              <span className='text-lg font-semibold text-gray-700'>Tổng cộng</span>
              <span className='text-2xl font-bold text-amber-600'>{formatCurrency(selectedOrder.totalPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
