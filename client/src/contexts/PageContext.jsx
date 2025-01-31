import React, { createContext, useContext, useState } from 'react';

// Create context
const PageContext = createContext();

// Custom hook for using the PageContext
export const usePage = () => {
  return useContext(PageContext);
};

// Context Provider component
export const PageProvider = ({ children }) => {
  const [page, setPage] = useState('home');

  return (
    <PageContext.Provider value={{ page, setPage }}>
      {children}
    </PageContext.Provider>
  );
};
