import { useState, useRef } from 'react'
import CommentModal from './CommentModal'
import { createPortal } from 'react-dom'
import AdminActionButtons from '../../components/AdminActionButtons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import contactApi from '../../../../apis/contact.api'
import { useToast } from '../../../../components/Toast'
import DeleteConfirmModal from '../../../../components/DeleteConfirmModal/DeleteConfirmModal'

interface Contact {
  _id: string
  name: string
  email: string
  message: string
  status: string
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export default function ContactManagement() {
  const queryClient = useQueryClient()
  const toast = useToast()
  // Đã thay bằng dropdownInfo
  const [statusValue, setStatusValue] = useState<string>('')
  const [viewingComment, setViewingComment] = useState<string | null>(null)
  const [dropdownInfo, setDropdownInfo] = useState<{ id: string; rect: DOMRect } | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)

  // Lấy danh sách liên hệ
  const { data, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactApi.getContacts,
    select: (res: { data: { metadata: Contact[] } }) => res.data.metadata
  })
  const contacts: Contact[] = data || []

  // Mutation cập nhật trạng thái
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => contactApi.updateContactStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Cập nhật trạng thái thành công!')
    },
    onError: () => toast.error('Lỗi khi cập nhật trạng thái!')
  })

  // Mutation xóa liên hệ
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Xóa liên hệ thành công!')
      closeDeleteModal()
    },
    onError: () => toast.error('Lỗi khi xóa liên hệ!')
  })

  // Xử lý xóa
  const openDeleteModal = (contact: Contact) => {
    setContactToDelete(contact)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setContactToDelete(null)
    setDeleteModalOpen(false)
  }

  const confirmDelete = () => {
    if (contactToDelete) {
      deleteMutation.mutate(contactToDelete._id)
    }
  }

  return (
    <div className='p-2 sm:p-4'>
      <h2 className='text-xl sm:text-3xl font-bold text-amber-600 mb-6'>Quản lý liên hệ</h2>
      {/* Table view for desktop */}
      <div className='overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-xl hidden sm:block'>
        <table ref={tableRef} className='min-w-[700px] w-full text-gray-600 text-sm sm:text-base'>
          <thead>
            <tr className='bg-gray-50 text-amber-600 text-sm sm:text-lg'>
              <th className='py-2 px-2 sm:py-3 sm:px-4 font-semibold'>Tên</th>
              <th className='py-2 px-2 sm:py-3 sm:px-4 font-semibold'>Email</th>
              <th className='py-2 px-2 sm:py-3 sm:px-4 font-semibold'>Nội dung</th>
              <th className='py-2 px-2 sm:py-3 sm:px-4 font-semibold text-center'>Trạng thái</th>
              <th className='py-2 px-2 sm:py-3 sm:px-4 font-semibold'>Ngày gửi</th>
              <th className='py-2 px-2 sm:py-3 sm:px-4 font-semibold text-center'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className='text-center py-8'>
                  Đang tải...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className='text-center py-8 text-gray-500'>
                  Không có liên hệ nào
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact._id} className='border-b border-gray-200 hover:bg-gray-50 transition-colors'>
                  <td className='py-2 px-2 sm:px-4 font-semibold text-gray-900'>{contact.name}</td>
                  <td className='py-2 px-2 sm:px-4 text-blue-400'>{contact.email}</td>
                  <td className='py-2 px-2 sm:px-4 text-gray-600 max-w-[200px] truncate'>{contact.message}</td>
                  <td className='py-2 px-2 sm:px-4 text-center'>
                    <div className='relative inline-block'>
                      <button
                        className={`inline-flex justify-center items-center min-w-[90px] px-2 py-1 rounded-full text-xs font-bold border transition-colors ${contact.status === 'Pending' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40' : contact.status === 'Resolved' ? 'bg-green-600/20 text-green-400 border-green-600/40' : 'bg-amber-600/20 text-amber-400 border-amber-600/40'}`}
                        onClick={(e) => {
                          if (dropdownInfo && dropdownInfo.id === contact._id) {
                            setDropdownInfo(null)
                          } else {
                            const rect = (e.target as HTMLElement).getBoundingClientRect()
                            setDropdownInfo({ id: contact._id, rect })
                            setStatusValue(contact.status)
                          }
                        }}
                        type='button'
                      >
                        {contact.status}
                        <svg className='ml-1 w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className='py-2 px-2 sm:px-4 text-gray-500 text-xs sm:text-base'>
                    {new Date(contact.createdAt).toLocaleString()}
                  </td>
                  <td className='py-2 px-2 sm:px-4 text-center'>
                    <AdminActionButtons
                      onEdit={() => setViewingComment(contact._id)}
                      onDelete={() => openDeleteModal(contact)}
                      editLabel='Xem bình luận'
                      deleteLabel='Xóa'
                      showAdd={false}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile */}
      <div className='flex flex-col gap-4 sm:hidden px-2 overflow-y-auto' style={{ maxHeight: 'calc(100vh - 32px)' }}>
        {isLoading ? (
          <div className='text-center py-8 text-gray-500'>Đang tải...</div>
        ) : contacts.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>Không có liên hệ nào</div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact._id}
              className='rounded-2xl border border-gray-100 bg-white shadow-md p-4 flex flex-col gap-3 max-w-[420px] mx-auto w-full min-h-[120px]'
            >
              <div className='flex flex-col gap-0.5'>
                <span className='text-xs text-gray-500'>Tên</span>
                <span className='font-semibold text-gray-900 text-[17px] leading-tight'>{contact.name}</span>
              </div>
              <div className='flex flex-col gap-0.5'>
                <span className='text-xs text-gray-500'>Email</span>
                <span className='text-blue-400 break-all text-[15px]'>{contact.email}</span>
              </div>
              <div className='flex flex-col gap-0.5'>
                <span className='text-xs text-gray-500'>Nội dung</span>
                <span className='text-gray-600 break-word text-[15px]'>{contact.message}</span>
              </div>
              <div className='flex flex-col gap-0.5'>
                <span className='text-xs text-gray-500'>Trạng thái</span>
                <button
                  className={`inline-flex justify-center items-center min-w-[90px] px-2 py-1 rounded-full text-xs font-bold border transition-colors ${contact.status === 'Pending' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40' : contact.status === 'Resolved' ? 'bg-green-600/20 text-green-400 border-green-600/40' : 'bg-amber-600/20 text-amber-400 border-amber-600/40'}`}
                  onClick={(e) => {
                    if (dropdownInfo && dropdownInfo.id === contact._id) {
                      setDropdownInfo(null)
                    } else {
                      const rect = (e.target as HTMLElement).getBoundingClientRect()
                      setDropdownInfo({ id: contact._id, rect })
                      setStatusValue(contact.status)
                    }
                  }}
                  type='button'
                >
                  {contact.status}
                  <svg className='ml-1 w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                  </svg>
                </button>
              </div>
              <div className='flex flex-col gap-0.5'>
                <span className='text-xs text-gray-500'>Ngày gửi</span>
                <span className='text-gray-500 text-xs'>{new Date(contact.createdAt).toLocaleString()}</span>
              </div>
              <div className='flex flex-col gap-2 mt-3'>
                <AdminActionButtons
                  onEdit={() => setViewingComment(contact._id)}
                  onDelete={() => openDeleteModal(contact)}
                  editLabel='Xem bình luận'
                  deleteLabel='Xóa'
                  showAdd={false}
                />
              </div>
            </div>
          ))
        )}
      </div>
      {/* Portal dropdown trạng thái */}
      {dropdownInfo &&
        (() => {
          const { id, rect } = dropdownInfo
          return createPortal(
            <div
              className='fixed z-9999 w-32 rounded-lg bg-gray-50 border border-stone-200 shadow-2xl py-2'
              style={{
                top: rect.bottom + 4,
                left: rect.left,
                minWidth: 120
              }}
            >
              <button
                className={`block w-full text-left px-4 py-2 text-xs font-bold rounded-t-lg ${statusValue === 'Pending' ? 'bg-yellow-600/20 text-yellow-400' : 'text-gray-600 hover:bg-stone-50'}`}
                onClick={() => {
                  setStatusValue('Pending')
                  updateStatusMutation.mutate({ id, status: 'Pending' })
                  setDropdownInfo(null)
                }}
                disabled={contacts.find((c) => c._id === id)?.status === 'Pending' || updateStatusMutation.isPending}
              >
                Pending
              </button>
              <button
                className={`block w-full text-left px-4 py-2 text-xs font-bold rounded-b-lg ${statusValue === 'Resolved' ? 'bg-green-600/20 text-green-400' : 'text-gray-600 hover:bg-stone-50'}`}
                onClick={() => {
                  setStatusValue('Resolved')
                  updateStatusMutation.mutate({ id, status: 'Resolved' })
                  setDropdownInfo(null)
                }}
                disabled={contacts.find((c) => c._id === id)?.status === 'Resolved' || updateStatusMutation.isPending}
              >
                Resolved
              </button>
            </div>,
            document.body
          )
        })()}

      {/* Popup xem bình luận */}
      <CommentModal
        open={!!viewingComment}
        onClose={() => setViewingComment(null)}
        content={viewingComment ? contacts.find((c) => c._id === viewingComment)?.message || '' : ''}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title='Xác nhận xóa liên hệ'
        message='Liên hệ này sẽ bị xóa vĩnh viễn'
        itemName={contactToDelete?.name}
        itemDetails={contactToDelete ? `Email: ${contactToDelete.email}` : undefined}
        confirmText='Xóa liên hệ'
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
