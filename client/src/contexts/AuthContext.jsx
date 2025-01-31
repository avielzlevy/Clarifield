import React, { createContext, useContext, useState } from 'react';

// Create context
const AuthContext = createContext();

// Custom hook for using the PageContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Context Provider component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
