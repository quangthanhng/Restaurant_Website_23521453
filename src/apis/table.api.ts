import http from '../utils/http'
import type { TableListResponse, TableResponse, TableFormData } from '../types/table.type'

const tableApi = {
  // Lấy danh sách bàn
  getTables: () => {
    return http.get<TableListResponse>('/tables')
  },

  // Tạo bàn mới
  createTable: (data: TableFormData) => {
    return http.post<TableResponse>('/tables/create', data)
  },

  // Cập nhật bàn
  updateTable: (id: string, data: TableFormData) => {
    return http.patch<TableResponse>(`/tables/edit/${id}`, data)
  },

  // Xóa bàn
  deleteTable: (id: string) => {
    return http.delete<TableResponse>(`/tables/delete/${id}`)
  },

  // Thay đổi trạng thái bàn - thử gọi với body nếu path param không hoạt động
  changeStatus: (id: string, status: 'available' | 'occupied' | 'reserved') => {
    return http.patch<TableResponse>(`/tables/change-status/${id}`, { status })
  }
}

export default tableApi
