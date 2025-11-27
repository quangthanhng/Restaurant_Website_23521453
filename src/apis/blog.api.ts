import http from '../utils/http'

export const blogApi = {
  getBlogs: () => http.get('/blogs'),
  createBlog: (data: FormData) =>
    http.post('/blogs/create', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  editBlog: (id: string, data: FormData) =>
    http.patch(`/blogs/edit/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteBlog: (id: string) => http.delete(`/blogs/delete/${id}`)
}

export default blogApi
