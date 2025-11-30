import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Dish } from '../types/dish.type'

export interface CartItem {
    dish: Dish
    quantity: number
}

interface CartContextType {
    cartItems: CartItem[]
    addToCart: (dish: Dish, quantity?: number) => void
    removeFromCart: (dishId: string) => void
    updateQuantity: (dishId: string, quantity: number) => void
    clearCart: () => void
    getTotalItems: () => number
    getTotalPrice: () => number
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

export const CartProvider = ({ children }: CartProviderProps) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        // Load cart from localStorage on init
        const savedCart = localStorage.getItem('restaurant_cart')
        try {
            return savedCart ? JSON.parse(savedCart) : []
        } catch (error) {
            console.error('Error parsing cart from localStorage:', error)
            return []
        }
    })

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('restaurant_cart', JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (dish: Dish, quantity: number = 1) => {
        setCartItems((prev) => {
            const existingItem = prev.find((item) => item.dish._id === dish._id)

            if (existingItem) {
                // Update quantity if item already exists
                return prev.map((item) =>
                    item.dish._id === dish._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            // Add new item
            return [...prev, { dish, quantity }]
        })
    }

    const removeFromCart = (dishId: string) => {
        setCartItems((prev) => prev.filter((item) => item.dish._id !== dishId))
    }

    const updateQuantity = (dishId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(dishId)
            return
        }

        setCartItems((prev) =>
            prev.map((item) =>
                item.dish._id === dishId ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setCartItems([])
    }

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0)
    }

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.dish.finalPrice * item.quantity, 0)
    }

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalItems,
                getTotalPrice
            }}
        >
            {children}
        </CartContext.Provider>
    )
}
