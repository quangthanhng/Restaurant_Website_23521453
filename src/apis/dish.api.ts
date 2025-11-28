import http from '../utils/http'
import type { DishListResponse, DishQueryParams } from '../types/dish.type'

// Type cho form data khi tạo/update món ăn
export interface DishFormData {
  name: string
  price: number
  discount?: number
  category: string
  image: string
  description: string
  status: 'active' | 'inactive'
  bestSeller: boolean
  ingredients?: string
  prepareTime?: string
}

const dishApi = {
  // Lấy danh sách món ăn
  getDishes: (params?: DishQueryParams) => {
    return http.get<DishListResponse>('/dishes', { params })
  },

  // Lấy chi tiết món ăn
  getDishDetail: (id: string) => {
    return http.get<DishListResponse>(`/dishes/detail/${id}`)
  },

  // Tạo món ăn mới
  createDish: (data: DishFormData | FormData) => {
    if (data instanceof FormData) {
      return http.post<DishListResponse>('/dishes/create', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    return http.post<DishListResponse>('/dishes/create', data)
  },

  // Cập nhật món ăn
  updateDish: (id: string, data: DishFormData | FormData) => {
    if (data instanceof FormData) {
      return http.patch<DishListResponse>(`/dishes/edit/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    return http.patch<DishListResponse>(`/dishes/edit/${id}`, data)
  },

  // Xóa món ăn
  deleteDish: (id: string) => {
    return http.delete<DishListResponse>(`/dishes/delete/${id}`)
  },

  // Thay đổi trạng thái món ăn
  changeStatus: (id: string, status: 'active' | 'inactive') => {
    return http.patch<DishListResponse>(`/dishes/change-status/${id}/${status}`)
  },

  // Thay đổi nhiều món ăn
  changeMulti: (data: { ids: string[]; key: string; value: string }) => {
    return http.patch<DishListResponse>('/dishes/change-multi', data)
  }
}

export default dishApi
