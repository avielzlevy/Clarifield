import React, { createContext, useContext, useState } from 'react';

// Create context
const SearchContext = createContext();

// Custom hook for using the PageContext
export const useSearch = () => {
  return useContext(SearchContext);
};

// Context Provider component
export const SearchProvider = ({ children }) => {
  const [search, setSearch] = useState(false);
  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      {children}
    </SearchContext.Provider>
  );
};
