import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text, color = 'var(--accent-1)', onSelect, interactive = false }) => {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = interactive && hoverValue ? hoverValue : value;
  const resolveStarValue = (event, index) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - left;
    return clickX <= width / 2 ? index - 0.5 : index;
  };

  const renderStar = (index) => {
    if (displayValue >= index) return <FaStar style={{ color }} />;
    if (displayValue >= index - 0.5) return <FaStarHalfAlt style={{ color }} />;
    return <FaRegStar style={{ color }} />;
  };

  return (
    <div className='flex items-center space-x-1 my-2'>
      {[1, 2, 3, 4, 5].map((index) => (
        <span key={index}>
          {interactive ? (
            <button
              type='button'
              onClick={(event) => onSelect && onSelect(resolveStarValue(event, index))}
              onMouseMove={(event) => setHoverValue(resolveStarValue(event, index))}
              onMouseLeave={() => setHoverValue(0)}
              className='cursor-pointer'
              aria-label={`Rate ${index - 0.5} to ${index} stars`}
            >
              {renderStar(index)}
            </button>
          ) : (
            <span>
              {renderStar(index)}
            </span>
          )}
        </span>
      ))}
      <span className='text-xs font-bold text-muted ml-2 uppercase tracking-tighter'>
        {text && text}
      </span>
    </div>
  );
};

export default Rating;