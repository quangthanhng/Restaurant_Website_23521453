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
      className="w-full max-w-md rounded-2xl border border-savoria-gold bg-neutral-900/95 p-8 shadow-2xl"
      onSubmit={onSubmit}
    >
      <h3 className="mb-6 text-2xl font-serif font-bold text-savoria-gold tracking-logo text-center drop-shadow">{editCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
      <div className="mb-4">
        <label className="mb-1 block font-semibold text-savoria-gold">Tên danh mục</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white placeholder:text-neutral-600 focus:border-savoria-gold focus:outline-none transition-all"
          required
          placeholder="Nhập tên danh mục"
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block font-semibold text-savoria-gold">Mô tả</label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white placeholder:text-neutral-600 focus:border-savoria-gold focus:outline-none transition-all"
          placeholder="Nhập mô tả"
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block font-semibold text-savoria-gold">Trạng thái</label>
        <select
          name="status"
          value={form.status}
          onChange={onChange}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white focus:border-savoria-gold focus:outline-none transition-all"
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Ẩn</option>
        </select>
      </div>
      <div className="mb-6">
        <label className="mb-1 block font-semibold text-savoria-gold">Ảnh</label>
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-savoria-gold file:px-4 file:py-2 file:text-neutral-900 hover:file:bg-neutral-900 hover:file:text-savoria-gold focus:border-savoria-gold focus:outline-none transition-all"
        />
        {editCategory && editCategory.images && (
          <img src={editCategory.images} alt="preview" className="w-20 h-20 mt-3 object-cover rounded-lg border border-neutral-800 shadow" />
        )}
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-5 py-2 text-neutral-300 font-semibold shadow transition-all hover:bg-neutral-900 hover:text-savoria-gold"
          onClick={onCancel}
        >Hủy</button>
        <button
          type="submit"
          className="rounded-lg border border-savoria-gold bg-savoria-gold px-5 py-2 text-neutral-900 font-semibold shadow transition-all hover:bg-neutral-900 hover:text-savoria-gold"
        >{editCategory ? 'Cập nhật' : 'Thêm mới'}</button>
      </div>
    </form>
  );
};

export default CategoryForm;
