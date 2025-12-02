import type {
  CartResponse,
  AddToCartRequest,
  ChangeQuantityRequest,
  CartMutationResponse,
  ClearCartResponse
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

  // Thay đổi số lượng món trong giỏ (quantity = 0 để xóa món)
  changeQuantity: (body: ChangeQuantityRequest) => {
    return http.post<CartMutationResponse>('/carts/change', body)
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: () => {
    return http.delete<ClearCartResponse>('/carts/clear')
  }
}

export default cartApi
