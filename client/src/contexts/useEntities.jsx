import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const EntitiesContext = createContext();

export const EntitiesProvider = ({ children }) => {
  const [entities, setEntities] = useState({});

  const fetchEntities = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/entities`);
      setEntities(response.data);
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  return (
    <EntitiesContext.Provider value={{ entities, fetchEntities, setEntities }}>
      {children}
    </EntitiesContext.Provider>
  );
};

export const useEntities = () => {
  return useContext(EntitiesContext);
};
