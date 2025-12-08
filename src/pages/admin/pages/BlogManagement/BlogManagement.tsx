import { useEffect, useState } from 'react'
import blogApi from '../../../../apis/blog.api'
import { useToast } from '../../../../components/Toast'
import AdminActionButtons from '../../components/AdminActionButtons/AdminActionButtons'
import BlogEditorModal from './BlogEditorModal'

interface Blog {
  _id: string
  title: string
  image: string
  content: string
  deleted: boolean
  createdAt: string
  updatedAt: string
}

// Helper function to strip HTML and truncate text
const stripHtmlAndTruncate = (html: string, maxLength: number = 100): string => {
  // Tạo một element tạm để parse HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  const text = tempDiv.textContent || tempDiv.innerText || ''
  // Truncate và thêm ... nếu cần
  if (text.length > maxLength) {
    return text.substring(0, maxLength).trim() + '...'
  }
  return text
}

function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const res = await blogApi.getBlogs()
      setBlogs(res.data.metadata || [])
    } catch {
      toast.error('Lỗi khi tải danh sách blog!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
    // eslint-disable-next-line
  }, [])

  const handleOpenModal = (blog?: Blog) => {
    setEditingBlog(blog || null)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingBlog(null)
    setModalOpen(false)
  }

  const openDeleteModal = (blog: Blog) => {
    setBlogToDelete(blog)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setBlogToDelete(null)
    setDeleteModalOpen(false)
  }

  const confirmDelete = async () => {
    if (!blogToDelete) return
    setDeleting(true)
    try {
      await blogApi.deleteBlog(blogToDelete._id)
      toast.success('Xóa blog thành công!')
      fetchBlogs()
      closeDeleteModal()
    } catch {
      toast.error('Lỗi khi xóa blog!')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className='p-2 sm:p-4'>
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6'>
        <h2 className='text-xl sm:text-3xl font-serif font-bold text-amber-600 tracking-logo drop-shadow-lg'>
          Quản lý bài viết
        </h2>
        <AdminActionButtons
          showEdit={false}
          showDelete={false}
          showAdd={true}
          onAdd={() => handleOpenModal()}
          addLabel={
            <span className='flex items-center gap-1'>
              <svg
                className='h-4 w-4 sm:h-5 sm:w-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                strokeWidth='2'
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
              </svg>
              <span className='hidden sm:inline text-xs sm:text-sm'>Thêm blog</span>
            </span>
          }
          className='w-auto!'
        />
      </div>
      {/* Table for desktop/tablet */}
      <div className='overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-xl hidden sm:block'>
        <table className='min-w-[700px] w-full text-gray-600 text-sm sm:text-base'>
          <thead>
            <tr className='bg-gray-50 text-amber-600 text-sm sm:text-lg'>
              <th className='py-3 px-4 font-semibold text-left'>Tiêu đề</th>
              <th className='py-3 px-4 font-semibold text-center'>Ảnh</th>
              <th className='py-3 px-4 font-semibold text-left'>Nội dung</th>
              <th className='py-3 px-4 font-semibold text-center'>Ngày tạo</th>
              <th className='py-3 px-4 font-semibold text-center'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className='text-center py-8 text-gray-500'>
                  Đang tải...
                </td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan={5} className='text-center py-8 text-gray-500'>
                  Chưa có blog nào
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog._id} className='border-b border-gray-200 hover:bg-gray-50 transition-colors align-middle'>
                  <td className='py-3 px-4 font-semibold text-amber-600 text-base sm:text-lg max-w-[220px] truncate align-middle text-left'>
                    {blog.title}
                  </td>
                  <td className='py-3 px-4 align-middle text-center'>
                    <div className='flex justify-center'>
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className='w-14 h-14 object-cover rounded-xl border border-gray-100 shadow bg-gray-50'
                      />
                    </div>
                  </td>
                  <td className='py-3 px-4 text-gray-500 max-w-[320px] align-middle text-left'>
                    <span className='line-clamp-2'>{stripHtmlAndTruncate(blog.content, 120)}</span>
                  </td>
                  <td className='py-3 px-4 text-gray-500 text-xs sm:text-base align-middle text-center whitespace-nowrap'>
                    {new Date(blog.createdAt).toLocaleString()}
                  </td>
                  <td className='py-3 px-4 align-middle text-center'>
                    <div className='flex justify-center gap-2'>
                      <AdminActionButtons
                        onEdit={() => handleOpenModal(blog)}
                        onDelete={() => openDeleteModal(blog)}
                        editLabel='Sửa'
                        deleteLabel='Xóa'
                        showAdd={false}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Card view for mobile */}
      <div className='sm:hidden flex flex-col gap-3'>
        {loading ? (
          <div className='text-center py-8 text-gray-500'>Đang tải...</div>
        ) : blogs.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>Chưa có blog nào</div>
        ) : (
          blogs.map((blog) => (
            <div key={blog._id} className='flex flex-col rounded-xl border border-gray-100 bg-white shadow p-3 gap-2'>
              <img
                src={blog.image}
                alt={blog.title}
                className='w-16 h-16 object-cover rounded-lg border border-gray-100 shadow self-center'
              />
              <div className='font-bold text-amber-600 text-base mt-2'>{blog.title}</div>
              <div className='text-xs text-gray-500 mt-1 line-clamp-3'>{stripHtmlAndTruncate(blog.content, 150)}</div>
              <div className='text-xs text-gray-500 mt-1'>{new Date(blog.createdAt).toLocaleString()}</div>
              <div className='flex gap-2 mt-2'>
                <AdminActionButtons
                  onEdit={() => handleOpenModal(blog)}
                  onDelete={() => openDeleteModal(blog)}
                  editLabel='Sửa'
                  deleteLabel='Xóa'
                  showAdd={false}
                />
              </div>
            </div>
          ))
        )}
      </div>
      {/* Modal Thêm/Sửa Blog */}
      {modalOpen && (
        <BlogEditorModal
          open={modalOpen}
          onClose={handleCloseModal}
          initialTitle={editingBlog?.title || ''}
          initialContent={editingBlog?.content || ''}
          initialImage={editingBlog?.image}
          loading={loading}
          onSubmit={async ({ title, content, image }) => {
            setLoading(true)
            try {
              const formData = new FormData()
              formData.append('title', title)
              formData.append('content', content)
              if (image) formData.append('image', image)
              if (editingBlog) {
                await blogApi.editBlog(editingBlog._id, formData)
                toast.success('Cập nhật blog thành công!')
              } else {
                await blogApi.createBlog(formData)
                toast.success('Tạo blog mới thành công!')
              }
              fetchBlogs()
              handleCloseModal()
            } catch {
              toast.error('Lỗi khi lưu blog!')
            } finally {
              setLoading(false)
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && blogToDelete && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4' onClick={closeDeleteModal}>
          <div className='w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl' onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className='flex items-center gap-4 mb-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
                <svg className='h-6 w-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-900'>Xác nhận xóa bài viết</h3>
                <p className='text-sm text-gray-500'>Hành động này không thể hoàn tác</p>
              </div>
            </div>

            {/* Content */}
            <div className='mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100'>
              <div className='flex items-center gap-3'>
                {blogToDelete.image && (
                  <img
                    src={blogToDelete.image}
                    alt={blogToDelete.title}
                    className='h-14 w-14 rounded-lg object-cover'
                  />
                )}
                <div>
                  <p className='font-semibold text-gray-900 line-clamp-1'>{blogToDelete.title}</p>
                  <p className='text-xs text-gray-500'>Tạo lúc: {new Date(blogToDelete.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className='flex gap-3'>
              <button
                onClick={closeDeleteModal}
                className='flex-1 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50'
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className='flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {deleting ? (
                  <>
                    <svg className='h-5 w-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                      />
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  <>Xóa bài viết</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogManagement

// BlogForm sẽ được tạo ở file BlogForm.tsx cùng thư mục
