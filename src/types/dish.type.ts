// Type cho món ăn (Dish)
export interface Dish {
  _id: string
  name: string
  description: string
  price: number
  discount: number
  image: string
  categoryId: CategoryID
  status: 'active' | 'inactive'
  finalPrice: number
  rating: number
  bestSeller: boolean
  ingredients: string[]
  prepareTime: number
  createdAt: string
  updatedAt: string
  deleted: boolean
}

export interface CategoryID {
  _id: string
  name: string
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

// Response khi lấy danh sách dishes (new API structure)
export interface DishListResponse {
  message: string
  statusCode: number
  metadata: {
    dishes: Dish[]
    totalPages: number
    currentPage: number
  }
}

// Response khi lấy chi tiết 1 dish
export interface DishDetailResponse {
  message: string
  statusCode: number
  metadata: Dish
}

// Query params cho API lấy danh sách
export interface DishQueryParams {
  page?: number
  limit?: number
  category?: string
  status?: 'active' | 'inactive' | ''
  keyword?: string
}

// Error response
export interface DishErrorResponse {
  code: number
  message: string
}
