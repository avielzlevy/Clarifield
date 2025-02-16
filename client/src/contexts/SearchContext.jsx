import React, { createContext, useContext, useState, useMemo } from 'react';

// Default context value for improved intellisense and fallback behavior
const defaultSearchContextValue = {
  search: false,
  setSearch: () => {},
};

const SearchContext = createContext(defaultSearchContextValue);

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [search, setSearch] = useState(false);

  const value = useMemo(() => ({ search, setSearch }), [search]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
