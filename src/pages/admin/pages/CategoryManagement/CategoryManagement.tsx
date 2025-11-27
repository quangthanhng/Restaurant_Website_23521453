import React, { useEffect, useState } from 'react';
import categoryApi from '../../../../apis/category.api';
import CategoryForm from './CategoryForm';
import AdminActionButtons from '../../../../components/AdminActionButtons';
// import Modal, Button, Input, etc. từ thư viện UI bạn đang dùng (AntD, MUI, hoặc tự custom)

export interface Category {
  _id: string;
  name: string;
  description: string;
  deleted: boolean;
  status: string;
  images: string;
  createdAt: string;
  updatedAt: string;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  // const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'active',
    images: undefined as File | undefined,
  });

  const fetchCategories = async () => {
    // setLoading(true);
    try {
      const res = await categoryApi.getCategories();
      setCategories(res.data.metadata || []);
    } catch {
      // handle error
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditCategory(category);
      setForm({
        name: category.name,
        description: category.description,
        status: category.status,
        images: undefined,
      });
    } else {
      setEditCategory(null);
      setForm({ name: '', description: '', status: 'active', images: undefined });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditCategory(null);
    setForm({ name: '', description: '', status: 'active', images: undefined });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, images: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('status', form.status);
    if (form.images) formData.append('images', form.images);
    try {
      if (editCategory) {
        await categoryApi.updateCategory(editCategory._id, formData);
      } else {
        await categoryApi.createCategory(formData);
      }
      fetchCategories();
      handleCloseModal();
    } catch {
      // handle error
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await categoryApi.deleteCategory(id);
      fetchCategories();
    } catch {
      // handle error
    }
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-3xl font-serif font-bold text-savoria-gold tracking-logo drop-shadow-lg">Quản lý danh mục</h2>
        <AdminActionButtons
          showEdit={false}
          showDelete={false}
          showAdd={true}
          onAdd={() => handleOpenModal()}
          addLabel={<span className="flex items-center gap-2"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg><span className="hidden xs:inline">Thêm danh mục</span></span>}
        />
      </div>
      {/* Table for desktop/tablet */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl hidden sm:block">
        <table className="min-w-[600px] w-full text-neutral-300 text-sm sm:text-base">
          <thead>
            <tr className="bg-neutral-900 text-savoria-gold text-sm sm:text-lg">
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold">Ảnh</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold">Tên</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold">Mô tả</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold">Trạng thái</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold">Ngày tạo</th>
              <th className="py-2 px-2 sm:py-3 sm:px-4 font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-b border-neutral-800 hover:bg-neutral-900 transition-colors">
                <td className="py-2 px-2 sm:px-4">
                  <img src={cat.images} alt={cat.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-neutral-800 shadow" />
                </td>
                <td className="py-2 px-2 sm:px-4 font-semibold text-savoria-gold text-base sm:text-lg">{cat.name}</td>
                <td className="py-2 px-2 sm:px-4 text-neutral-400 max-w-[120px] sm:max-w-xs truncate">{cat.description}</td>
                <td className="py-2 px-2 sm:px-4">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${cat.status === 'active' ? 'bg-green-600/20 text-green-400 border border-green-600/40' : 'bg-neutral-700/40 text-neutral-400 border border-neutral-700'}`}>{cat.status === 'active' ? 'Hoạt động' : 'Ẩn'}</span>
                </td>
                <td className="py-2 px-2 sm:px-4 text-neutral-400 text-xs sm:text-base">{new Date(cat.createdAt).toLocaleString()}</td>
                <td className="py-2 px-2 sm:px-4 flex gap-1 sm:gap-2">
                  <AdminActionButtons
                    onEdit={() => handleOpenModal(cat)}
                    onDelete={() => handleDelete(cat._id)}
                    editLabel='Sửa'
                    deleteLabel='Xóa'
                    showAdd={false}
                  />
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-neutral-400">Không có danh mục nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card list for mobile */}
      <div className="block sm:hidden space-y-4">
        {categories.length === 0 && (
          <div className="text-center py-8 text-neutral-400">Không có danh mục nào</div>
        )}
        {categories.map((cat) => (
          <div key={cat._id} className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-950 shadow p-3 gap-2">
            <div className="flex gap-3 items-center">
              <img src={cat.images} alt={cat.name} className="w-16 h-16 object-cover rounded-lg border border-neutral-800 shadow" />
              <div className="flex-1">
                <div className="font-bold text-savoria-gold text-base">{cat.name}</div>
                <div className="text-xs text-neutral-400 mt-1">{cat.description}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${cat.status === 'active' ? 'bg-green-600/20 text-green-400 border border-green-600/40' : 'bg-neutral-700/40 text-neutral-400 border border-neutral-700'}`}>{cat.status === 'active' ? 'Hoạt động' : 'Ẩn'}</span>
              <span className="text-xs text-neutral-400">{new Date(cat.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                className="flex-1 rounded-lg border border-savoria-gold bg-neutral-900 px-2 py-1 text-savoria-gold font-semibold shadow transition-all hover:bg-savoria-gold hover:text-neutral-900 text-xs"
                onClick={() => handleOpenModal(cat)}
              >Sửa</button>
              <button
                className="flex-1 rounded-lg border border-red-500 bg-neutral-900 px-2 py-1 text-red-400 font-semibold shadow transition-all hover:bg-red-500 hover:text-white text-xs"
                onClick={() => handleDelete(cat._id)}
              >Xóa</button>
            </div>
          </div>
        ))}
      </div>
      {/* Modal Thêm/Sửa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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
    </div>
  );
};

export default CategoryManagement;
