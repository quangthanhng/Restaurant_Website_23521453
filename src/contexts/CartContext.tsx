/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Dish } from '../types/dish.type'
import type { Cart, CartItem as ApiCartItem } from '../types/cart.type'
import cartApi from '../apis/cart.api'
import { getAccessTokenFromLS } from '../utils/auth'
import { CartContext, type CartItem } from './cart.context'

// Re-export for convenience
export { useCart, CartContext, type CartItem, type CartContextType } from './cart.context'

// Helper để chuyển đổi từ API CartItem sang local CartItem
const convertApiCartItemToLocal = (apiItem: ApiCartItem): CartItem => {
  return {
    dish: {
      _id: apiItem.dishId._id,
      name: apiItem.dishId.name,
      price: apiItem.dishId.price,
      finalPrice: apiItem.dishId.price,
      image: apiItem.dishId.image
    },
    quantity: apiItem.quantity
  }
}

function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Helper function để fetch cart nội bộ (không set loading)
  const fetchCartInternal = useCallback(async () => {
    const accessToken = getAccessTokenFromLS()
    if (!accessToken) {
      setCart(null)
      setCartItems([])
      return
    }

    try {
      const response = await cartApi.getCart()
      const cartData = response.data.metadata

      // Nếu cart có status 'cleared', coi như không có cart
      if (cartData.status === 'cleared') {
        setCart(null)
        setCartItems([])
        return
      }

      setCart(cartData)
      const localItems = cartData.items.map(convertApiCartItemToLocal)
      setCartItems(localItems)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCart(null)
      setCartItems([])
    }
  }, [])

  // Fetch cart từ API (public, với loading state)
  const fetchCart = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetchCartInternal()
    } finally {
      setIsLoading(false)
    }
  }, [fetchCartInternal])

  // Fetch cart khi component mount
  useEffect(() => {
    const accessToken = getAccessTokenFromLS()
    if (accessToken) {
      fetchCart()
    }
  }, [fetchCart])

  // Thêm món vào giỏ hàng với Optimistic Update
  const addToCart = async (dish: Dish, quantity: number = 1) => {
    // Lưu state cũ để rollback nếu lỗi
    const previousItems = [...cartItems]
    const previousCart = cart

    // Optimistic update: cập nhật UI ngay lập tức
    const existingItemIndex = cartItems.findIndex((item) => item.dish._id === dish._id)

    if (existingItemIndex >= 0) {
      // Món đã có trong giỏ -> tăng số lượng
      const newItems = [...cartItems]
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + quantity
      }
      setCartItems(newItems)
    } else {
      // Món mới -> thêm vào giỏ
      const newItem: CartItem = {
        dish: {
          _id: dish._id,
          name: dish.name,
          price: dish.price,
          finalPrice: dish.finalPrice || dish.price,
          image: dish.image
        },
        quantity
      }
      setCartItems([...cartItems, newItem])
    }

    try {
      setIsLoading(true)
      await cartApi.addToCart({
        dishId: dish._id,
        quantity
      })
      // Sync với server để đảm bảo dữ liệu chính xác
      await fetchCartInternal()
    } catch (error) {
      // Rollback nếu lỗi
      console.error('Error adding to cart:', error)
      setCartItems(previousItems)
      setCart(previousCart)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Xóa món khỏi giỏ hàng với Optimistic Update
  const removeFromCart = async (dishId: string) => {
    const currentItem = cartItems.find((item) => item.dish._id === dishId)
    if (!currentItem) {
      console.error('Item not found in cart')
      return
    }

    // Lưu state cũ để rollback
    const previousItems = [...cartItems]
    const previousCart = cart

    // Optimistic update: xóa ngay khỏi UI
    const newItems = cartItems.filter((item) => item.dish._id !== dishId)
    setCartItems(newItems)

    // Cập nhật tổng tiền local
    if (cart) {
      const removedAmount = currentItem.dish.finalPrice * currentItem.quantity
      setCart({
        ...cart,
        totalPrice: cart.totalPrice - removedAmount,
        items: cart.items.filter((item) => item.dishId._id !== dishId)
      })
    }

    try {
      await cartApi.removeFromCart({ dishId })
      // Sync với server
      await fetchCartInternal()
    } catch (error) {
      // Rollback nếu lỗi
      console.error('Error removing from cart:', error)
      setCartItems(previousItems)
      setCart(previousCart)
      throw error
    }
  }

  // Cập nhật số lượng với Optimistic Update
  const updateQuantity = async (dishId: string, newQuantity: number) => {
    const currentItem = cartItems.find((item) => item.dish._id === dishId)
    if (!currentItem) {
      console.error('Item not found in cart')
      return
    }

    const currentQuantity = currentItem.quantity
    const delta = newQuantity - currentQuantity

    if (delta === 0) return

    if (newQuantity <= 0) {
      await removeFromCart(dishId)
      return
    }

    // Lưu state cũ để rollback
    const previousItems = [...cartItems]
    const previousCart = cart

    // Optimistic update: cập nhật số lượng ngay
    const newItems = cartItems.map((item) => (item.dish._id === dishId ? { ...item, quantity: newQuantity } : item))
    setCartItems(newItems)

    // Cập nhật tổng tiền local
    if (cart) {
      const priceChange = currentItem.dish.finalPrice * delta
      setCart({
        ...cart,
        totalPrice: cart.totalPrice + priceChange
      })
    }

    try {
      // Gọi API change với số lượng mới
      await cartApi.changeQuantity({
        dishId,
        quantity: newQuantity
      })
      // Sync với server
      await fetchCartInternal()
    } catch (error) {
      // Rollback nếu lỗi
      console.error('Error updating quantity:', error)
      setCartItems(previousItems)
      setCart(previousCart)
      throw error
    }
  }

  // Xóa toàn bộ giỏ hàng với Optimistic Update
  const clearCart = async () => {
    // Lưu state cũ để rollback
    const previousItems = [...cartItems]
    const previousCart = cart

    // Optimistic update: xóa ngay
    setCartItems([])
    setCart(null)

    try {
      await cartApi.clearCart()
    } catch (error) {
      // Rollback nếu lỗi
      console.error('Error clearing cart:', error)
      setCartItems(previousItems)
      setCart(previousCart)
      throw error
    }
  }

  // Tính tổng số món
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  // Tính tổng tiền - luôn tính từ cartItems để đảm bảo chính xác
  const getTotalPrice = () => {
    // Ưu tiên tính từ cartItems để tránh NaN
    const calculatedTotal = cartItems.reduce((total, item) => {
      const price = item.dish?.finalPrice || item.dish?.price || 0
      const quantity = item.quantity || 0
      return total + price * quantity
    }, 0)

    // Nếu có cart.totalPrice và hợp lệ, so sánh để debug
    if (cart?.totalPrice && !isNaN(cart.totalPrice)) {
      return cart.totalPrice
    }

    return calculatedTotal
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export { CartProvider }
