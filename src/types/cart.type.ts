// Type cho Cart Item từ API
export interface CartItemDish {
  _id: string
  name: string
  price: number
  image: string
}

export interface CartItem {
  dishId: CartItemDish
  quantity: number
}

// Type cho User trong Cart
export interface CartUser {
  _id: string
  username: string
  email: string
}

// Type cho Cart response từ API
export interface Cart {
  _id: string
  userId: CartUser
  items: CartItem[]
  totalPrice: number
  createdAt: string
  updatedAt: string
}

// Response khi lấy giỏ hàng
export interface CartResponse {
  message: string
  statusCode: number
  metadata: Cart
}

// Request body cho add to cart
export interface AddToCartRequest {
  dishId: string
  quantity: number
}

// Request body cho change quantity
export interface ChangeQuantityRequest {
  dishId: string
  quantity: number
}

// Response khi thêm/cập nhật giỏ hàng
export interface CartMutationResponse {
  message: string
  statusCode: number
  metadata: Cart
}

// Response khi xóa toàn bộ giỏ hàng
export interface ClearCartResponse {
  code: number
  message: string
  data: object
}
