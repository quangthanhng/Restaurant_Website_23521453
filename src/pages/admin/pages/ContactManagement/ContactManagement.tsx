import { useState, useRef } from 'react'
import CommentModal from './CommentModal'
import { createPortal } from 'react-dom'
import AdminActionButtons from '../../components/AdminActionButtons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import contactApi from '../../../../apis/contact.api'
import { useToast } from '../../../../components/Toast'

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
  const [dropdownInfo, setDropdownInfo] = useState<{ id: string, rect: DOMRect } | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)

  // Lấy danh sách liên hệ
  const { data, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactApi.getContacts,
    select: (res: { data: { metadata: Contact[] } }) => res.data.metadata
  })
  const contacts: Contact[] = data || []

  // Mutation cập nhật trạng thái
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      contactApi.updateContactStatus(id, { status }),
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
    },
    onError: () => toast.error('Lỗi khi xóa liên hệ!')
  })


  // Xử lý xóa
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="p-2 sm:p-4">
      <h2 className="text-xl sm:text-3xl font-bold text-savoria-gold mb-6">Quản lý liên hệ</h2>
      {/* Table view for desktop */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl hidden sm:block">
        <table ref={tableRef} className="min-w-[700px] w-full text-neutral-300 text-sm sm:text-base">
          <thead>
            <tr className="bg-neutral-900 text-savoria-gold text-sm sm:text-lg">
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold">Tên</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold">Email</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold">Nội dung</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold text-center">Trạng thái</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold">Ngày gửi</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8">Đang tải...</td></tr>
            ) : contacts.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-neutral-400">Không có liên hệ nào</td></tr>
            ) : contacts.map((contact) => (
              <tr key={contact._id} className="border-b border-neutral-800 hover:bg-neutral-900 transition-colors">
                <td className="py-2 px-2 sm:px-4 font-semibold text-amber-50">{contact.name}</td>
                <td className="py-2 px-2 sm:px-4 text-blue-400">{contact.email}</td>
                <td className="py-2 px-2 sm:px-4 text-neutral-300 max-w-[200px] truncate">{contact.message}</td>
                <td className="py-2 px-2 sm:px-4 text-center">
                  <div className="relative inline-block">
                    <button
                      className={`inline-flex justify-center items-center min-w-[90px] px-2 py-1 rounded-full text-xs font-bold border transition-colors ${contact.status === 'Pending' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40' : contact.status === 'Resolved' ? 'bg-green-600/20 text-green-400 border-green-600/40' : 'bg-red-600/20 text-red-400 border-red-600/40'}`}
                      onClick={e => {
                        if (dropdownInfo && dropdownInfo.id === contact._id) {
                          setDropdownInfo(null)
                        } else {
                          const rect = (e.target as HTMLElement).getBoundingClientRect()
                          setDropdownInfo({ id: contact._id, rect })
                          setStatusValue(contact.status)
                        }
                      }}
                      type="button"
                    >
                      {contact.status}
                      <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </td>
                <td className="py-2 px-2 sm:px-4 text-neutral-400 text-xs sm:text-base">{new Date(contact.createdAt).toLocaleString()}</td>
                <td className="py-2 px-2 sm:px-4 text-center">
                  <AdminActionButtons
                    onEdit={() => setViewingComment(contact._id)}
                    onDelete={() => handleDelete(contact._id)}
                    editLabel="Xem bình luận"
                    deleteLabel="Xóa"
                    showAdd={false}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for mobile */}
      <div className="flex flex-col gap-4 sm:hidden px-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 32px)' }}>
        {isLoading ? (
          <div className="text-center py-8 text-neutral-400">Đang tải...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">Không có liên hệ nào</div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact._id}
              className="rounded-2xl border border-neutral-800 bg-neutral-950 shadow-md p-4 flex flex-col gap-3 max-w-[420px] mx-auto w-full min-h-[120px]"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-neutral-400">Tên</span>
                <span className="font-semibold text-amber-50 text-[17px] leading-tight">{contact.name}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-neutral-400">Email</span>
                <span className="text-blue-400 break-all text-[15px]">{contact.email}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-neutral-400">Nội dung</span>
                <span className="text-neutral-300 break-words text-[15px]">{contact.message}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-neutral-400">Trạng thái</span>
                <button
                  className={`inline-flex justify-center items-center min-w-[90px] px-2 py-1 rounded-full text-xs font-bold border transition-colors ${contact.status === 'Pending' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40' : contact.status === 'Resolved' ? 'bg-green-600/20 text-green-400 border-green-600/40' : 'bg-red-600/20 text-red-400 border-red-600/40'}`}
                  onClick={e => {
                    if (dropdownInfo && dropdownInfo.id === contact._id) {
                      setDropdownInfo(null)
                    } else {
                      const rect = (e.target as HTMLElement).getBoundingClientRect()
                      setDropdownInfo({ id: contact._id, rect })
                      setStatusValue(contact.status)
                    }
                  }}
                  type="button"
                >
                  {contact.status}
                  <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-neutral-400">Ngày gửi</span>
                <span className="text-neutral-400 text-xs">{new Date(contact.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-2 mt-3">
                <AdminActionButtons
                  onEdit={() => setViewingComment(contact._id)}
                  onDelete={() => handleDelete(contact._id)}
                  editLabel="Xem bình luận"
                  deleteLabel="Xóa"
                  showAdd={false}
                />
              </div>
            </div>
          ))
        )}
      </div>
      {/* Portal dropdown trạng thái */}
      {dropdownInfo && (() => {
        const { id, rect } = dropdownInfo
        return createPortal(
          <div
            className="fixed z-9999 w-32 rounded-lg bg-neutral-900 border border-neutral-700 shadow-2xl py-2"
            style={{
              top: rect.bottom + 4,
              left: rect.left,
              minWidth: 120
            }}
          >
            <button
              className={`block w-full text-left px-4 py-2 text-xs font-bold rounded-t-lg ${statusValue === 'Pending' ? 'bg-yellow-600/20 text-yellow-400' : 'text-neutral-300 hover:bg-neutral-800'}`}
              onClick={() => { setStatusValue('Pending'); updateStatusMutation.mutate({ id, status: 'Pending' }); setDropdownInfo(null); }}
              disabled={contacts.find(c => c._id === id)?.status === 'Pending' || updateStatusMutation.isPending}
            >Pending</button>
            <button
              className={`block w-full text-left px-4 py-2 text-xs font-bold rounded-b-lg ${statusValue === 'Resolved' ? 'bg-green-600/20 text-green-400' : 'text-neutral-300 hover:bg-neutral-800'}`}
              onClick={() => { setStatusValue('Resolved'); updateStatusMutation.mutate({ id, status: 'Resolved' }); setDropdownInfo(null); }}
              disabled={contacts.find(c => c._id === id)?.status === 'Resolved' || updateStatusMutation.isPending}
            >Resolved</button>
          </div>,
          document.body
        )
      })()}

      {/* Popup xem bình luận */}
      <CommentModal
        open={!!viewingComment}
        onClose={() => setViewingComment(null)}
        content={viewingComment ? (contacts.find(c => c._id === viewingComment)?.message || '') : ''}
      />
    </div>
  )
}
