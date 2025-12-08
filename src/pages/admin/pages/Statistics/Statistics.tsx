import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import orderApi from '../../../../apis/order.api'

interface CartItem {
  dishId:
  | {
    _id: string
    name: string
    price: number
    image: string
  }
  | string
  quantity: number
  _id?: string
}

interface Order {
  _id: string
  orderId?: string
  userId: {
    _id: string
    username: string
    email: string
  }
  cartId?: {
    _id: string
    items: CartItem[]
    totalPrice?: number
  }
  tableId?: {
    _id: string
    tableNumber: number
  }
  deleveryAddress?: string
  deliveryOptions: 'dine-in' | 'delivery' | 'pickup'
  typeOfPayment: 'cash' | 'momo' | 'card' | 'cod'
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payed: boolean
  createdAt: string
  updatedAt: string
}

interface DishStat {
  name: string
  image: string
  totalQuantity: number
  totalRevenue: number
}

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444']

export default function Statistics() {
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders-stats'],
    queryFn: async () => {
      const response = await orderApi.getAllOrders()
      return response.data
    }
  })


  // tablesData query removed - can be added later for table occupancy statistics

  const orders: Order[] = useMemo(() => {
    if (!ordersData?.metadata) return []
    return ordersData.metadata as unknown as Order[]
  }, [ordersData])

  const weekOrders = useMemo(() => {
    if (!orders.length) return []
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return orders.filter((order) => new Date(order.createdAt) >= weekAgo)
  }, [orders])

  const prevWeekOrders = useMemo(() => {
    if (!orders.length) return []
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= twoWeeksAgo && orderDate < weekAgo
    })
  }, [orders])

  const isPaidOrder = (order: Order) => {
    return order.payed || order.status === 'confirmed' || order.status === 'completed'
  }

  const getDishInfo = (item: CartItem): { id: string; name: string; price: number; image: string } | null => {
    if (!item?.dishId) return null
    if (typeof item.dishId === 'object' && item.dishId !== null) {
      const dish = item.dishId as { _id: string; name: string; price: number; image: string }
      if (dish._id && dish.name) {
        return { id: dish._id, name: dish.name, price: dish.price || 0, image: dish.image || '' }
      }
    }
    return null
  }

  const stats = useMemo(() => {
    const paidOrders = weekOrders.filter((o) => isPaidOrder(o))
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0)
    const totalOrders = weekOrders.length

    const prevPaidOrders = prevWeekOrders.filter((o) => isPaidOrder(o))
    const prevRevenue = prevPaidOrders.reduce((sum, o) => sum + o.totalPrice, 0)
    const prevOrdersCount = prevWeekOrders.length

    const uniqueCustomers = new Set(weekOrders.map((o) => o.userId?._id)).size
    const prevUniqueCustomers = new Set(prevWeekOrders.map((o) => o.userId?._id)).size

    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 100
    const ordersGrowth = prevOrdersCount > 0 ? ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100 : 100
    const customersGrowth =
      prevUniqueCustomers > 0 ? ((uniqueCustomers - prevUniqueCustomers) / prevUniqueCustomers) * 100 : 100

    return { totalRevenue, totalOrders, uniqueCustomers, revenueGrowth, ordersGrowth, customersGrowth }
  }, [weekOrders, prevWeekOrders])

  const dailyRevenueData = useMemo(() => {
    const now = new Date()
    const days: { date: string; label: string; revenue: number }[] = []

    // Tạo 7 ngày gần nhất
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      // Dùng local date string thay vì ISO để so sánh
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
      days.push({ date: dateStr, label, revenue: 0 })
    }

    // Tính revenue theo ngày local
    const paidOrders = weekOrders.filter((o) => isPaidOrder(o))
    paidOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt)
      // Convert to local date string
      const orderDateStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`
      const dayIndex = days.findIndex((d) => d.date === orderDateStr)
      if (dayIndex !== -1) {
        days[dayIndex].revenue += order.totalPrice
      }
    })

    return days
  }, [weekOrders])

  const dishRevenueData = useMemo(() => {
    const dishMap = new Map<string, DishStat>()
    const paidOrders = weekOrders.filter((o) => isPaidOrder(o))

    paidOrders.forEach((order) => {
      const items = order.cartId?.items || []
      items.forEach((item: CartItem) => {
        const dishInfo = getDishInfo(item)
        if (dishInfo) {
          const existing = dishMap.get(dishInfo.id)
          const itemRevenue = dishInfo.price * item.quantity
          if (existing) {
            existing.totalQuantity += item.quantity
            existing.totalRevenue += itemRevenue
          } else {
            dishMap.set(dishInfo.id, {
              name: dishInfo.name,
              image: dishInfo.image,
              totalQuantity: item.quantity,
              totalRevenue: itemRevenue
            })
          }
        }
      })
    })

    const allDishes = Array.from(dishMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity)
    const total = allDishes.reduce((sum, d) => sum + d.totalQuantity, 0)

    // Lấy top 5 món và gom các món còn lại vào "Khác"
    const top5 = allDishes.slice(0, 5)
    const othersQuantity = allDishes.slice(5).reduce((sum, d) => sum + d.totalQuantity, 0)

    const result = top5.map((dish, index) => ({
      ...dish,
      percentage: total > 0 ? (dish.totalQuantity / total) * 100 : 0,
      color: PIE_COLORS[index % PIE_COLORS.length]
    }))

    // Thêm "Khác" nếu có món khác
    if (othersQuantity > 0) {
      result.push({
        name: 'Khác',
        image: '',
        totalQuantity: othersQuantity,
        totalRevenue: 0,
        percentage: total > 0 ? (othersQuantity / total) * 100 : 0,
        color: '#9CA3AF' // gray-400
      })
    }

    return result
  }, [weekOrders])

  const bookingByHour = useMemo(() => {
    const hours: { hour: number; count: number }[] = []
    for (let i = 8; i <= 22; i++) hours.push({ hour: i, count: 0 })

    const dineInOrders = weekOrders.filter((o) => o.deliveryOptions === 'dine-in')
    dineInOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours()
      const hourIndex = hours.findIndex((h) => h.hour === hour)
      if (hourIndex !== -1) hours[hourIndex].count++
    })

    return hours
  }, [weekOrders])

  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  }, [orders])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const formatShortCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { text: string; className: string }> = {
      pending: { text: 'Chờ xử lý', className: 'bg-amber-400/10 text-amber-400' },
      confirmed: { text: 'Đã xác nhận', className: 'bg-blue-500/10 text-blue-400' },
      completed: { text: 'Đã phục vụ', className: 'bg-green-500/10 text-green-400' },
      cancelled: { text: 'Đã hủy', className: 'bg-amber-500/10 text-amber-400' }
    }
    const c = config[status] || config.pending
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.className}`}>{c.text}</span>
  }

  if (ordersLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent'></div>
      </div>
    )
  }

  const maxRevenue = Math.max(...dailyRevenueData.map((d) => d.revenue), 1)
  const maxBooking = Math.max(...bookingByHour.map((h) => h.count), 1)

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Tổng quan</h1>
        <p className='text-sm text-gray-500'>Thống kê hoạt động của nhà hàng</p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-xl border border-stone-200 bg-stone-50/50 p-6'>
          <p className='text-sm text-gray-500'>Tổng doanh thu</p>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-2xl font-bold text-gray-900'>{formatCurrency(stats.totalRevenue)}</span>
          </div>
          <div className='mt-3 flex items-center gap-1 text-sm'>
            <span className={stats.revenueGrowth >= 0 ? 'text-green-400' : 'text-amber-400'}>
              ↗ {stats.revenueGrowth >= 0 ? '+' : ''}
              {stats.revenueGrowth.toFixed(1)}%
            </span>
            <span className='text-gray-400'>so với tuần trước</span>
          </div>
        </div>

        <div className='rounded-xl border border-stone-200 bg-stone-50/50 p-6'>
          <p className='text-sm text-gray-500'>Đơn hàng mới</p>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-2xl font-bold text-gray-900'>{stats.totalOrders}</span>
          </div>
          <div className='mt-3 flex items-center gap-1 text-sm'>
            <span className={stats.ordersGrowth >= 0 ? 'text-green-400' : 'text-amber-400'}>
              ↗ {stats.ordersGrowth >= 0 ? '+' : ''}
              {stats.ordersGrowth.toFixed(1)}%
            </span>
            <span className='text-gray-400'>so với tuần trước</span>
          </div>
        </div>

        <div className='rounded-xl border border-stone-200 bg-stone-50/50 p-6'>
          <p className='text-sm text-gray-500'>Khách hàng mới</p>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-2xl font-bold text-gray-900'>{stats.uniqueCustomers}</span>
          </div>
          <div className='mt-3 flex items-center gap-1 text-sm'>
            <span className={stats.customersGrowth >= 0 ? 'text-green-400' : 'text-amber-400'}>
              ↗ {stats.customersGrowth >= 0 ? '+' : ''}
              {stats.customersGrowth.toFixed(1)}%
            </span>
            <span className='text-gray-400'>so với tuần trước</span>
          </div>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='rounded-xl border border-stone-200 bg-stone-50/50 p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>Doanh thu trong tuần</h2>
              <p className='text-sm text-gray-500'>7 ngày gần nhất</p>
            </div>
            <div className='rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600'>
              Tổng: {formatCurrency(dailyRevenueData.reduce((sum, d) => sum + d.revenue, 0))}
            </div>
          </div>
          <div className='h-64'>
            <div className='flex h-full'>
              <div className='flex flex-col justify-between pr-4 text-right text-xs text-gray-400'>
                <span>{formatShortCurrency(maxRevenue)}</span>
                <span>{formatShortCurrency(maxRevenue * 0.75)}</span>
                <span>{formatShortCurrency(maxRevenue * 0.5)}</span>
                <span>{formatShortCurrency(maxRevenue * 0.25)}</span>
                <span>0</span>
              </div>
              <div className='flex flex-1 flex-col'>
                {/* Chart area - fixed height for bars */}
                <div className='relative flex flex-1 items-end gap-3'>
                  {dailyRevenueData.map((day, index) => {
                    const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                    const isHighest = day.revenue === maxRevenue && day.revenue > 0
                    const barColor = isHighest
                      ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                      : percentage >= 50
                        ? 'bg-gradient-to-t from-green-600 to-green-400'
                        : percentage > 0
                          ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                          : 'bg-gray-200'

                    return (
                      <div key={index} className='group relative flex flex-1 flex-col items-center h-full justify-end'>
                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-80 ${barColor}`}
                          style={{ height: `${percentage}%`, minHeight: day.revenue > 0 ? '4px' : '2px' }}
                        />

                        {/* Tooltip with full value */}
                        <div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 group-hover:block z-10'>
                          <div className='whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs text-white shadow-lg'>
                            <div className='font-semibold'>{day.label}</div>
                            <div className='text-green-400'>{formatCurrency(day.revenue)}</div>
                            {isHighest && <div className='text-amber-400 mt-1'>🏆 Ngày cao nhất</div>}
                          </div>
                          <div className='absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800'></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Date labels - separate row */}
                <div className='flex gap-3 mt-2'>
                  {dailyRevenueData.map((day, index) => {
                    const isHighest = day.revenue === maxRevenue && day.revenue > 0
                    return (
                      <div key={index} className='flex-1 text-center'>
                        <span className={`text-xs ${isHighest ? 'font-bold text-amber-600' : 'text-gray-400'}`}>
                          {day.label}
                        </span>
                        {day.revenue > 0 && (
                          <div className={`text-xs font-semibold ${isHighest ? 'text-amber-600' : 'text-gray-600'}`}>
                            {formatShortCurrency(day.revenue)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className='mt-4 flex justify-between rounded-lg bg-stone-100 p-3'>
            <div className='text-center'>
              <div className='text-lg font-bold text-green-600'>
                {formatShortCurrency(dailyRevenueData.reduce((sum, d) => sum + d.revenue, 0))}
              </div>
              <div className='text-xs text-gray-500'>Tổng tuần</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-bold text-blue-600'>
                {formatShortCurrency(dailyRevenueData.reduce((sum, d) => sum + d.revenue, 0) / 7)}
              </div>
              <div className='text-xs text-gray-500'>Trung bình/ngày</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-bold text-amber-600'>
                {dailyRevenueData.reduce((best, d) => (d.revenue > best.revenue ? d : best), dailyRevenueData[0])
                  ?.label || '-'}
              </div>
              <div className='text-xs text-gray-500'>Ngày đỉnh</div>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-stone-200 bg-stone-50/50 p-6'>
          <h2 className='mb-6 text-lg font-semibold text-gray-900'>Món ăn phổ biến</h2>
          {dishRevenueData.length > 0 ? (
            <div className='flex items-center gap-8'>
              <svg viewBox='0 0 200 200' className='h-40 w-40 shrink-0'>
                {(() => {
                  let cumulativePercent = 0
                  return dishRevenueData.map((dish, index) => {
                    const percent = dish.percentage
                    const startAngle = cumulativePercent * 3.6 - 90
                    cumulativePercent += percent
                    const endAngle = cumulativePercent * 3.6 - 90
                    const startRad = (startAngle * Math.PI) / 180
                    const endRad = (endAngle * Math.PI) / 180
                    const radius = 80
                    const cx = 100,
                      cy = 100
                    const x1 = cx + radius * Math.cos(startRad)
                    const y1 = cy + radius * Math.sin(startRad)
                    const x2 = cx + radius * Math.cos(endRad)
                    const y2 = cy + radius * Math.sin(endRad)
                    const largeArc = percent > 50 ? 1 : 0
                    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
                    return <path key={index} d={path} fill={dish.color} stroke='white' strokeWidth='2' />
                  })
                })()}
                <circle cx='100' cy='100' r='40' fill='#fafaf9' />
              </svg>
              <div className='flex-1 space-y-2'>
                {dishRevenueData.map((dish, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='h-3 w-3 rounded-sm' style={{ backgroundColor: dish.color }}></span>
                    <span className='truncate text-sm text-gray-600' title={dish.name}>
                      {dish.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex h-40 items-center justify-center text-gray-400'>Không có dữ liệu</div>
          )}
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='rounded-xl border border-stone-200 bg-stone-50/50 p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>Thống kê đặt bàn theo giờ</h2>
              <p className='text-sm text-gray-500'>Khung giờ đặt bàn trong tuần</p>
            </div>
            <div className='flex items-center gap-4'>
              <span className='flex items-center gap-2 text-sm'>
                <span className='h-3 w-3 rounded-full bg-amber-500'></span>
                <span className='text-gray-500'>Giờ cao điểm</span>
              </span>
              <span className='rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400'>
                Tổng: {bookingByHour.reduce((sum, h) => sum + h.count, 0)} đơn
              </span>
            </div>
          </div>
          <div className='h-56'>
            <div className='flex h-full items-end gap-2'>
              {bookingByHour.map((hour, index) => {
                const percentage = maxBooking > 0 ? (hour.count / maxBooking) * 100 : 0
                const isPeakHour = percentage >= 70 // Giờ cao điểm khi >= 70% max
                const barColor = isPeakHour
                  ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                  : percentage >= 40
                    ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                    : 'bg-gradient-to-t from-gray-400 to-gray-300'

                return (
                  <div key={index} className='group relative flex flex-1 flex-col items-center'>
                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-80 ${barColor}`}
                      style={{ height: `${Math.max(percentage, 5)}%`, minHeight: '8px' }}
                    />

                    {/* Tooltip */}
                    <div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 group-hover:block z-10'>
                      <div className='whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs text-white shadow-lg'>
                        <div className='font-semibold'>
                          {hour.hour}:00 - {hour.hour + 1}:00
                        </div>
                        <div className='text-gray-300'>{hour.count} đơn đặt bàn</div>
                        {isPeakHour && <div className='text-amber-400 mt-1'>🔥 Giờ cao điểm</div>}
                      </div>
                      <div className='absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800'></div>
                    </div>

                    {/* Hour label */}
                    <span className={`mt-2 text-xs ${isPeakHour ? 'font-bold text-amber-600' : 'text-gray-400'}`}>
                      {hour.hour}h
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <div className='mt-4 flex justify-between rounded-lg bg-stone-100 p-3'>
            <div className='text-center'>
              <div className='text-lg font-bold text-gray-900'>
                {bookingByHour.reduce((max, h) => (h.count > max ? h.hour : max), 0)}:00
              </div>
              <div className='text-xs text-gray-500'>Giờ đông nhất</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-bold text-amber-600'>{Math.max(...bookingByHour.map((h) => h.count))}</div>
              <div className='text-xs text-gray-500'>Đơn cao nhất/giờ</div>
            </div>
            <div className='text-center'>
              <div className='text-lg font-bold text-blue-600'>
                {(bookingByHour.reduce((sum, h) => sum + h.count, 0) / bookingByHour.length).toFixed(1)}
              </div>
              <div className='text-xs text-gray-500'>Trung bình/giờ</div>
            </div>
          </div>
        </div>

        <div className='rounded-xl border border-stone-200 bg-stone-50/50 p-6'>
          <h2 className='mb-4 text-lg font-semibold text-gray-900'>Đơn hàng gần đây</h2>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-stone-200 text-left text-gray-500'>
                  <th className='pb-3 font-medium'>Khách hàng</th>
                  <th className='pb-3 font-medium'>Số món</th>
                  <th className='pb-3 font-medium'>Tổng tiền</th>
                  <th className='pb-3 font-medium'>Trạng thái</th>
                  <th className='pb-3 font-medium'>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className='border-b border-stone-200/50'>
                    <td className='py-3 text-gray-900'>{order.userId?.username || 'Khách'}</td>
                    <td className='py-3 text-gray-600'>{order.cartId?.items?.length || 0}</td>
                    <td className='py-3 text-gray-600'>{formatCurrency(order.totalPrice)}</td>
                    <td className='py-3'>{getStatusBadge(order.status)}</td>
                    <td className='py-3 text-gray-400'>{formatTime(order.createdAt)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className='py-8 text-center text-gray-400'>
                      Chưa có đơn hàng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
