import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchBox = () => {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (keyword.length > 1) {
        const { data } = await axios.get(`/api/products/suggestions?keyword=${keyword}`);
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [keyword]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
      setSuggestions([]); // Clear suggestions on search
    }
  };

  return (
    <div className="relative w-full max-w-md mx-4">
      <form onSubmit={submitHandler} className="flex items-center">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search Products..."
          className="w-full bg-gray-100 border border-gray-200 rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button type="submit" className="p-2 ml-[-40px] text-gray-400 hover:text-blue-600">
          <i className="fas fa-search"></i>
        </button>
      </form>

      {/* Suggestion Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl mt-2 py-2 z-50">
          {suggestions.map((s) => (
            <div
              key={s._id}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-bold text-gray-700"
              onClick={() => {
                setKeyword(s.name);
                navigate(`/search/${s.name}`);
                setSuggestions([]);
              }}
            >
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;