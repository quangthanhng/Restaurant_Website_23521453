import http from '../utils/http'

export interface Contact {
  _id: string
  name: string
  email: string
  message: string
  status: string
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ContactListResponse {
  message: string
  statusCode: number
  metadata: Contact[]
}

const contactApi = {
  getContacts: () => http.get<ContactListResponse>('/contacts'),
  updateContactStatus: (id: string, data: { status: string }) => http.patch(`/contacts/edit/${id}`, data),
  deleteContact: (id: string) => http.delete('/contacts/delete', { data: { id } })
}

export default contactApi
