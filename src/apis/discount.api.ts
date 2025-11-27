import http from '../utils/http'
import type { Discount } from '../types/discount.type'

export const getDiscounts = () => http.get<{ metadata: Discount[] }>('/discounts')
export const createDiscount = (data: Partial<Discount>) => http.post('/discounts/create', data)
export const editDiscount = (id: string, data: Partial<Discount>) => http.patch(`/discounts/edit/${id}`, data)
export const deleteDiscount = (id: string) => http.delete(`/discounts/delete/${id}`)
export const changeStatus = (id: string, active: boolean) =>
  http.patch(`/discounts/change-status/${id}/${active ? 'active' : 'inactive'}`)
