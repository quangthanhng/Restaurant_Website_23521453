import React from 'react'

export type AdminActionButtonsProps = {
  onEdit?: () => void
  onDelete?: () => void
  onAdd?: () => void
  editLabel?: React.ReactNode
  deleteLabel?: React.ReactNode
  addLabel?: React.ReactNode
  disabledDelete?: boolean
  showEdit?: boolean
  showDelete?: boolean
  showAdd?: boolean
  className?: string
}

/**
 * Dùng cho các trang admin: Product, Discount, Table, Category
 * Tùy chọn hiển thị nút Sửa, Xóa, Thêm
 */
const AdminActionButtons: React.FC<AdminActionButtonsProps> = ({
  onEdit,
  onDelete,
  onAdd,
  editLabel = 'Sửa',
  deleteLabel = 'Xóa',
  addLabel = 'Thêm',
  disabledDelete = false,
  showEdit = true,
  showDelete = true,
  showAdd = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg bg-savoria-gold px-3 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-amber-200"
        >
          {editLabel}
        </button>
      )}
      {showDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabledDelete}
          className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          {deleteLabel}
        </button>
      )}
      {showAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-savoria-gold px-3 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-amber-200"
        >
          {addLabel}
        </button>
      )}
    </div>
  )
}

export default AdminActionButtons
