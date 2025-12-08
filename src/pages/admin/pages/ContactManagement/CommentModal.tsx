import React from 'react'

interface CommentModalProps {
  open: boolean
  onClose: () => void
  content: string
}

const CommentModal: React.FC<CommentModalProps> = ({ open, onClose, content }) => {
  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-gray-50 rounded-xl shadow-2xl p-6 max-w-lg w-full relative'>
        <button
          className='absolute top-2 right-2 text-gray-500 hover:text-amber-600 text-xl font-bold'
          onClick={onClose}
          aria-label='Đóng'
        >
          ×
        </button>
        <h3 className='text-lg font-bold mb-4 text-amber-600'>Nội dung bình luận</h3>
        <div className='whitespace-pre-line text-gray-700 text-base min-h-20'>{content}</div>
      </div>
    </div>
  )
}

export default CommentModal
