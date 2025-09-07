import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      }
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        }
      } else {
        return {
          ...state,
          items: [...state.items, action.payload]
        }
      }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }
    
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        }
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      }
    
    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  })
  const { user, isAuthenticated } = useAuth()

  // Generate cart key based on user
  const getCartKey = () => {
    return isAuthenticated && user ? `fearCart_${user.id}` : 'fearCart_guest'
  }

  // Load cart from localStorage on mount or when user changes
  useEffect(() => {
    const cartKey = getCartKey()
    const savedCart = localStorage.getItem(cartKey)
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) })
    } else {
      // Clear cart if no saved data for this user
      dispatch({ type: 'CLEAR_CART' })
    }
  }, [user, isAuthenticated])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartKey = getCartKey()
    localStorage.setItem(cartKey, JSON.stringify(state.items))
  }, [state.items, user, isAuthenticated])

  // Clear guest cart when user logs in (optional - you might want to merge instead)
  const clearGuestCart = () => {
    localStorage.removeItem('fearCart_guest')
  }

  // Merge guest cart with user cart when logging in
  const mergeGuestCart = () => {
    const guestCart = localStorage.getItem('fearCart_guest')
    if (guestCart && isAuthenticated && user) {
      const guestItems = JSON.parse(guestCart)
      guestItems.forEach(guestItem => {
        const existingItem = state.items.find(item => item.id === guestItem.id)
        if (existingItem) {
          dispatch({
            type: 'UPDATE_QUANTITY',
            payload: { id: guestItem.id, quantity: existingItem.quantity + guestItem.quantity }
          })
        } else {
          dispatch({ type: 'ADD_ITEM', payload: guestItem })
        }
      })
      clearGuestCart()
    }
  }

  const addItem = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, quantity }
    })
  }

  const removeItem = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: productId, quantity }
    })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    mergeGuestCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}