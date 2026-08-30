import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/login`, {
        email,
        password,
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setUser({ token: access_token });
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return true;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/register`, {
        email,
        password,
      });
      return await login(email, password);
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
