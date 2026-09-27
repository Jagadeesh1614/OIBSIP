import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('user_token') || '');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user_info')) || null; } catch { return null; }
  });

  const login = (t, u) => {
    setToken(t); setUser(u);
    localStorage.setItem('user_token', t);
    localStorage.setItem('user_info', JSON.stringify(u));
  };
  const logout = () => {
    setToken(''); setUser(null);
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
  };

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
