/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from 'react'
import type { Dish } from '../types/dish.type'
import type { Cart } from '../types/cart.type'

// CartItem cho local state
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

export interface CartContextType {
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

export const CartContext = createContext<CartContextType | undefined>(undefined)

// Hook để sử dụng CartContext
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
