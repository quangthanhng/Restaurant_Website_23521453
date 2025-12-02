import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Dish } from '../types/dish.type'
import type { Cart, CartItem as ApiCartItem } from '../types/cart.type'
import cartApi from '../apis/cart.api'
import { getAccessTokenFromLS } from '../utils/auth'

// CartItem cho local state (tương thích với code cũ)
export interface CartItem {
  dish: {
    _id: string
    name: string
    price: number
    finalPrice: number
    image: string
    description?: string
    categoryId?: { _id: string; name: string }
    discount?: number
  }
  quantity: number
}

interface CartContextType {
  cart: Cart | null
  cartItems: CartItem[]
  isLoading: boolean
  addToCart: (dish: Dish, quantity?: number) => Promise<void>
  removeFromCart: (dishId: string) => Promise<void>
  updateQuantity: (dishId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
  fetchCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

// Helper để chuyển đổi từ API CartItem sang local CartItem
const convertApiCartItemToLocal = (apiItem: ApiCartItem): CartItem => {
  return {
    dish: {
      _id: apiItem.dishId._id,
      name: apiItem.dishId.name,
      price: apiItem.dishId.price,
      finalPrice: apiItem.dishId.price, // API không trả về finalPrice, dùng price
      image: apiItem.dishId.image
    },
    quantity: apiItem.quantity
  }
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch cart từ API
  const fetchCart = useCallback(async () => {
    const accessToken = getAccessTokenFromLS()
    if (!accessToken) {
      setCart(null)
      setCartItems([])
      return
    }

    try {
      setIsLoading(true)
      const response = await cartApi.getCart()
      const cartData = response.data.metadata
      setCart(cartData)
      // Chuyển đổi sang format tương thích
      const localItems = cartData.items.map(convertApiCartItemToLocal)
      setCartItems(localItems)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCart(null)
      setCartItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch cart khi component mount và khi có accessToken
  useEffect(() => {
    const accessToken = getAccessTokenFromLS()
    if (accessToken) {
      fetchCart()
    }
  }, [fetchCart])

  // Thêm món vào giỏ hàng
  const addToCart = async (dish: Dish, quantity: number = 1) => {
    try {
      setIsLoading(true)
      const response = await cartApi.addToCart({
        dishId: dish._id,
        quantity
      })
      const cartData = response.data.metadata
      setCart(cartData)
      const localItems = cartData.items.map(convertApiCartItemToLocal)
      setCartItems(localItems)
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Xóa món khỏi giỏ hàng (set quantity = 0)
  const removeFromCart = async (dishId: string) => {
    try {
      setIsLoading(true)
      const response = await cartApi.changeQuantity({
        dishId,
        quantity: 0
      })
      const cartData = response.data.metadata
      setCart(cartData)
      const localItems = cartData.items.map(convertApiCartItemToLocal)
      setCartItems(localItems)
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Cập nhật số lượng
  const updateQuantity = async (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(dishId)
      return
    }

    try {
      setIsLoading(true)
      const response = await cartApi.changeQuantity({
        dishId,
        quantity
      })
      const cartData = response.data.metadata
      setCart(cartData)
      const localItems = cartData.items.map(convertApiCartItemToLocal)
      setCartItems(localItems)
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      setIsLoading(true)
      await cartApi.clearCart()
      setCart(null)
      setCartItems([])
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Tính tổng số món
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  // Tính tổng tiền
  const getTotalPrice = () => {
    if (cart) {
      return cart.totalPrice
    }
    return cartItems.reduce((total, item) => total + item.dish.finalPrice * item.quantity, 0)
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
