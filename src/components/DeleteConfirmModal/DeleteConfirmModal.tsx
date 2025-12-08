import { type ReactNode } from 'react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  itemName?: string
  itemImage?: string
  itemDetails?: string
  confirmText?: string
  cancelText?: string
  isDeleting?: boolean
  icon?: ReactNode
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Hành động này không thể hoàn tác',
  itemName,
  itemImage,
  itemDetails,
  confirmText = 'Xóa',
  cancelText = 'Hủy',
  isDeleting = false,
  icon
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4' onClick={onClose}>
      <div
        className='w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center gap-4 mb-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
            {icon || (
              <svg className='h-6 w-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            )}
          </div>
          <div>
            <h3 className='text-lg font-bold text-gray-900'>{title}</h3>
            <p className='text-sm text-gray-500'>{message}</p>
          </div>
        </div>

        {/* Item Info (optional) */}
        {(itemName || itemImage) && (
          <div className='mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100'>
            <div className='flex items-center gap-3'>
              {itemImage && <img src={itemImage} alt={itemName || ''} className='h-14 w-14 rounded-lg object-cover' />}
              <div>
                {itemName && <p className='font-semibold text-gray-900 line-clamp-1'>{itemName}</p>}
                {itemDetails && <p className='text-xs text-gray-500'>{itemDetails}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className='flex gap-3'>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className='flex-1 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className='flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {isDeleting ? (
              <>
                <svg className='h-5 w-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                </svg>
                Đang xóa...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
