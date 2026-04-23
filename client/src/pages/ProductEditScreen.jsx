import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import { listProductDetails, updateProduct } from '../actions/productActions';
import { PRODUCT_UPDATE_RESET } from '../constants/productConstants';

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

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false); // 🟢 Controls loading state
  const [categories, setCategories] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const productUpdate = useSelector((state) => state.productUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = productUpdate;

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET });
      toast.success('Product Updated Successfully!');
      navigate('/admin/productlist');
    } else {
      if (!product || !product.name || product._id !== productId) {
        dispatch(listProductDetails(productId));
      } else {
        setName(product.name);
        setPrice(product.price);
        setImage(product.image);
        setBrand(product.brand);
        setCategory(product.category);
        setSize(product.size || '');
        setCountInStock(product.countInStock);
        setDescription(product.description);
      }
    }
  }, [dispatch, productId, product, navigate, successUpdate]);
  const showSizeField = isApparelCategory(category);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products/categories');
        setCategories(data || []);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // 🟢 Fixed Upload Handler
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true); // Start loading

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await axios.post('/api/upload', formData, config);
      
      setImage(data.image); // Set the returned path
      setUploading(false); // Stop loading
      toast.success('Image Uploaded Successfully');
    } catch (err) {
      console.error(err);
      setUploading(false);
      toast.error(err?.response?.data?.message || 'Image upload failure');
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      updateProduct({
        _id: productId,
        name,
        price,
        image,
        brand,
        category,
        size: showSizeField ? size : '',
        countInStock,
        description,
      })
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
      <Link to="/admin/productlist" className="text-sm font-bold text-muted hover:text-foreground transition">
        ← BACK TO INVENTORY
      </Link>

      <div className="app-card rounded-3xl p-8 mt-6">
        <h1 className="text-2xl font-black text-foreground mb-8 uppercase tracking-tight">
          Edit <span className="text-primary">Product</span>
        </h1>

        {loadingUpdate && <p className="text-primary font-bold mb-4 text-center">Updating...</p>}
        {errorUpdate && <p className="text-red-500 font-bold mb-4">{errorUpdate}</p>}

        {loading ? (
          <p className="text-center font-bold text-muted">Loading Product Data...</p>
        ) : error ? (
          <p className="text-red-500 font-bold">{error}</p>
        ) : (
          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Product Name</label>
              <input
                type="text"
                className="w-full app-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Price (₹)</label>
                <input
                  type="number"
                  className="w-full app-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Stock Count</label>
                <input
                  type="number"
                  className="w-full app-input"
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-surface-2 p-4 rounded-2xl border border-app">
              <label className="block text-xs font-black text-foreground uppercase mb-3 tracking-widest">Upload Image File</label>
              <input
                type="file"
                className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[color:var(--primary)] file:text-white hover:file:bg-[color:var(--primary-600)] transition cursor-pointer"
                onChange={uploadFileHandler}
              />
              {uploading && (
                <div className="flex items-center mt-2 text-primary text-xs font-bold animate-pulse">
                   Uploading to server...
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Image Path</label>
              <input
                type="text"
                className="w-full app-input bg-surface-2 text-muted"
                value={image}
                readOnly // Better to make this read-only if they use the uploader
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Brand</label>
                <input
                  type="text"
                  className="w-full app-input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Category</label>
                <input
                  type="text"
                  className="w-full app-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  list="category-options"
                />
                <datalist id="category-options">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            {showSizeField && (
              <div>
                <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Size</label>
                <select
                  className="w-full app-input"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  required={showSizeField}
                >
                  <option value="">Select size</option>
                  {SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-muted uppercase mb-2 tracking-widest">Description</label>
              <textarea
                rows="4"
                className="w-full app-input resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={uploading} // 🟢 Disable button while uploading
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-app active:scale-95 mt-6 ${uploading ? 'bg-gray-400 cursor-not-allowed text-white' : 'app-btn'}`}
            >
              {uploading ? 'Please Wait...' : 'SAVE CHANGES'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductEditScreen;