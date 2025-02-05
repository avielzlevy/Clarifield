import React, { createContext, useContext, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
// Create context
const AuthContext = createContext();

// Custom hook for using the PageContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Context Provider component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuth(false);
    enqueueSnackbar('Logged out or session expired', { variant: 'info' });
  };
  const login = (token, username) => {
    localStorage.setItem('token', token);
    if (username)
      localStorage.setItem('username', username);
    setAuth(true);
  };
  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
