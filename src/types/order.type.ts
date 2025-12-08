import type { User } from './user.type'
import type { Table } from './table.type'
import type { Cart } from './cart.type'

export interface Order {
  _id: string
  orderId?: string // Optional - có thể không có từ backend
  userId: User
  cartId?: Cart
  tableId?: Table
  deleveryAddress?: string
  deliveryOptions?: 'delivery' | 'pickup' | 'dine-in'
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  typeOfPayment?: 'cod' | 'momo' | 'cash' | 'card'
  payed: boolean
  createdAt: string
  updatedAt: string
  // Thông tin đặt bàn (nếu ăn tại nhà hàng)
  bookingTime?: string
  checkInTime?: string
  checkOutTime?: string
}

export interface OrderQueryParams {
  page?: number
  limit?: number
  status?: string
  payed?: boolean
  deliveryOptions?: string
  typeOfPayment?: string
}

// Request body cho tạo order mới
export interface CreateOrderRequest {
  cartId: string
  tableId?: string
  deleveryAddress?: string
  deliveryOptions?: 'delivery' | 'pickup' | 'dine-in'
  totalPrice: number
  // Backend chấp nhận: 'cash', 'card', 'online', 'momo', 'zalopay'
  typeOfPayment?: 'cash' | 'card' | 'online' | 'momo' | 'zalopay'
  bookingTime?: string
}

// Response khi tạo order
export interface OrderResponse {
  message: string
  statusCode: number
  metadata: Order
}

// Response danh sách orders
export interface OrdersResponse {
  message: string
  statusCode: number
  metadata:
    | Order[]
    | {
        orders: Order[]
        totalPages: number
        currentPage: number
        total: number
      }
}
