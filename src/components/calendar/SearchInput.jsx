import React from "react";

const SearchInput = ({ 
  searchQuery, 
  setSearchQuery, 
  placeholder = "Search resources...",
  withIcon = true 
}) => {
  return (
    <div className="min-w-[180px] max-w-[300px] flex-1">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs ${
          withIcon ? "pl-8 bg-no-repeat bg-[length:1rem] bg-[0.5rem_center]" : ""
        }`}
        style={
          withIcon 
            ? {
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3E%3C/path%3E%3C/svg%3E\")"
              } 
            : {}
        }
      />
    </div>
  );
};

export default SearchInput;