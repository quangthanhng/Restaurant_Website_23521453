import http from '../utils/http'

export interface Category {
  _id: string
  name: string
  description: string
  deleted: boolean
  status: string
  images: string
  createdAt: string
  updatedAt: string
}

export interface CategoryListResponse {
  message: string
  statusCode: number
  metadata: Category[]
}

const categoryApi = {
  getCategories: () => {
    return http.get<CategoryListResponse>('/categories')
  },
  createCategory: (data: FormData) => {
    return http.post('/categories/create', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  updateCategory: (id: string, data: FormData) => {
    return http.patch(`/categories/edit/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteCategory: (id: string) => {
    return http.delete(`/categories/delete/${id}`)
  }
}

export default categoryApi
