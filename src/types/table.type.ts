// Type cho bàn (Table)
export interface Table {
  _id: string
  tableNumber: number
  maximumCapacity: number
  status: 'available' | 'occupied' | 'reserved'
  position: string
  reserved: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
}

// Response khi lấy danh sách tables
export interface TableListResponse {
  message: string
  statusCode: number
  metadata: Table[]
}

// Response khi tạo/cập nhật table
export interface TableResponse {
  code: number
  message: string
  data: Table
}

// Form data khi tạo/update bàn
export interface TableFormData {
  tableNumber: number
  maximumCapacity: number
  status: 'available' | 'occupied' | 'reserved'
  position: string
}
