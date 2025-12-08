import React, { useEffect, useState, useCallback } from 'react'
import categoryApi from '../../../../apis/category.api'
import { useToast } from '../../../../components/Toast'
import CategoryForm from './CategoryForm'
import DeleteConfirmModal from '../../../../components/DeleteConfirmModal/DeleteConfirmModal'
// import Modal, Button, Input, etc. từ thư viện UI bạn đang dùng (AntD, MUI, hoặc tự custom)

export interface Category {
  _id: string
  name: string
  description: string
  deleted: boolean
  status: string
  images: string
  createdAt: string
  updatedAt: string
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const toast = useToast()
  // const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'active',
    images: undefined as File | undefined
  })

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.getCategories()
      setCategories(res.data.metadata || [])
    } catch {
      toast.error('Lỗi khi tải danh mục!')
    }
  }, [toast])

  useEffect(() => {
    ;(async () => {
      await fetchCategories()
    })()
  }, [fetchCategories])

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditCategory(category)
      setForm({
        name: category.name,
        description: category.description,
        status: category.status,
        images: undefined
      })
    } else {
      setEditCategory(null)
      setForm({ name: '', description: '', status: 'active', images: undefined })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditCategory(null)
    setForm({ name: '', description: '', status: 'active', images: undefined })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, images: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('status', form.status)
    if (form.images) formData.append('images', form.images)
    try {
      if (editCategory) {
        await categoryApi.updateCategory(editCategory._id, formData)
        toast.success('Cập nhật danh mục thành công!')
      } else {
        await categoryApi.createCategory(formData)
        toast.success('Thêm danh mục thành công!')
      }
      fetchCategories()
      handleCloseModal()
    } catch {
      toast.error('Lỗi khi lưu danh mục!')
    }
  }

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setCategoryToDelete(null)
    setDeleteModalOpen(false)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return
    setIsDeleting(true)
    try {
      await categoryApi.deleteCategory(categoryToDelete._id)
      toast.success('Xóa danh mục thành công!')
      fetchCategories()
      closeDeleteModal()
    } catch {
      toast.error('Lỗi khi xóa danh mục!')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8'>
      {/* Header Section */}
      <div className='mb-6 sm:mb-8'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
          <div>
            <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent'>
              Quản lý danh mục
            </h2>
            <p className='text-gray-500 mt-1 text-sm sm:text-base'>Quản lý tất cả danh mục món ăn của nhà hàng</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className='flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 font-semibold text-white shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30'
          >
            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' strokeWidth='2'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
            </svg>
            <span>Thêm danh mục</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8'>
        <div className='rounded-xl bg-white p-4 shadow-sm border border-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-amber-100 p-2'>
              <svg className='h-5 w-5 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
            </div>
            <div>
              <p className='text-xs text-gray-500'>Tổng danh mục</p>
              <p className='text-xl font-bold text-gray-900'>{categories.length}</p>
            </div>
          </div>
        </div>
        <div className='rounded-xl bg-white p-4 shadow-sm border border-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-green-100 p-2'>
              <svg className='h-5 w-5 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <div>
              <p className='text-xs text-gray-500'>Đang hoạt động</p>
              <p className='text-xl font-bold text-green-600'>
                {categories.filter((c) => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className='rounded-xl bg-white p-4 shadow-sm border border-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-gray-100 p-2'>
              <svg className='h-5 w-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                />
              </svg>
            </div>
            <div>
              <p className='text-xs text-gray-500'>Đang ẩn</p>
              <p className='text-xl font-bold text-gray-500'>
                {categories.filter((c) => c.status !== 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className='rounded-xl bg-white p-4 shadow-sm border border-gray-100'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-blue-100 p-2'>
              <svg className='h-5 w-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div>
              <p className='text-xs text-gray-500'>Mới nhất</p>
              <p className='text-sm font-semibold text-gray-700 truncate'>
                {categories.length > 0 ? new Date(categories[0]?.createdAt).toLocaleDateString('vi-VN') : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table for desktop/tablet */}
      <div className='rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden hidden sm:block'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'>
                <th className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Ảnh
                </th>
                <th className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Tên danh mục
                </th>
                <th className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Mô tả
                </th>
                <th className='py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Trạng thái
                </th>
                <th className='py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Ngày tạo
                </th>
                <th className='py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {categories.map((cat, index) => (
                <tr
                  key={cat._id}
                  className={`group transition-all duration-200 hover:bg-amber-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  <td className='py-4 px-6'>
                    <div className='relative'>
                      <img
                        src={cat.images}
                        alt={cat.name}
                        className='w-16 h-16 object-cover rounded-xl border-2 border-gray-100 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300'
                      />
                      <div className='absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                    </div>
                  </td>
                  <td className='py-4 px-6'>
                    <p className='font-semibold text-gray-900 group-hover:text-amber-600 transition-colors'>
                      {cat.name}
                    </p>
                  </td>
                  <td className='py-4 px-6'>
                    <p className='text-gray-500 text-sm max-w-xs truncate' title={cat.description}>
                      {cat.description}
                    </p>
                  </td>
                  <td className='py-4 px-6 text-center'>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        cat.status === 'active'
                          ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20'
                          : 'bg-gray-100 text-gray-600 ring-1 ring-gray-600/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${cat.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
                      ></span>
                      {cat.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className='py-4 px-6'>
                    <p className='text-gray-500 text-sm'>{new Date(cat.createdAt).toLocaleDateString('vi-VN')}</p>
                    <p className='text-gray-400 text-xs'>
                      {new Date(cat.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className='py-4 px-6'>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        onClick={() => handleOpenModal(cat)}
                        className='inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-50 text-amber-600 font-medium text-sm border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25'
                      >
                        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                          />
                        </svg>
                        Sửa
                      </button>
                      <button
                        onClick={() => openDeleteModal(cat)}
                        className='inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium text-sm border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25'
                      >
                        <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className='text-center py-16'>
                    <svg
                      className='mx-auto h-12 w-12 text-gray-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='1.5'
                        d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                      />
                    </svg>
                    <p className='mt-4 text-gray-500 font-medium'>Chưa có danh mục nào</p>
                    <p className='text-gray-400 text-sm mt-1'>Bấm nút "Thêm danh mục" để bắt đầu</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card list for mobile */}
      <div className='block sm:hidden space-y-4'>
        {categories.length === 0 && (
          <div className='text-center py-12 rounded-2xl bg-white shadow-sm border border-gray-100'>
            <svg className='mx-auto h-12 w-12 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='1.5'
                d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
              />
            </svg>
            <p className='mt-4 text-gray-500 font-medium'>Chưa có danh mục nào</p>
          </div>
        )}
        {categories.map((cat) => (
          <div
            key={cat._id}
            className='rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow'
          >
            <div className='flex gap-4 p-4'>
              <img
                src={cat.images}
                alt={cat.name}
                className='w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm flex-shrink-0'
              />
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2'>
                  <h3 className='font-semibold text-gray-900 truncate'>{cat.name}</h3>
                  <span
                    className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${cat.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
                    ></span>
                    {cat.status === 'active' ? 'Hoạt động' : 'Đã ẩn'}
                  </span>
                </div>
                <p className='text-gray-500 text-sm mt-1 line-clamp-2'>{cat.description}</p>
                <p className='text-gray-400 text-xs mt-2'>
                  <svg className='inline h-3 w-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  {new Date(cat.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <div className='flex border-t border-gray-100'>
              <button
                onClick={() => handleOpenModal(cat)}
                className='flex-1 flex items-center justify-center gap-2 py-3 text-amber-600 font-medium text-sm hover:bg-amber-50 transition-colors border-r border-gray-100'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
                Sửa
              </button>
              <button
                onClick={() => openDeleteModal(cat)}
                className='flex-1 flex items-center justify-center gap-2 py-3 text-red-500 font-medium text-sm hover:bg-red-50 transition-colors'
              >
                <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm/Sửa */}
      {modalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
          <CategoryForm
            form={form}
            editCategory={editCategory}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title='Xác nhận xóa danh mục'
        message='Danh mục này và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn'
        itemName={categoryToDelete?.name}
        itemImage={categoryToDelete?.images}
        itemDetails={categoryToDelete?.description}
        confirmText='Xóa danh mục'
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default CategoryManagement
