import React, { createContext, useContext, useState } from 'react';
import { usePage } from './PageContext';
import { enqueueSnackbar } from 'notistack';
// Create context
const AuthContext = createContext();

// Custom hook for using the PageContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Context Provider component
export const AuthProvider = ({ children }) => {
  const { authRedirect } = usePage();
  const [auth, setAuth] = useState(false);
  const logout = ({ mode = 'logout' }) => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setAuth(false);
    if (mode === 'bad_token')
      enqueueSnackbar('Session expired', { variant: 'info' });
    else if (mode === 'logout')
      enqueueSnackbar('Logged out', { variant: 'info' });
    authRedirect();
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
