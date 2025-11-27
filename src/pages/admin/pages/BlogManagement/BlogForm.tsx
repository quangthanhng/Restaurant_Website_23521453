import { useState } from 'react';
import blogApi from '../../../../apis/blog.api';
import { useToast } from '../../../../components/Toast';

interface BlogFormProps {
  blog: {
    _id: string;
    title: string;
    image: string;
    content: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BlogForm({ blog, onClose, onSuccess }: BlogFormProps) {
  const [title, setTitle] = useState(blog?.title || '');
  const [content, setContent] = useState(blog?.content || '');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);
    try {
      if (blog) {
        await blogApi.editBlog(blog._id, formData);
        toast.success('Cập nhật blog thành công!');
      } else {
        await blogApi.createBlog(formData);
        toast.success('Tạo blog mới thành công!');
      }
      onSuccess();
    } catch {
      toast.error('Lỗi khi lưu blog!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form
        className="w-full max-w-md rounded-2xl border border-savoria-gold bg-neutral-900/95 p-4 sm:p-8 shadow-2xl relative"
        onSubmit={handleSubmit}
      >
        <h3 className="mb-4 sm:mb-6 text-lg sm:text-2xl font-serif font-bold text-savoria-gold tracking-logo text-center drop-shadow">{blog ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
        <div className="mb-3 sm:mb-4">
          <label className="mb-1 block font-semibold text-savoria-gold text-sm">Tiêu đề bài viết</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 sm:px-4 sm:py-2 text-white text-sm placeholder:text-neutral-600 focus:border-savoria-gold focus:outline-none transition-all"
            required
            placeholder="Nhập tiêu đề bài viết"
          />
        </div>
        <div className="mb-3 sm:mb-4">
          <label className="mb-1 block font-semibold text-savoria-gold text-sm">Nội dung</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 sm:px-4 sm:py-2 text-white text-sm placeholder:text-neutral-600 focus:border-savoria-gold focus:outline-none transition-all min-h-[100px]"
            required
            placeholder="Nhập nội dung bài viết"
          />
        </div>
        <div className="mb-4 sm:mb-6">
          <label className="mb-1 block font-semibold text-savoria-gold text-sm">Ảnh đại diện</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 sm:px-4 sm:py-2 text-white text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-savoria-gold file:px-4 file:py-2 file:text-neutral-900 hover:file:bg-neutral-900 hover:file:text-savoria-gold focus:border-savoria-gold focus:outline-none transition-all"
          />
          {blog?.image && !image && (
            <img src={blog.image} alt="Ảnh blog" className="w-16 h-16 sm:w-20 sm:h-20 mt-3 object-cover rounded-lg border border-neutral-800 shadow" />
          )}
        </div>
        <div className="flex justify-end gap-2 sm:gap-3 mt-6">
          <button
            type="button"
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-neutral-300 font-semibold shadow transition-all hover:bg-neutral-900 hover:text-savoria-gold text-sm"
            onClick={onClose}
            disabled={loading}
          >Hủy</button>
          <button
            type="submit"
            className="rounded-lg border border-savoria-gold bg-savoria-gold px-4 py-2 text-neutral-900 font-semibold shadow transition-all hover:bg-neutral-900 hover:text-savoria-gold text-sm"
            disabled={loading}
          >{loading ? 'Đang lưu...' : blog ? 'Cập nhật' : 'Thêm mới'}</button>
        </div>
      </form>
    </div>
  );
}
