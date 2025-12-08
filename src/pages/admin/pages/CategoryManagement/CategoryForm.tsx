import React from 'react';

import type { Category } from './CategoryManagement';

interface CategoryFormProps {
  form: {
    name: string;
    description: string;
    status: string;
    images?: File;
  };
  editCategory: Category | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ form, editCategory, onChange, onFileChange, onSubmit, onCancel }) => {
  return (
    <form
      className="w-full max-w-md rounded-2xl border border-amber-500 bg-gray-50/95 p-4 sm:p-8 shadow-2xl"
      onSubmit={onSubmit}
    >
      <h3 className="mb-4 sm:mb-6 text-lg sm:text-2xl font-serif font-bold text-amber-600 tracking-logo text-center drop-shadow">{editCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
      <div className="mb-3 sm:mb-4">
        <label className="mb-1 block font-semibold text-amber-600 text-sm">Tên danh mục</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-2 text-gray-900 text-sm placeholder:text-gray-300 focus:border-amber-500 focus:outline-none transition-all"
          required
          placeholder="Nhập tên danh mục"
        />
      </div>
      <div className="mb-3 sm:mb-4">
        <label className="mb-1 block font-semibold text-amber-600 text-sm">Mô tả</label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-2 text-gray-900 text-sm placeholder:text-gray-300 focus:border-amber-500 focus:outline-none transition-all"
          placeholder="Nhập mô tả"
        />
      </div>
      <div className="mb-3 sm:mb-4">
        <label className="mb-1 block font-semibold text-amber-600 text-sm">Trạng thái</label>
        <select
          name="status"
          value={form.status}
          onChange={onChange}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-2 text-gray-900 text-sm focus:border-amber-500 focus:outline-none transition-all"
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Ẩn</option>
        </select>
      </div>
      <div className="mb-4 sm:mb-6">
        <label className="mb-1 block font-semibold text-amber-600 text-sm">Ảnh</label>
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-2 text-gray-900 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-neutral-900 hover:file:bg-gray-50 hover:file:text-amber-600 focus:border-amber-500 focus:outline-none transition-all"
        />
        {editCategory && editCategory.images && (
          <img src={editCategory.images} alt="preview" className="w-16 h-16 sm:w-20 sm:h-20 mt-3 object-cover rounded-lg border border-gray-200 shadow" />
        )}
      </div>
      <div className="flex justify-end gap-2 sm:gap-3">
        <button
          type="button"
          className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-gray-600 font-semibold shadow transition-all hover:bg-gray-50 hover:text-amber-600 text-sm"
          onClick={onCancel}
        >Hủy</button>
        <button
          type="submit"
          className="rounded-lg border border-amber-500 bg-amber-500 px-4 py-2 text-neutral-900 font-semibold shadow transition-all hover:bg-gray-50 hover:text-amber-600 text-sm"
        >{editCategory ? 'Cập nhật' : 'Thêm mới'}</button>
      </div>
    </form>
  );
};

export default CategoryForm;
