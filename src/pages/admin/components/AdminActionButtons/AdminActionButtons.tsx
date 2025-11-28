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
    <div
      className={`flex gap-2 items-center ${className} flex-col xs:flex-row w-full xs:w-auto`}
    >
      {showEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg bg-savoria-gold px-3 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-amber-200 w-full xs:w-auto"
        >
          {editLabel}
        </button>
      )}
      {showDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabledDelete}
          className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50 w-full xs:w-auto"
        >
          {deleteLabel}
        </button>
      )}
      {showAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-savoria-gold px-3 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-amber-200 w-full xs:w-auto"
        >
          {addLabel}
        </button>
      )}
    </div>
  )
}

export default AdminActionButtons
