import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text, color = '#f8e825', onSelect, interactive = false }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = interactive && hoverValue ? hoverValue : value;

  return (
    <div className='flex items-center space-x-1 my-2'>
      {[1, 2, 3, 4, 5].map((index) => (
        <span key={index}>
          {interactive ? (
            <button
              type='button'
              onClick={() => onSelect && onSelect(index)}
              onMouseEnter={() => setHoverValue(index)}
              onMouseLeave={() => setHoverValue(0)}
              className='cursor-pointer'
              aria-label={`Rate ${index} star${index > 1 ? 's' : ''}`}
            >
              {displayValue >= index ? (
                <FaStar style={{ color }} />
              ) : (
                <FaRegStar style={{ color }} />
              )}
            </button>
          ) : (
            <span>
              {displayValue >= index ? (
                <FaStar style={{ color }} />
              ) : displayValue >= index - 0.5 ? (
                <FaStarHalfAlt style={{ color }} />
              ) : (
                <FaRegStar style={{ color }} />
              )}
            </span>
          )}
        </span>
      ))}
      <span className='text-[10px] font-semibold text-slate-500 ml-2 uppercase tracking-[0.2em]'>
        {text && text}
      </span>
    </div>
  );
};

export default Rating;