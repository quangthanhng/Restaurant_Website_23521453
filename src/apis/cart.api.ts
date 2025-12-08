import type {
  CartResponse,
  AddToCartRequest,
  ChangeQuantityRequest,
  CartMutationResponse,
  ClearCartResponse,
  RemoveFromCartRequest
} from '../types/cart.type'
import http from '../utils/http'

const cartApi = {
  // Lấy giỏ hàng
  getCart: () => {
    return http.get<CartResponse>('/carts')
  },

  // Thêm món vào giỏ hàng
  addToCart: (body: AddToCartRequest) => {
    return http.post<CartMutationResponse>('/carts/add', body)
  },

  // Thay đổi số lượng món trong giỏ (đúng endpoint: POST /carts/edit)
  changeQuantity: (body: ChangeQuantityRequest) => {
    return http.post<CartMutationResponse>('/carts/edit', body)
  },

  // Xóa một món khỏi giỏ hàng (đúng endpoint: DELETE /carts/delete-item)
  removeFromCart: (body: RemoveFromCartRequest) => {
    return http.delete<CartMutationResponse>('/carts/delete-item', { data: body })
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: () => {
    return http.delete<ClearCartResponse>('/carts/clear')
  }
}

export default cartApi
