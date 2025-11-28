import type { User } from './user.type'
import type { Table } from './table.type'

export interface Order {
  _id: string
  orderId: string
  userId: User
  tableId?: Table
  totalPrice: number
  status: string
  typeOfPayment?: string
  payed: boolean
  createdAt: string
  updatedAt: string
}

export interface OrderQueryParams {
  page?: number
  limit?: number
  status?: string
  payed?: boolean
}
