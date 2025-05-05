import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('userRole');
    if (token && savedRole) {
      setIsAuthenticated(true);
      setUserRole(savedRole);
    }
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Attempting login with:', { username });
      
      // Make API call to login endpoint
      const response = await api.post('/api/users/login/', {
        username,
        password
      });
      
      console.log('Login response:', response.data);
      
      // Save token and user info
      const { access, role } = response.data;
      if (!access) {
        throw new Error('No access token in response');
      }
      
      localStorage.setItem('token', access);
      localStorage.setItem('userRole', role || 'user');
      
      setIsAuthenticated(true);
      setUserRole(role || 'user');
      setError(null);
      
      console.log('Login successful, stored token and role:', {
        token: access,
        role: role
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      setError(errorMessage);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      login, 
      logout,
      error 
    }}>
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