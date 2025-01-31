import React, { createContext, useContext, useState } from 'react';

// Create context
const RtlContext = createContext();

// Custom hook for using the PageContext
export const useRtl = () => {
  return useContext(RtlContext);
};

// Context Provider component
export const RtlProvider = ({ children }) => {
  const [rtl, setRtl] = useState(false);
  const [rtlLoading, setRtlLoading] = useState(false);

  return (
    <RtlContext.Provider value={{ rtl, setRtl, rtlLoading, setRtlLoading }}>
      {children}
    </RtlContext.Provider>
  );
};
