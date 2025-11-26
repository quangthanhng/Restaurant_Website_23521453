import { createContext } from 'react'
import type { ToastType } from './Toast'

export interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)
