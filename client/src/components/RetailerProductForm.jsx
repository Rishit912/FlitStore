import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

const APPAREL_CATEGORY_KEYWORDS = [
  'cloth',
  'clothing',
  'apparel',
  'garment',
  'shirt',
  't-shirt',
  'tshirt',
  'pant',
  'jean',
  'dress',
  'kurti',
  'saree',
  'skirt',
  'top',
  'jacket',
  'hoodie',
  'trouser',
  'shorts',
  'wear',
];

const isApparelCategory = (value) => {
  const normalized = String(value || '').toLowerCase();
  return APPAREL_CATEGORY_KEYWORDS.some((keyword) => normalized.includes(keyword));
};

const RetailerProductForm = ({ onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [size, setSize] = useState(initialData?.size || '');
  const [countInStock, setCountInStock] = useState(initialData?.countInStock ?? 0);
  const [image, setImage] = useState(initialData?.image || '');
  const [uploading, setUploading] = useState(false);
  const showSizeField = isApparelCategory(category);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data.image);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, price, description, brand, category, size: showSizeField ? size : '', countInStock, image });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-[11px] font-black uppercase tracking-[0.32em] text-muted">Product Name</label>
        <input
          type="text"
          className="app-input w-full rounded-2xl bg-surface-2 shadow-sm"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-black uppercase tracking-[0.32em] text-muted">Price (₹)</label>
        <input
          type="number"
          className="app-input w-full rounded-2xl bg-surface-2 shadow-sm"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-black uppercase tracking-[0.32em] text-muted">Description</label>
        <textarea
          className="app-input w-full rounded-2xl bg-surface-2 shadow-sm"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-[11px] font-black uppercase tracking-[0.32em] text-muted">Brand</label>
          <input
            type="text"
            className="app-input w-full rounded-2xl bg-surface-2 shadow-sm"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder="e.g. Nike"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-black uppercase tracking-[0.32em] text-muted">Category</label>
          <input
            type="text"
            className="app-input w-full rounded-2xl bg-surface-2 shadow-sm"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="e.g. Shoes"
          />
        </div>
      </div>
      {showSizeField && (
        <div className="space-y-2">
          <label className="block text-[11px] font-black uppercase tracking-[0.32em] text-muted">Size</label>
          <select
            className="app-input w-full rounded-2xl bg-surface-2 shadow-sm"
            value={size}
            onChange={e => setSize(e.target.value)}
            required={showSizeField}
          >
            <option value="">Select size</option>
            {SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <p className="text-xs text-muted">Size is shown only for apparel-style categories.</p>
        </div>
      )}
      <div className="space-y-2">
        <label className="block text-[11px] font-black uppercase tracking-[0.32em] text-muted">Stock Count</label>
        <input
          type="number"
          min="0"
          className="app-input w-full rounded-2xl bg-surface-2 shadow-sm"
          value={countInStock}
          onChange={e => setCountInStock(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-black uppercase tracking-[0.32em] text-muted">Product Image</label>
        <div className="rounded-2xl border-2 border-dashed border-app bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface)] p-4">
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:opacity-90"
            onChange={handleImageChange}
          />
          <p className="mt-3 text-xs text-muted leading-6">Upload a clear product image for best results. If you skip it, a default SVG will appear automatically.</p>
          {uploading && <p className="mt-2 text-xs font-bold text-primary">Uploading image...</p>}
          {image && (
            <div className="mt-4 inline-flex rounded-2xl bg-surface p-2 shadow-sm border border-app">
              <img src={image} alt="Preview" className="h-32 w-32 object-cover rounded-xl" />
            </div>
          )}
        </div>
      </div>
      <button type="submit" disabled={uploading} className="app-btn w-full py-3 font-bold rounded-2xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
        {initialData ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
};

export default RetailerProductForm;
