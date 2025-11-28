import { useState } from 'react'
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [statusValue, setStatusValue] = useState<string>('')

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
      setEditingId(null)
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

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = (id: string, currentStatus: string) => {
    setEditingId(id)
    setStatusValue(currentStatus)
  }
  const handleSaveStatus = (id: string) => {
    updateStatusMutation.mutate({ id, status: statusValue })
  }

  // Xử lý xóa
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="p-2 sm:p-4">
      <h2 className="text-xl sm:text-3xl font-bold text-savoria-gold mb-6">Quản lý liên hệ</h2>
      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl">
        <table className="min-w-[700px] w-full text-neutral-300 text-sm sm:text-base">
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
                  {editingId === contact._id ? (
                    <div className="flex items-center gap-2 justify-center">
                      <select
                        value={statusValue}
                        onChange={e => setStatusValue(e.target.value)}
                        className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-amber-50"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <button
                        className="px-2 py-1 rounded bg-green-600 text-white text-xs font-bold"
                        onClick={() => handleSaveStatus(contact._id)}
                        disabled={updateStatusMutation.isPending}
                      >Lưu</button>
                      <button
                        className="px-2 py-1 rounded bg-neutral-700 text-white text-xs"
                        onClick={() => setEditingId(null)}
                      >Hủy</button>
                    </div>
                  ) : (
                    <span className={`inline-flex justify-center items-center min-w-[90px] px-2 py-1 rounded-full text-xs font-bold ${contact.status === 'Pending' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/40' : contact.status === 'Resolved' ? 'bg-green-600/20 text-green-400 border border-green-600/40' : 'bg-red-600/20 text-red-400 border border-red-600/40'}`}>
                      {contact.status}
                    </span>
                  )}
                </td>
                <td className="py-2 px-2 sm:px-4 text-neutral-400 text-xs sm:text-base">{new Date(contact.createdAt).toLocaleString()}</td>
                <td className="py-2 px-2 sm:px-4 text-center">
                  <button
                    className="px-3 py-1 rounded bg-savoria-gold text-neutral-900 text-xs font-bold mr-2"
                    onClick={() => handleUpdateStatus(contact._id, contact.status)}
                  >Sửa trạng thái</button>
                  <button
                    className="px-3 py-1 rounded bg-red-500 text-white text-xs font-bold"
                    onClick={() => handleDelete(contact._id)}
                    disabled={deleteMutation.isPending}
                  >Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
