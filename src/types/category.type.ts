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
