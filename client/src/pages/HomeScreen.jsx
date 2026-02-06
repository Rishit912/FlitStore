import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'; // 🟢 Needed to grab the search keyword
import Product from '../components/Product';
import { listProducts } from '../actions/productActions'; // Ensure this action exists

const HomeScreen = () => {
  const { keyword } = useParams(); // 🟢 Extracts the keyword from the URL
  const dispatch = useDispatch();

  // Pulling state from Redux instead of local useState
  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  useEffect(() => {
    // Every time the keyword in the URL changes, we re-fetch
    dispatch(listProducts(keyword));
  }, [dispatch, keyword]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">
        {keyword ? `Search Results for "${keyword}"` : 'Latest Products'}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl font-bold">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products && products.length > 0 ? (
            products.map((product) => (
              <Product key={product._id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">
                No Products Found
              </h2>
              <p className="text-gray-500 mt-2">Try searching for something else.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeScreen;