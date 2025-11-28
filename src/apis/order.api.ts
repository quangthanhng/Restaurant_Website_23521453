import http from '../utils/http'
import type { OrderQueryParams } from '../types/order.type'

const orderApi = {
  getOrders: (params: OrderQueryParams) => http.get('/orders', { params }),
  getOrder: (id: string) => http.get(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) => http.patch(`/orders/${id}/status`, { status }),
  deleteOrder: (id: string) => http.delete(`/orders/${id}`)
}

export default orderApi
