import { useEffect, useState } from 'react';
import blogApi from '../../../../apis/blog.api';
import { useToast } from '../../../../components/Toast';
import AdminActionButtons from '../../components/AdminActionButtons/AdminActionButtons';
import BlogEditorModal from './BlogEditorModal';

interface Blog {
  _id: string;
  title: string;
  image: string;
  content: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const toast = useToast();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await blogApi.getBlogs();
      setBlogs(res.data.metadata || []);
    } catch {
      toast.error('Lỗi khi tải danh sách blog!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, []);

  const handleOpenModal = (blog?: Blog) => {
    setEditingBlog(blog || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBlog(null);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa blog này?')) return;
    try {
      await blogApi.deleteBlog(id);
      toast.success('Xóa blog thành công!');
      fetchBlogs();
    } catch {
      toast.error('Lỗi khi xóa blog!');
    }
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-3xl font-serif font-bold text-savoria-gold tracking-logo drop-shadow-lg">Quản lý bài viết</h2>
        <AdminActionButtons
          showEdit={false}
          showDelete={false}
          showAdd={true}
          onAdd={() => handleOpenModal()}
          addLabel={
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline text-xs sm:text-sm">Thêm blog</span>
            </span>
          }
          className="w-auto!"
        />
      </div>
      {/* Table for desktop/tablet */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl hidden sm:block">
        <table className="min-w-[700px] w-full text-neutral-300 text-sm sm:text-base">
          <thead>
            <tr className="bg-neutral-900 text-savoria-gold text-sm sm:text-lg">
              <th className="py-3 px-4 font-semibold text-left">Tiêu đề</th>
              <th className="py-3 px-4 font-semibold text-center">Ảnh</th>
              <th className="py-3 px-4 font-semibold text-left">Nội dung</th>
              <th className="py-3 px-4 font-semibold text-center">Ngày tạo</th>
              <th className="py-3 px-4 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-neutral-400">Đang tải...</td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-neutral-400">Chưa có blog nào</td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog._id} className="border-b border-neutral-800 hover:bg-neutral-900 transition-colors align-middle">
                  <td className="py-3 px-4 font-semibold text-savoria-gold text-base sm:text-lg max-w-[220px] truncate align-middle text-left">{blog.title}</td>
                  <td className="py-3 px-4 align-middle text-center">
                    <div className="flex justify-center">
                      <img src={blog.image} alt={blog.title} className="w-14 h-14 object-cover rounded-xl border border-neutral-800 shadow bg-neutral-900" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-400 max-w-[320px] truncate align-middle text-left" dangerouslySetInnerHTML={{ __html: blog.content }} />
                  <td className="py-3 px-4 text-neutral-400 text-xs sm:text-base align-middle text-center whitespace-nowrap">{new Date(blog.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 align-middle text-center">
                    <div className="flex justify-center gap-2">
                      <AdminActionButtons
                        onEdit={() => handleOpenModal(blog)}
                        onDelete={() => handleDelete(blog._id)}
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
      <div className="sm:hidden flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-8 text-neutral-400">Đang tải...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">Chưa có blog nào</div>
        ) : (
          blogs.map((blog) => (
            <div key={blog._id} className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-950 shadow p-3 gap-2">
              <img src={blog.image} alt={blog.title} className="w-16 h-16 object-cover rounded-lg border border-neutral-800 shadow self-center" />
              <div className="font-bold text-savoria-gold text-base mt-2">{blog.title}</div>
              <div className="text-xs text-neutral-400 mt-1" dangerouslySetInnerHTML={{ __html: blog.content }} />
              <div className="text-xs text-neutral-400 mt-1">{new Date(blog.createdAt).toLocaleString()}</div>
              <div className="flex gap-2 mt-2">
                <AdminActionButtons
                  onEdit={() => handleOpenModal(blog)}
                  onDelete={() => handleDelete(blog._id)}
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
    </div>
  );
}

export default BlogManagement;

// BlogForm sẽ được tạo ở file BlogForm.tsx cùng thư mục
