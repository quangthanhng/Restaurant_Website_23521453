import http from '../utils/http'
import type { OrderQueryParams, CreateOrderRequest, OrderResponse, OrdersResponse } from '../types/order.type'

const orderApi = {
  // Lấy danh sách orders của user hiện tại
  getOrders: (params: OrderQueryParams) => http.get<OrdersResponse>('/orders/my-orders', { params }),

  // Lấy tất cả orders (admin) với params
  getAllOrders: (params?: OrderQueryParams) => http.get<OrdersResponse>('/orders', { params }),

  // Lấy chi tiết order
  getOrder: (id: string) => http.get<OrderResponse>(`/orders/detail/${id}`),

  // Tạo order mới
  createOrder: (body: CreateOrderRequest) => http.post<OrderResponse>('/orders/create', body),

  // Cập nhật order
  updateOrder: (id: string, body: Partial<CreateOrderRequest>) => http.patch<OrderResponse>(`/orders/edit/${id}`, body),

  // Cập nhật trạng thái order (admin)
  updateOrderStatus: (id: string, status: string) => http.patch<OrderResponse>(`/orders/edit/${id}/status`, { status }),

  // Cập nhật phương thức thanh toán (admin)
  updatePayment: (id: string, typeOfPayment: string) =>
    http.patch<OrderResponse>(`/orders/edit/${id}/payment`, { typeOfPayment }),

  // Xác nhận thanh toán thành công (gọi khi MoMo callback về frontend)
  confirmPayment: (orderId: string, email: string) => http.get('/orders/result', { params: { id: orderId, email } }),

  // Xóa order
  deleteOrder: (id: string) => http.delete(`/orders/${id}`)
}

export default orderApi
