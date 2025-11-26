import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number // milliseconds
  onClose: (id: string) => void
}

const icons = {
  success: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
    </svg>
  ),
  error: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
    </svg>
  ),
  warning: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
    </svg>
  ),
  info: (
    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
    </svg>
  )
}

const colors = {
  success: {
    bg: 'bg-white',
    icon: 'bg-green-500 text-white',
    progress: 'bg-green-500'
  },
  error: {
    bg: 'bg-white',
    icon: 'bg-red-500 text-white',
    progress: 'bg-red-500'
  },
  warning: {
    bg: 'bg-white',
    icon: 'bg-yellow-500 text-white',
    progress: 'bg-yellow-500'
  },
  info: {
    bg: 'bg-white',
    icon: 'bg-blue-500 text-white',
    progress: 'bg-blue-500'
  }
}

export default function Toast({ id, type, message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    // Animation vào
    const showTimer = setTimeout(() => setIsVisible(true), 10)

    // Progress bar countdown
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
    }, 50)

    // Tự động đóng
    const closeTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300) // Chờ animation kết thúc
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(closeTimer)
      clearInterval(progressInterval)
    }
  }, [id, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  const colorScheme = colors[type]

  return (
    <div
      className={`pointer-events-auto w-80 overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 transition-all duration-300 ease-out ${colorScheme.bg} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
    >
      <div className='p-4'>
        <div className='flex items-start gap-3'>
          {/* Icon */}
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorScheme.icon}`}>
            {icons[type]}
          </div>

          {/* Message */}
          <div className='flex-1 pt-0.5'>
            <p className='text-sm font-medium text-gray-900'>{message}</p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className='shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-500'
          >
            <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className='h-1 w-full bg-gray-100'>
        <div
          className={`h-full transition-all duration-100 ease-linear ${colorScheme.progress}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
