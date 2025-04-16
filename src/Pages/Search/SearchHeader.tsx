// src/Pages/Search/SearchHeader.tsx
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading?: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  isLoading = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    // Auto focus on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="sticky top-0 bg-white shadow-sm z-10 px-4 py-3">
      <div className="max-w-lg mx-auto">
        <div 
          className={`flex items-center bg-gray-100 rounded-full px-4 py-2 
            ${isFocused ? 'ring-2 ring-blue-300' : ''}`}
        >
          <Search 
            size={20} 
            className={`mr-2 ${isLoading ? 'text-blue-500 animate-pulse' : 'text-gray-500'}`}
          />
          
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search for users..."
            className="bg-transparent flex-grow outline-none"
            aria-label="Search users"
          />
          
          {searchTerm && (
            <button 
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-200"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;