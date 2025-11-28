import React from 'react'

interface CommentModalProps {
  open: boolean
  onClose: () => void
  content: string
}

const CommentModal: React.FC<CommentModalProps> = ({ open, onClose, content }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-neutral-900 rounded-xl shadow-2xl p-6 max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-neutral-400 hover:text-savoria-gold text-xl font-bold"
          onClick={onClose}
          aria-label="Đóng"
        >×</button>
        <h3 className="text-lg font-bold mb-4 text-savoria-gold">Nội dung bình luận</h3>
        <div className="whitespace-pre-line text-neutral-200 text-base min-h-20">
          {content}
        </div>
      </div>
    </div>
  )
}

export default CommentModal
