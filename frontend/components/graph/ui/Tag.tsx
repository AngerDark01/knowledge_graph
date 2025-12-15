import React from 'react';

interface TagProps {
  tag: string;
  onRemove?: (tag: string) => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ tag, onRemove, className = '' }) => {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-800 hover:bg-blue-300 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          onClick={() => onRemove(tag)}
        >
          <span className="sr-only">Remove</span>
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;