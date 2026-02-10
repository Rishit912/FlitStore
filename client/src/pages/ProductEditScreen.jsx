import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios'; 
import { toast } from 'react-toastify'; 
import { listProductDetails, updateProduct } from '../actions/productActions';
import { PRODUCT_UPDATE_RESET } from '../constants/productConstants';

const ProductEditScreen = () => {
  const { id: productId } = useParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false); // 🟢 Controls loading state

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
        setCountInStock(product.countInStock);
        setDescription(product.description);
      }
    }
  }, [dispatch, productId, product, navigate, successUpdate]);

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
        countInStock,
        description,
      })
    );
  };

  return (
    <div className="fs-container fs-section max-w-2xl">
      <Link to="/admin/productlist" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">
        ← BACK TO INVENTORY
      </Link>

      <div className="fs-card rounded-3xl p-8 mt-6">
        <h1 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">
          Edit <span className="text-sky-600">Product</span>
        </h1>

        {loadingUpdate && <p className="text-blue-500 font-bold mb-4 text-center">Updating...</p>}
        {errorUpdate && <p className="text-red-500 font-bold mb-4">{errorUpdate}</p>}

        {loading ? (
          <p className="text-center font-bold text-gray-400">Loading Product Data...</p>
        ) : error ? (
          <p className="text-red-500 font-bold">{error}</p>
        ) : (
          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 tracking-[0.2em]">Product Name</label>
              <input
                type="text"
                className="fs-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 tracking-[0.2em]">Price (₹)</label>
                <input
                  type="number"
                  className="fs-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 tracking-[0.2em]">Stock Count</label>
                <input
                  type="number"
                  className="fs-input"
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100">
              <label className="block text-xs font-semibold text-sky-900 uppercase mb-3 tracking-[0.2em]">Upload Image File</label>
              <input
                type="file"
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-sky-600 file:text-white hover:file:bg-sky-700 transition cursor-pointer"
                onChange={uploadFileHandler}
              />
              {uploading && (
                <div className="flex items-center mt-2 text-sky-600 text-xs font-semibold animate-pulse">
                   Uploading to server...
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 tracking-[0.2em]">Image Path</label>
              <input
                type="text"
                className="fs-input bg-slate-100 text-slate-500"
                value={image}
                readOnly // Better to make this read-only if they use the uploader
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 tracking-[0.2em]">Brand</label>
                <input
                  type="text"
                  className="fs-input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 tracking-[0.2em]">Category</label>
                <input
                  type="text"
                  className="fs-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 tracking-[0.2em]">Description</label>
              <textarea
                rows="4"
                className="fs-input resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={uploading} // 🟢 Disable button while uploading
              className={`w-full text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 mt-6 ${uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-sky-600'}`}
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