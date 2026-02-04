import React ,{ useState , useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { FaStar , FaArrowLeft } from 'react-icons/fa';
import { addToCart } from '../slices/cartSlice';

const ProductScreen = () => {
    const [product, setProduct] = useState({}); // start with an empty object
    const [qty, setQty] = useState(1); // default quantity is 1

    const { id } = useParams(); // get the product ID from the URL params url is /product/123 this gets 123
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            
            //ask server for only this specific product
                const { data } = await axios.get(`/api/products/${id}`);
            setProduct(data);
        };

        fetchProduct();
    } , [id]);   //dependency array includes id so it refetches if id changes


   const addToCartHandler = () => {
    console.log("1. Button was clicked!"); // Debug 1
    console.log("2. Qty is:", qty);        // Debug 2
    
    dispatch(addToCart({ ...product, qty })); 
    
    console.log("3. Dispatch sent!");      // Debug 3
    navigate('/cart'); 
  };

  
    
    
    return (
        <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-6 w-fit">
        <FaArrowLeft className="mr-2" /> Go Back
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Side: Big Image */}
        <div className="bg-white rounded-xl shadow-lg p-2">
          <img src={product.image} alt={product.name} className="w-full h-auto rounded-lg" />
        </div>

        {/* Right Side: Details & Cart */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h2>
          
          <div className="flex items-center mb-4">
             <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                   <FaStar key={i} className={i < product.rating ? 'text-yellow-400' : 'text-gray-300'} />
                ))}
             </div>
             <span className="text-gray-500">({product.numReviews} reviews)</span>
          </div>

          <p className="text-2xl font-bold text-blue-600 mb-4">₹{product.price}</p>
          
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* The "Add to Cart" Box */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-700">Status:</span>
              <span className={`font-bold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>


           {/* Quantity Selector - Only shows if in stock */}
            {product.countInStock > 0 && (
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-700">Quantity:</span>
                <select 
                  value={qty} 
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="border rounded-md px-3 py-1"
                >
                  {/* Create options [1, 2, 3...] based on stock count */}
                  {[...Array(product.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
               



            {/* Add to Cart Button */}
            <button 
              onClick={addToCartHandler}
              disabled={product.countInStock === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductScreen;