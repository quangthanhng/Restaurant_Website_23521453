import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import Toast from './Toast'
import type { ToastType } from './Toast'
import { ToastContext } from './context'

interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setToasts((prev) => [...prev, { id, type, message, duration }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (message: string, duration?: number) => showToast('success', message, duration),
    [showToast]
  )
  const error = useCallback((message: string, duration?: number) => showToast('error', message, duration), [showToast])
  const warning = useCallback(
    (message: string, duration?: number) => showToast('warning', message, duration),
    [showToast]
  )
  const info = useCallback((message: string, duration?: number) => showToast('info', message, duration), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Toast Container - Fixed ở góc phải trên */}
      <div className='pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-3'>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
