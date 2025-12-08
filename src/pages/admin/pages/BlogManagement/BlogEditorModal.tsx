import { Editor } from '@tinymce/tinymce-react'
import React, { useRef, useState } from 'react'

interface BlogEditorModalProps {
  open: boolean
  onClose: () => void
  initialTitle?: string
  initialContent?: string
  initialImage?: string
  onSubmit: (data: { title: string; content: string; image?: File | null }) => void
  loading?: boolean
}

const BlogEditorModal: React.FC<BlogEditorModalProps> = ({ open, onClose, initialTitle = '', initialContent = '', initialImage, onSubmit, loading }) => {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [image, setImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto">
      <div className="w-full flex items-center justify-center min-h-screen py-8">
        <form
          className="w-full max-w-5xl max-h-[90vh] rounded-2xl border border-amber-500 bg-gray-50/95 p-4 sm:p-8 shadow-2xl relative flex flex-col overflow-y-auto"
          style={{ boxSizing: 'border-box' }}
          onSubmit={e => {
            e.preventDefault()
            onSubmit({ title, content, image })
          }}
        >
          <button
            type="button"
            className="absolute top-4 right-6 text-gray-500 hover:text-amber-600 text-2xl font-bold z-10"
            onClick={onClose}
            aria-label="Đóng"
          >×</button>
          <h3 className="mb-6 text-2xl font-serif font-bold text-amber-600 tracking-logo text-center drop-shadow">{initialTitle ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="mb-1 block font-semibold text-amber-600 text-sm">Tiêu đề bài viết</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 text-base placeholder:text-gray-300 focus:border-amber-500 focus:outline-none transition-all"
                required
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block font-semibold text-amber-600 text-sm">Ảnh đại diện</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={e => setImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-neutral-900 hover:file:bg-amber-200"
              />
              {initialImage && !image && (
                <img src={initialImage} alt="Ảnh đại diện" className="mt-2 max-h-24 rounded-lg border border-stone-200" />
              )}
              {image && (
                <span className="block mt-2 text-green-400 text-xs">Đã chọn: {image.name}</span>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col mb-6 min-h-[300px]">
            <label className="mb-1 block font-semibold text-amber-600 text-sm">Nội dung</label>
            <div className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto">
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                value={content}
                onEditorChange={setContent}
                init={{
                  height: 350,
                  menubar: true,
                  plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                  content_style: 'body { font-family:Inter,sans-serif; font-size:16px; background: #18181b; color: #f3f3f3; }',
                  skin: 'oxide-dark',
                  content_css: 'dark',
                  branding: false
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              className="rounded-lg border border-stone-200 px-6 py-2 text-base font-semibold text-gray-600 hover:bg-stone-50"
              onClick={onClose}
              disabled={loading}
            >Hủy</button>
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-8 py-2 text-base font-bold text-neutral-900 hover:bg-amber-200 disabled:opacity-60"
              disabled={loading}
            >Lưu</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BlogEditorModal
