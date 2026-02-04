import React  from "react";

import { Link } from "react-router-dom";

import { FaStar } from "react-icons/fa";

const Product = ({ product }) => {
    return (
       <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
      <Link to={`/product/${product._id}`}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-64 object-cover object-center"
        />
      </Link> 
        

        <div className="p-5">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-bold text-gray-800 hover:text-blue-600 truncate">
            {product.name}
          </h3>
        </Link>

         
         <div className="flex items-center mt-2 mb-4">
          <div className="flex text-yellow-400">
             {/* Simple Rating Logic */}
             {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < product.rating ? 'text-yellow-400' : 'text-gray-300'} />
             ))}
          </div>
          <span className="text-gray-500 text-sm ml-2">{product.numReviews} reviews</span>
        </div></div>

         <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
            Add to Cart
          </button>
        </div>
      </div>

    );
}

export default Product;