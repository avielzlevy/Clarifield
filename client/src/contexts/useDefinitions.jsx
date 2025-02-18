import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const DefinitionsContext = createContext();

export const DefinitionsProvider = ({ children }) => {
  const [definitions, setDefinitions] = useState({});

  const fetchDefinitions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/definitions`);
      setDefinitions(response.data);
    } catch (error) {
      console.error('Error fetching definitions:', error);
    }
  };

  useEffect(() => {
    fetchDefinitions();
  }, []);

  return (
    <DefinitionsContext.Provider value={{ definitions, fetchDefinitions, setDefinitions }}>
      {children}
    </DefinitionsContext.Provider>
  );
};

export const useDefinitions = () => {
  return useContext(DefinitionsContext);
};
