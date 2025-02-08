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
  //automaticly redirect to the home page if nonauthenticated user is on a page that requires authentication
  const authRedirect = () => {
    const authedPages = ['settings', 'analytics', 'logs'];
    if (!localStorage.getItem('token') && authedPages.includes(page)) {
      setPage('home');
    }
  };
  authRedirect()
  return (
    <PageContext.Provider value={{ page, setPage,authRedirect }}>
      {children}
    </PageContext.Provider>
  );
};
