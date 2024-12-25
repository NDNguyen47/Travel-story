import React from 'react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  handleSearch,
  onClearSearch,
}) => {
  return (
    <div className="w-80 flex items-center px-4 bg-slate-100 rounded-md">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full text-xs bg-transparent py-[11px] outline-none"
      />

      <div className="flex items-center ml-2"> 
        <FaMagnifyingGlass
          className="text-gray-500 cursor-pointer hover:text-black"
          onClick={handleSearch}
        />
        {value && (
          <FaXmark
            className="text-gray-500 cursor-pointer hover:text-black ml-2" 
            onClick={onClearSearch}
          />
        )}
      </div>
    </div>
  );
};

export default SearchBar;