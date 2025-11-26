// Type cho món ăn (Dish)
export interface Dish {
  _id: string
  name: string
  description: string
  price: number
  discount: number
  image: string
  category: string
  status: 'active' | 'inactive'
  finalPrice: number
  rating: number
  position: number
  bestSeller: boolean
  ingredients: string[]
  prepareTime: number
  createdAt: string
  updatedAt: string
}

// Pagination type - hỗ trợ nhiều format từ API
export interface Pagination {
  page: number
  limit: number
  total: number
  totalItems?: number
  totalPage?: number
  totalPages?: number
}

// Response khi lấy danh sách dishes
export interface DishListResponse {
  message: string
  data: Dish[]
  pagination?: Pagination
}

// Response khi lấy chi tiết 1 dish
export interface DishDetailResponse {
  code: number
  message: string
  data: Dish
}

// Query params cho API lấy danh sách
export interface DishQueryParams {
  page?: number
  limit?: number
  category?: string
  status?: 'active' | 'inactive' | ''
}

// Error response
export interface DishErrorResponse {
  code: number
  message: string
}
