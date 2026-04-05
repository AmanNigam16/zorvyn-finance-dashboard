import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProfile } from '../services/api/auth.api';
import { clearAuthToken, getAuthToken } from '../services/api/client';

const StateContext = createContext();

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor] = useState('rgb(40, 110, 250)');
  const [currentMode, setCurrentMode] = useState('Light');
  const [activeMenu, setActiveMenu] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshAuthUser = async () => {
    if (!getAuthToken()) {
      setAuthUser(null);
      setAuthLoading(false);
      return null;
    }

    setAuthLoading(true);

    try {
      const data = await getProfile();
      const user = data?.user || null;
      setAuthUser(user);
      return user;
    } catch (_error) {
      clearAuthToken();
      setAuthUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = () => {
    clearAuthToken();
    setAuthUser(null);
  };

  useEffect(() => {
    refreshAuthUser();
  }, []);

  return (
    <StateContext.Provider
      value={{
        currentColor,
        currentMode,
        activeMenu,
        screenSize,
        authUser,
        authLoading,
        setScreenSize,
        setActiveMenu,
        setCurrentMode,
        refreshAuthUser,
        signOut,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
