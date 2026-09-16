import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dh_user')) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dh_token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('dh_token'));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('dh_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('dh_token');
        localStorage.removeItem('dh_user');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const persist = (nextToken, nextUser) => {
    localStorage.setItem('dh_token', nextToken);
    localStorage.setItem('dh_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (email, password) => {
    const { data } = await authService.login({ email, password });
    persist(data.token, data.user);
    return data;
  };

  const signup = async (payload) => {
    const { data } = await authService.signup(payload);
    persist(data.token, data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('dh_token');
    localStorage.removeItem('dh_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await authService.me();
    setUser(data.user);
    localStorage.setItem('dh_user', JSON.stringify(data.user));
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
