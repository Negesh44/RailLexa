import React, { createContext, useContext, useState, useEffect } from 'react';
import { ACCOUNTS, USER_ROLES } from '../data/credentials';

const AuthContext = createContext(null);

const STORAGE_KEY = 'raillexa_user_session';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load session', e);
    }
    // Strict authentication required: must log in first
    return null;
  });

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const login = (userIdOrUsername, password) => {
    const cleanId = userIdOrUsername.trim().toLowerCase();
    const found = ACCOUNTS.find(
      acc =>
        (acc.userId.toLowerCase() === cleanId || acc.username.toLowerCase() === cleanId) &&
        acc.password === password
    );

    if (found) {
      setCurrentUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      showNotification(`Welcome back, ${found.name}! Signed in as ${found.role === USER_ROLES.CONTROLLER ? 'Traffic Controller' : 'Department Engineer'}`, 'success');
      return { success: true, user: found };
    }

    return {
      success: false,
      error: 'Invalid User ID or Password. Please verify your credentials or use the Quick Demo Login buttons below.'
    };
  };

  const loginAsDemo = (accountEmail) => {
    const found = ACCOUNTS.find(acc => acc.userId === accountEmail);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      showNotification(`Switched role to ${found.name} (${found.designation})`, 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    const prevName = currentUser?.name;
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    showNotification(`Logged out ${prevName || ''}. Please log in again to continue.`, 'info');
  };

  const isController = currentUser?.role === USER_ROLES.CONTROLLER;
  const isDepartment = currentUser?.role === USER_ROLES.DEPARTMENT;
  const userDepartment = currentUser?.departmentId;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        loginAsDemo,
        logout,
        isController,
        isDepartment,
        userDepartment,
        notification,
        showNotification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
